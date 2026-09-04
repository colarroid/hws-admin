"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/data/admin";
import { normaliseWebsite } from "@/lib/website";
import {
  AUDIENCES,
  AVAILABILITY,
  COSTS,
  COVERAGE,
  FORMATS,
  ORGANISATION_TYPES,
  POSTING_FREQUENCY,
  SOLUTION_KINDS,
} from "@/lib/design/taxonomy";
import type { FormState } from "@/app/actions";

const slugs = (vocabulary: readonly { slug: string }[]) =>
  new Set(vocabulary.map((entry) => entry.slug));

function known(values: FormDataEntryValue[], vocabulary: readonly { slug: string }[]) {
  const allowed = slugs(vocabulary);
  return values.map(String).filter((value) => allowed.has(value));
}

function one(
  value: FormDataEntryValue | null,
  vocabulary: readonly { slug: string }[],
) {
  const slug = String(value ?? "");
  return slugs(vocabulary).has(slug) ? slug : null;
}

function text(value: FormDataEntryValue | null, max = 2000) {
  const trimmed = String(value ?? "").trim();
  return trimmed ? trimmed.slice(0, max) : null;
}

const schema = z.object({
  name: z.string().trim().min(1, "Give the organisation a name."),
  types: z
    .array(z.enum(ORGANISATION_TYPES.map((t) => t.slug) as [string, ...string[]]))
    .min(1, "Pick at least one kind of organisation."),
});

/**
 * An organisation entered by HWS, with nobody behind it.
 *
 * Most of the PathGrid map will never sign up. Business Gateway, NHS Inform,
 * Public Health Scotland and Skills Development Scotland are standing
 * infrastructure, and waiting for them to make an account and fill in a form
 * would mean an empty platform.
 *
 * So this writes the organisation directly rather than through
 * `create_organisation`, which exists to bind a new organisation to the
 * account that made it. There is no account here, and that is the point:
 * `organisation_is_unclaimed` stays true until somebody is invited in.
 *
 * Verified on creation, because an admin typing an organisation in *is* the
 * check. Nothing else would make sense: the queue exists so somebody reads
 * what a stranger claimed, and there is no stranger.
 */
export async function createOrganisation(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();

  const parsed = schema.safeParse({
    name: formData.get("name"),
    types: formData.getAll("types").map(String),
  });

  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const website = normaliseWebsite(String(formData.get("website") ?? ""));
  if (!website.ok) return { error: website.error };

  const primaryZone = String(formData.get("primaryZone") ?? "");
  if (!primaryZone) return { error: "Choose a primary Access Zone." };

  const alsoZones = formData
    .getAll("alsoZones")
    .map(String)
    .filter((id) => id && id !== primaryZone);

  if (alsoZones.length > 2) {
    return { error: "An organisation can have at most two further zones." };
  }

  const coverage = one(formData.get("coverage"), COVERAGE);
  const costOptions = known(formData.getAll("costOptions"), COSTS);
  const availability = one(formData.get("availability"), AVAILABILITY);
  const audiences = known(formData.getAll("audiences"), AUDIENCES);

  const supabase = await createClient();

  const { data: created, error } = await supabase
    .from("organisations")
    .insert({
      name: parsed.data.name,
      types: parsed.data.types,
      website: website.value,
      place: text(formData.get("place"), 200),
      blurb: text(formData.get("blurb"), 400),
      mission: text(formData.get("mission")),
      unique_offer: text(formData.get("uniqueOffer")),
      audiences,
      service_kinds: known(formData.getAll("serviceKinds"), SOLUTION_KINDS),
      access_routes: known(formData.getAll("accessRoutes"), FORMATS),
      cost_options: costOptions,
      cost_note: costOptions.includes("there_is_a_cost")
        ? text(formData.get("costNote"), 400)
        : null,
      coverage,
      coverage_note:
        coverage && coverage !== "scotland_wide" && coverage !== "online_only"
          ? text(formData.get("coverageNote"), 400)
          : null,
      eligibility: text(formData.get("eligibility")),
      not_eligible: text(formData.get("notEligible")),
      posting_frequency: one(formData.get("postingFrequency"), POSTING_FREQUENCY),
      availability,
      status: "verified",
      verified_at: new Date().toISOString(),
      profile_updated_at: new Date().toISOString(),
      // Never queued, because it was never a request. Leaving this null would
      // have put an organisation HWS typed in itself at the top of a list of
      // things waiting on HWS.
      verification_requested_at: null,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  const { error: zoneError } = await supabase.from("organisation_zones").insert([
    { organisation_id: created.id, zone_id: primaryZone, role: "primary" },
    ...alsoZones.map((zone_id) => ({
      organisation_id: created.id,
      zone_id,
      role: "also" as const,
    })),
  ]);

  if (zoneError) return { error: zoneError.message };

  const markets = formData.getAll("markets").map(String).filter(Boolean);
  if (markets.length > 0) {
    const { error: marketError } = await supabase
      .from("organisation_markets")
      .insert(
        markets.map((market_id) => ({
          organisation_id: created.id,
          market_id,
        })),
      );

    if (marketError) return { error: marketError.message };
  }

  revalidatePath("/organisations");
  redirect(`/organisations/${created.id}`);
}

/**
 * Reclassify one that already exists.
 *
 * Zones and markets only. Everything else about an organisation is its own
 * account of itself and is edited in its own portal; this is HWS's layer on
 * top, and the two are kept apart so an admin cannot quietly rewrite what an
 * organisation said about itself.
 */
export async function saveClassification(formData: FormData) {
  await requireAdmin();

  const organisationId = String(formData.get("organisationId") ?? "");
  if (!organisationId) return;

  const primaryZone = String(formData.get("primaryZone") ?? "");
  const alsoZones = formData
    .getAll("alsoZones")
    .map(String)
    .filter((id) => id && id !== primaryZone)
    .slice(0, 2);

  const supabase = await createClient();

  if (primaryZone) {
    // Rewritten wholesale rather than diffed. The set is at most three, and a
    // partial write would leave an organisation with two primaries, which the
    // unique index would then refuse for reasons nobody could see.
    const { error: clearError } = await supabase
      .from("organisation_zones")
      .delete()
      .eq("organisation_id", organisationId);

    if (clearError) throw clearError;

    const { error: zoneError } = await supabase
      .from("organisation_zones")
      .insert([
        { organisation_id: organisationId, zone_id: primaryZone, role: "primary" },
        ...alsoZones.map((zone_id) => ({
          organisation_id: organisationId,
          zone_id,
          role: "also" as const,
        })),
      ]);

    if (zoneError) throw zoneError;
  }

  const markets = formData.getAll("markets").map(String).filter(Boolean);

  const { error: clearMarkets } = await supabase
    .from("organisation_markets")
    .delete()
    .eq("organisation_id", organisationId);

  if (clearMarkets) throw clearMarkets;

  if (markets.length > 0) {
    const { error: marketError } = await supabase
      .from("organisation_markets")
      .insert(
        markets.map((market_id) => ({
          organisation_id: organisationId,
          market_id,
        })),
      );

    if (marketError) throw marketError;
  }

  revalidatePath(`/organisations/${organisationId}`);
  redirect(`/organisations/${organisationId}?saved=classification`);
}

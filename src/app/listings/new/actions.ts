"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/data/admin";
import { COSTS, FORMATS, SOLUTION_KINDS } from "@/lib/design/taxonomy";
import type { FormState } from "@/app/actions";

const KINDS = SOLUTION_KINDS.map((k) => k.slug) as [string, ...string[]];
const COST_SLUGS = COSTS.map((c) => c.slug) as [string, ...string[]];
const FORMAT_SLUGS = new Set<string>(FORMATS.map((f) => f.slug));

const schema = z.object({
  organisationId: z.string().uuid("Choose an organisation."),
  name: z.string().trim().min(1, "Give the solution a name."),
  kind: z.enum(KINDS, { message: "Pick what kind of thing this is." }),
  blurb: z.string().trim().optional(),
  whoFor: z.string().trim().optional(),
  whatToExpect: z.string().trim().optional(),
  cost: z.enum(COST_SLUGS, { message: "Say what it costs." }),
  place: z.string().trim().optional(),
  deadline: z.string().trim().optional(),
  applyUrl: z.string().trim().optional(),
});

/**
 * A listing written by HWS on an organisation's behalf.
 *
 * The same row an organisation's own form writes. There is no separate kind
 * of listing and no marker on the woman-facing side saying who typed it: she
 * is being told that this organisation offers this, and that is either true
 * or it is not, whoever entered it.
 *
 * The audit trail is where the difference is recorded. `listing_reviews` gets
 * a row naming the admin, so a listing an organisation does not recognise can
 * be traced to the person who added it rather than becoming a mystery.
 *
 * The verification gate in RLS does not apply here: `listings_member_create`
 * checks membership, and an admin is not a member. `listings_admin_all` is
 * what lets this through, which is correct — the gate exists so an unchecked
 * organisation cannot publish, not so HWS cannot.
 */
export async function saveSolutionForOrganisation(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const admin = await requireAdmin();

  const parsed = schema.safeParse({
    organisationId: formData.get("organisationId"),
    name: formData.get("name"),
    kind: formData.get("kind"),
    blurb: formData.get("blurb"),
    whoFor: formData.get("whoFor"),
    whatToExpect: formData.get("whatToExpect"),
    cost: formData.get("cost"),
    place: formData.get("place"),
    deadline: formData.get("deadline"),
    applyUrl: formData.get("applyUrl") ?? "",
  });

  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const publish = String(formData.get("intent") ?? "") === "publish";
  const formats = formData
    .getAll("formats")
    .map(String)
    .filter((slug) => FORMAT_SLUGS.has(slug));

  const supabase = await createClient();

  const { data: created, error } = await supabase
    .from("listings")
    .insert({
      organisation_id: parsed.data.organisationId,
      name: parsed.data.name,
      kind: parsed.data.kind,
      blurb: parsed.data.blurb || null,
      who_for: parsed.data.whoFor || null,
      what_to_expect: parsed.data.whatToExpect || null,
      cost: parsed.data.cost,
      formats,
      place: parsed.data.place || null,
      deadline: parsed.data.deadline || null,
      apply_url: parsed.data.applyUrl || null,
      status: publish ? "live" : "draft",
      // Publishing is the first confirmation. Leaving it null would make a
      // listing added today count as stale the moment it went live.
      last_confirmed_at: publish ? new Date().toISOString() : null,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  const situations = formData.getAll("situations").map(String).filter(Boolean);
  if (situations.length > 0) {
    const { error: tagError } = await supabase
      .from("listing_situations")
      .insert(
        situations.map((situation_id) => ({
          listing_id: created.id,
          situation_id,
        })),
      );

    if (tagError) return { error: tagError.message };
  }

  // Append-only, like every other action on a listing. Who added this on
  // whose behalf is exactly the kind of thing somebody will need to look up.
  await supabase.from("listing_reviews").insert({
    listing_id: created.id,
    actor_id: admin.id,
    action: "submitted",
    changes: { added_by_admin: true, published: publish },
  });

  revalidatePath("/listings");
  redirect(`/listings/${created.id}`);
}

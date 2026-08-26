"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/data/admin";
import { toSlug } from "@/lib/data/taxonomy";

const ZONES = "/taxonomy/zones";
const SITUATIONS = "/taxonomy/situations";

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

/* -------------------------------------------------------------------------
   Access Zones
   ------------------------------------------------------------------------- */

export async function createZone(formData: FormData) {
  await requireAdmin();

  const name = text(formData, "name");
  const focus = text(formData, "focus");
  if (!name || !focus) redirect(`${ZONES}?error=missing`);

  const supabase = await createClient();

  const { data: last } = await supabase
    .from("access_zones")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await supabase.from("access_zones").insert({
    slug: toSlug(name),
    name,
    focus,
    sort_order: (last?.sort_order ?? 0) + 1,
  });

  if (error) redirect(`${ZONES}?error=${encodeURIComponent(error.message)}`);

  revalidatePath(ZONES);
  redirect(ZONES);
}

/**
 * Rename or re-describe a zone.
 *
 * The slug is never touched. Every organisation and listing holds it, and the
 * whole point of separating name from identity is that a zone can be renamed
 * without anything losing its place.
 */
export async function updateZone(formData: FormData) {
  await requireAdmin();

  const id = text(formData, "id");
  const name = text(formData, "name");
  const focus = text(formData, "focus");
  const sortOrder = Number(text(formData, "sortOrder"));

  if (!id || !name || !focus) redirect(`${ZONES}?error=missing`);

  const supabase = await createClient();
  const { error } = await supabase
    .from("access_zones")
    .update({
      name,
      focus,
      sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
    })
    .eq("id", id);

  if (error) redirect(`${ZONES}?error=${encodeURIComponent(error.message)}`);

  revalidatePath(ZONES);
  redirect(ZONES);
}

/**
 * Retire a zone, moving everything attached to its successor.
 *
 * The brief requires a defined path for the organisations and listings on a
 * retired zone. Without the move they keep a zone women can no longer be
 * matched through, which is a silent way to make listings unfindable.
 *
 * The move happens before the zone is marked retired, so a failure part way
 * leaves the zone live and everything still reachable.
 */
export async function retireZone(formData: FormData) {
  await requireAdmin();

  const id = text(formData, "id");
  const successorId = text(formData, "successorId");

  if (!id || !successorId || id === successorId) {
    redirect(`${ZONES}?error=successor`);
  }

  const supabase = await createClient();

  // Anything already on the successor would collide on the primary key, so
  // those rows are dropped rather than moved.
  const { data: existingOrgs } = await supabase
    .from("organisation_zones")
    .select("organisation_id")
    .eq("zone_id", successorId);
  const orgsAlreadyThere = new Set(
    (existingOrgs ?? []).map((r) => r.organisation_id),
  );

  const { data: movingOrgs } = await supabase
    .from("organisation_zones")
    .select("organisation_id")
    .eq("zone_id", id);

  for (const row of movingOrgs ?? []) {
    if (orgsAlreadyThere.has(row.organisation_id)) {
      await supabase
        .from("organisation_zones")
        .delete()
        .eq("zone_id", id)
        .eq("organisation_id", row.organisation_id);
    } else {
      await supabase
        .from("organisation_zones")
        .update({ zone_id: successorId })
        .eq("zone_id", id)
        .eq("organisation_id", row.organisation_id);
    }
  }

  const { data: existingListings } = await supabase
    .from("listing_zones")
    .select("listing_id")
    .eq("zone_id", successorId);
  const listingsAlreadyThere = new Set(
    (existingListings ?? []).map((r) => r.listing_id),
  );

  const { data: movingListings } = await supabase
    .from("listing_zones")
    .select("listing_id")
    .eq("zone_id", id);

  for (const row of movingListings ?? []) {
    if (listingsAlreadyThere.has(row.listing_id)) {
      await supabase
        .from("listing_zones")
        .delete()
        .eq("zone_id", id)
        .eq("listing_id", row.listing_id);
    } else {
      await supabase
        .from("listing_zones")
        .update({ zone_id: successorId })
        .eq("zone_id", id)
        .eq("listing_id", row.listing_id);
    }
  }

  const { error } = await supabase
    .from("access_zones")
    .update({ retired_at: new Date().toISOString(), successor_id: successorId })
    .eq("id", id);

  if (error) redirect(`${ZONES}?error=${encodeURIComponent(error.message)}`);

  revalidatePath(ZONES);
  redirect(ZONES);
}

export async function restoreZone(formData: FormData) {
  await requireAdmin();
  const id = text(formData, "id");

  const supabase = await createClient();
  await supabase
    .from("access_zones")
    .update({ retired_at: null, successor_id: null })
    .eq("id", id);

  revalidatePath(ZONES);
  redirect(ZONES);
}

/* -------------------------------------------------------------------------
   Situations
   ------------------------------------------------------------------------- */

export async function createSituation(formData: FormData) {
  await requireAdmin();

  const label = text(formData, "label");
  if (!label) redirect(`${SITUATIONS}?error=missing`);

  const supabase = await createClient();

  const { data: last } = await supabase
    .from("situations")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await supabase.from("situations").insert({
    slug: toSlug(label),
    label,
    // Left blank, the ranker falls back to the label, so a new situation
    // still produces a readable reason rather than an empty one.
    match_phrase: text(formData, "matchPhrase") || null,
    sort_order: (last?.sort_order ?? 0) + 1,
    woman_only: formData.get("womanOnly") === "on",
  });

  if (error) redirect(`${SITUATIONS}?error=${encodeURIComponent(error.message)}`);

  revalidatePath(SITUATIONS);
  redirect(SITUATIONS);
}

export async function updateSituation(formData: FormData) {
  await requireAdmin();

  const id = text(formData, "id");
  const label = text(formData, "label");
  const sortOrder = Number(text(formData, "sortOrder"));

  if (!id || !label) redirect(`${SITUATIONS}?error=missing`);

  const supabase = await createClient();
  const { error } = await supabase
    .from("situations")
    .update({
      label,
      match_phrase: text(formData, "matchPhrase") || null,
      sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
      woman_only: formData.get("womanOnly") === "on",
    })
    .eq("id", id);

  if (error) redirect(`${SITUATIONS}?error=${encodeURIComponent(error.message)}`);

  revalidatePath(SITUATIONS);
  redirect(SITUATIONS);
}

/**
 * Retire a situation.
 *
 * No successor, unlike a zone. A situation is something she ticks about
 * herself, and quietly reassigning that to a different statement would put
 * words in her mouth. Listings keep the tag, it stops being offered and stops
 * matching, and it can be restored.
 */
export async function retireSituation(formData: FormData) {
  await requireAdmin();
  const id = text(formData, "id");

  const supabase = await createClient();
  await supabase
    .from("situations")
    .update({ retired_at: new Date().toISOString() })
    .eq("id", id);

  revalidatePath(SITUATIONS);
  redirect(SITUATIONS);
}

export async function restoreSituation(formData: FormData) {
  await requireAdmin();
  const id = text(formData, "id");

  const supabase = await createClient();
  await supabase.from("situations").update({ retired_at: null }).eq("id", id);

  revalidatePath(SITUATIONS);
  redirect(SITUATIONS);
}

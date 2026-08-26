import "server-only";
import { createClient } from "@/lib/supabase/server";

export type Zone = {
  id: string;
  slug: string;
  name: string;
  focus: string;
  sortOrder: number;
  retiredAt: string | null;
  successorId: string | null;
  /** How much is attached, so retiring is never a guess. */
  organisationCount: number;
  listingCount: number;
};

export type Situation = {
  id: string;
  slug: string;
  label: string;
  matchPhrase: string | null;
  sortOrder: number;
  womanOnly: boolean;
  retiredAt: string | null;
  listingCount: number;
};

/**
 * Every zone, retired ones included.
 *
 * The public read policy hides retired zones from everyone except admins, so
 * this is the only place they are visible. An admin who cannot see what they
 * retired cannot undo it.
 */
export async function getZones(): Promise<Zone[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("access_zones")
    .select("id, slug, name, focus, sort_order, retired_at, successor_id")
    .order("sort_order");

  if (error) throw error;

  const { data: orgLinks } = await supabase
    .from("organisation_zones")
    .select("zone_id");
  const { data: listingLinks } = await supabase
    .from("listing_zones")
    .select("zone_id");

  const tally = (rows: { zone_id: string }[] | null) => {
    const counts = new Map<string, number>();
    for (const row of rows ?? []) {
      counts.set(row.zone_id, (counts.get(row.zone_id) ?? 0) + 1);
    }
    return counts;
  };

  const orgCounts = tally(orgLinks);
  const listingCounts = tally(listingLinks);

  return (data ?? []).map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    focus: row.focus,
    sortOrder: row.sort_order,
    retiredAt: row.retired_at,
    successorId: row.successor_id,
    organisationCount: orgCounts.get(row.id) ?? 0,
    listingCount: listingCounts.get(row.id) ?? 0,
  }));
}

export async function getSituations(): Promise<Situation[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("situations")
    .select("id, slug, label, match_phrase, sort_order, woman_only, retired_at")
    .order("sort_order");

  if (error) throw error;

  const { data: links } = await supabase
    .from("listing_situations")
    .select("situation_id");

  const counts = new Map<string, number>();
  for (const row of links ?? []) {
    counts.set(row.situation_id, (counts.get(row.situation_id) ?? 0) + 1);
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    slug: row.slug,
    label: row.label,
    matchPhrase: row.match_phrase,
    sortOrder: row.sort_order,
    womanOnly: row.woman_only,
    retiredAt: row.retired_at,
    listingCount: counts.get(row.id) ?? 0,
  }));
}

/**
 * Turn a name into a stable slug.
 *
 * Only ever run when something is created. A listing holds the slug, so
 * changing it later would orphan everything attached, which is the whole
 * reason renaming and identity are separate here.
 */
export function toSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

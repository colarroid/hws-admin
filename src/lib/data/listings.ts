import "server-only";
import { createClient } from "@/lib/supabase/server";
import { FRESHNESS_MONTHS } from "@/lib/design/taxonomy";

export type ListingStatus =
  | "draft"
  | "in_review"
  | "changes_requested"
  | "live"
  | "closed";

export type Listing = {
  id: string;
  name: string;
  kind: string | null;
  cost: string | null;
  formats: string[];
  place: string | null;
  deadline: string | null;
  status: ListingStatus;
  last_confirmed_at: string | null;
};

export async function getListings(organisationId: string): Promise<Listing[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("listings")
    .select(
      "id, name, kind, cost, formats, place, deadline, status, last_confirmed_at",
    )
    .eq("organisation_id", organisationId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as Listing[]) ?? [];
}

export type Stats = { views: number; saves: number; clickthroughs: number };

/**
 * The three headline figures, summed across the organisation's listings.
 *
 * These read zero until the woman-facing flow ships, because that is where
 * the events are generated. The table exists now so the first cohort's
 * figures are not lost to a retrofit.
 */
export const NO_STATS: Stats = { views: 0, saves: 0, clickthroughs: 0 };

/**
 * Per-listing figures, keyed by listing id.
 *
 * One query serves both the three headline cards and the inline figures on
 * each live listing, since the dashboard shows both at once.
 */
export async function getStatsByListing(
  listingIds: string[],
): Promise<Record<string, Stats>> {
  if (listingIds.length === 0) return {};

  const supabase = await createClient();
  const { data } = await supabase
    .from("listing_stats")
    .select("listing_id, views, saves, clickthroughs")
    .in("listing_id", listingIds);

  const byListing: Record<string, Stats> = {};
  for (const row of data ?? []) {
    byListing[row.listing_id] = {
      views: row.views ?? 0,
      saves: row.saves ?? 0,
      clickthroughs: row.clickthroughs ?? 0,
    };
  }
  return byListing;
}

export function sumStats(byListing: Record<string, Stats>): Stats {
  return Object.values(byListing).reduce<Stats>(
    (total, row) => ({
      views: total.views + row.views,
      saves: total.saves + row.saves,
      clickthroughs: total.clickthroughs + row.clickthroughs,
    }),
    NO_STATS,
  );
}

/**
 * Live listings not confirmed within the freshness window.
 *
 * A live listing that has never been confirmed counts as stale: women see the
 * date on the card, so a missing one is as damaging as an old one.
 */
export function staleListings(listings: Listing[]): Listing[] {
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - FRESHNESS_MONTHS);

  return listings.filter((listing) => {
    if (listing.status !== "live") return false;
    if (!listing.last_confirmed_at) return true;
    return new Date(listing.last_confirmed_at) < cutoff;
  });
}

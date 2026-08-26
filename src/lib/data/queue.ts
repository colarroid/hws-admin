import "server-only";
import { createClient } from "@/lib/supabase/server";

export type QueueItem = {
  id: string;
  name: string;
  organisationName: string;
  submittedAt: string | null;
  /** Whole days since it was submitted. Computed here, not during render. */
  waitedDays: number;
  status: string;
};

export type ReviewListing = {
  id: string;
  name: string;
  kind: string | null;
  blurb: string | null;
  who_for: string | null;
  what_to_expect: string | null;
  cost: string | null;
  formats: string[];
  place: string | null;
  deadline: string | null;
  apply_url: string | null;
  status: string;
  organisationId: string;
  organisationName: string;
  organisationStatus: string;
  situationCount: number;
};

/**
 * The review queue, oldest first.
 *
 * Oldest first is not a preference. Screen 12 of the organisation portal
 * promises review "usually within two working days", and any other order
 * lets a listing sit while newer ones overtake it.
 */
export async function getQueue(): Promise<QueueItem[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("listings")
    .select("id, name, status, created_at, organisations ( name )")
    .in("status", ["in_review"])
    .order("created_at", { ascending: true });

  type Row = {
    id: string;
    name: string;
    status: string;
    created_at: string;
    organisations: { name: string } | null;
  };

  const rows = (data ?? []) as unknown as Row[];

  // When it was submitted, rather than when the draft was started.
  const ids = rows.map((r) => r.id);
  const submitted = new Map<string, string>();

  if (ids.length > 0) {
    const { data: events } = await supabase
      .from("listing_reviews")
      .select("listing_id, created_at")
      .in("listing_id", ids)
      .eq("action", "submitted")
      .order("created_at", { ascending: false });

    for (const event of events ?? []) {
      if (!submitted.has(event.listing_id)) {
        submitted.set(event.listing_id, event.created_at);
      }
    }
  }

  // One clock read for the whole queue, so every age on the screen is
  // measured from the same moment.
  const now = Date.now();
  const DAY = 24 * 60 * 60 * 1000;

  return rows
    .map((row) => {
      const submittedAt = submitted.get(row.id) ?? row.created_at;
      return {
        id: row.id,
        name: row.name,
        organisationName: row.organisations?.name ?? "",
        submittedAt,
        waitedDays: Math.floor((now - new Date(submittedAt).getTime()) / DAY),
        status: row.status,
      };
    })
    .sort((a, b) => (a.submittedAt ?? "").localeCompare(b.submittedAt ?? ""));
}

export async function getReviewListing(
  id: string,
): Promise<ReviewListing | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("listings")
    .select(
      `id, name, kind, blurb, who_for, what_to_expect, cost, formats, place,
       deadline, apply_url, status, organisation_id,
       organisations ( name, status ),
       listing_situations ( situation_id )`,
    )
    .eq("id", id)
    .maybeSingle();

  if (!data) return null;

  type Row = typeof data & {
    organisations: { name: string; status: string } | null;
    listing_situations: { situation_id: string }[] | null;
    organisation_id: string;
  };

  const row = data as unknown as Row;

  return {
    id: row.id,
    name: row.name,
    kind: row.kind,
    blurb: row.blurb,
    who_for: row.who_for,
    what_to_expect: row.what_to_expect,
    cost: row.cost,
    formats: row.formats ?? [],
    place: row.place,
    deadline: row.deadline,
    apply_url: row.apply_url,
    status: row.status,
    organisationId: row.organisation_id,
    organisationName: row.organisations?.name ?? "",
    organisationStatus: row.organisations?.status ?? "pending",
    situationCount: (row.listing_situations ?? []).length,
  };
}

/**
 * Member addresses for one organisation.
 *
 * Goes through a security-definer function rather than the service role key,
 * so this deployment never holds a credential that could read every
 * organisation and every saved list. See migration 0011.
 */
export async function getOrganisationEmails(
  organisationId: string,
): Promise<string[]> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("organisation_member_emails", {
    org: organisationId,
  });

  if (error) throw error;

  return ((data ?? []) as { email: string }[]).map((row) => row.email);
}

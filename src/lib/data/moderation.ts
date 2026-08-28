import "server-only";
import { createClient } from "@/lib/supabase/server";

export type QueueItem = {
  id: string;
  name: string;
  organisationName: string;
  submittedAt: string | null;
  status: string;
  /** Set when an admin has taken it down from every woman-facing surface. */
  hiddenAt: string | null;
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
  /** Set when an admin has hidden it from every woman-facing surface. */
  hiddenAt: string | null;
  hiddenReason: string | null;
  organisationId: string;
  organisationName: string;
  organisationStatus: string;
  situationCount: number;
};

/** Enough to scan without scrolling forever, few enough to stay one query. */
export const PER_PAGE = 25;

export type ListingsPage = {
  items: QueueItem[];
  /** Matching the current search, not the whole table. */
  total: number;
  page: number;
  pageCount: number;
};

/**
 * The search term, made safe to interpolate.
 *
 * PostgREST parses its filters out of the query string, so a comma or a
 * bracket in a search box is a syntax error at best and someone else's filter
 * at worst. `%` and `_` are LIKE wildcards, which would let a search match
 * things it does not look like it should. None of them are worth supporting
 * in a name search, so they are dropped rather than escaped.
 */
function safeTerm(raw: string) {
  return raw
    .replace(/[,.()*\%_"']/g, " ")
    .trim()
    .slice(0, 80);
}

/**
 * Everything published, newest first, one page at a time.
 *
 * This was a queue of listings waiting for approval. Nothing waits any more:
 * a verified organisation publishes directly, and this is where an admin
 * moderates afterwards.
 *
 * Hidden listings sort to the top. It is the only state on this screen that
 * someone decided to put a listing into, so it is the one worth seeing
 * without paging. The sort is in SQL rather than in JS because with paging a
 * JS sort would only order the page it was handed.
 */
export async function getQueue({
  q = "",
  page = 1,
}: { q?: string; page?: number } = {}): Promise<ListingsPage> {
  const supabase = await createClient();
  const term = safeTerm(q);

  // The organisation name is on a joined table, and PostgREST cannot put a
  // joined column inside a top-level `or`. Resolving the ids first is one
  // extra round trip and it keeps the search matching what the screen shows:
  // a listing's own name, or the name of who posted it.
  let orgIds: string[] = [];
  if (term) {
    const { data } = await supabase
      .from("organisations")
      .select("id")
      .ilike("name", `%${term}%`);
    orgIds = (data ?? []).map((row) => row.id);
  }

  let query = supabase
    .from("listings")
    .select("id, name, status, hidden_at, created_at, organisations ( name )", {
      count: "exact",
    })
    .in("status", ["live", "closed", "in_review"]);

  if (term) {
    query =
      orgIds.length > 0
        ? query.or(`name.ilike.%${term}%,organisation_id.in.(${orgIds.join(",")})`)
        : query.ilike("name", `%${term}%`);
  }

  const current = Math.max(1, Math.floor(page) || 1);
  const from = (current - 1) * PER_PAGE;

  const { data, error, count } = await query
    // Non-null first, which is hidden first.
    .order("hidden_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .range(from, from + PER_PAGE - 1);

  // Not swallowed. A failed query and an empty table look identical on the
  // screen otherwise, and "nothing posted yet" is the most reassuring thing
  // a broken moderation screen could possibly say.
  if (error) throw error;

  type Row = {
    id: string;
    name: string;
    status: string;
    hidden_at: string | null;
    created_at: string;
    organisations: { name: string } | null;
  };

  const rows = (data ?? []) as unknown as Row[];
  const total = count ?? rows.length;

  // When it was submitted, rather than when the draft was started. Only for
  // the rows on this page, so the cost does not grow with the table.
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

  return {
    items: rows.map((row) => ({
      id: row.id,
      name: row.name,
      organisationName: row.organisations?.name ?? "",
      submittedAt: submitted.get(row.id) ?? row.created_at,
      status: row.status,
      hiddenAt: row.hidden_at,
    })),
    total,
    page: current,
    pageCount: Math.max(1, Math.ceil(total / PER_PAGE)),
  };
}

export async function getReviewListing(
  id: string,
): Promise<ReviewListing | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("listings")
    .select(
      `id, name, kind, blurb, who_for, what_to_expect, cost, formats, place,
       deadline, apply_url, status, hidden_at, hidden_reason, organisation_id,
       organisations ( name, status ),
       listing_situations ( situation_id )`,
    )
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
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
    hiddenAt: row.hidden_at,
    hiddenReason: row.hidden_reason,
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

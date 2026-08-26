import "server-only";
import { createClient } from "@/lib/supabase/server";

export type VerificationStatus =
  | "pending"
  | "verified"
  | "more_evidence"
  | "rejected";

export type OrganisationSummary = {
  id: string;
  name: string;
  type: string;
  place: string | null;
  status: VerificationStatus;
  submittedAt: string;
  waitedDays: number;
  listingCount: number;
};

export type OrganisationDetail = OrganisationSummary & {
  website: string | null;
  blurb: string | null;
  registrationNumber: string | null;
  funderNote: string | null;
  contactName: string | null;
  contactRole: string | null;
  contactPhone: string | null;
  reviewNote: string | null;
  verifiedAt: string | null;
  zoneNames: string[];
};

const DAY = 24 * 60 * 60 * 1000;

/**
 * Organisations awaiting a decision, oldest first.
 *
 * Onboarding tells them "usually within two working days", and that promise
 * is the reason anyone drafts a listing before being verified.
 */
export async function getOrganisationsToVerify(): Promise<OrganisationSummary[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("organisations")
    .select("id, name, type, place, status, created_at")
    .in("status", ["pending", "more_evidence"])
    .order("created_at", { ascending: true });

  if (error) throw error;

  const ids = (data ?? []).map((o) => o.id);
  const counts = new Map<string, number>();

  if (ids.length > 0) {
    const { data: listings } = await supabase
      .from("listings")
      .select("organisation_id")
      .in("organisation_id", ids);
    for (const row of listings ?? []) {
      counts.set(
        row.organisation_id,
        (counts.get(row.organisation_id) ?? 0) + 1,
      );
    }
  }

  const now = Date.now();

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    type: row.type,
    place: row.place,
    status: row.status as VerificationStatus,
    submittedAt: row.created_at,
    waitedDays: Math.floor((now - new Date(row.created_at).getTime()) / DAY),
    listingCount: counts.get(row.id) ?? 0,
  }));
}

export async function getOrganisation(
  id: string,
): Promise<OrganisationDetail | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("organisations")
    .select(
      `id, name, type, place, website, blurb, status, created_at,
       registration_number, funder_note, contact_name, contact_role,
       contact_phone, review_note, verified_at,
       organisation_zones ( access_zones ( name ) )`,
    )
    .eq("id", id)
    .maybeSingle();

  if (!data) return null;

  // The nested select comes back with access_zones as an array per row,
  // regardless of it being a single foreign key.
  type Row = Omit<typeof data, "organisation_zones"> & {
    organisation_zones:
      | { access_zones: { name: string } | { name: string }[] | null }[]
      | null;
  };
  const row = data as unknown as Row;

  const { count } = await supabase
    .from("listings")
    .select("id", { count: "exact", head: true })
    .eq("organisation_id", id);

  return {
    id: row.id,
    name: row.name,
    type: row.type,
    place: row.place,
    website: row.website,
    blurb: row.blurb,
    status: row.status as VerificationStatus,
    submittedAt: row.created_at,
    waitedDays: Math.floor(
      (Date.now() - new Date(row.created_at).getTime()) / DAY,
    ),
    listingCount: count ?? 0,
    registrationNumber: row.registration_number,
    funderNote: row.funder_note,
    contactName: row.contact_name,
    contactRole: row.contact_role,
    contactPhone: row.contact_phone,
    reviewNote: row.review_note,
    verifiedAt: row.verified_at,
    zoneNames: (row.organisation_zones ?? [])
      .flatMap((z) =>
        Array.isArray(z.access_zones)
          ? z.access_zones.map((a) => a.name)
          : [z.access_zones?.name],
      )
      .filter((n): n is string => Boolean(n)),
  };
}

/**
 * Where to look a registration number up.
 *
 * Both registers are offered rather than guessed at: a Scottish charity
 * number and a Scottish company number both begin SC, and sending a reviewer
 * to the wrong one wastes the check.
 */
export function registerLinks(number: string | null) {
  if (!number?.trim()) return null;
  const clean = number.trim().replace(/\s+/g, "");
  return {
    charity: `https://www.oscr.org.uk/about-charities/search-the-register/charity-details?number=${encodeURIComponent(clean)}`,
    company: `https://find-and-update.company-information.service.gov.uk/company/${encodeURIComponent(clean)}`,
  };
}

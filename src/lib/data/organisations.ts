import "server-only";
import { createClient } from "@/lib/supabase/server";
import { profileGapCount } from "@/lib/profile";

export type VerificationStatus =
  | "pending"
  | "verified"
  | "more_evidence"
  | "rejected";

export type OrganisationSummary = {
  id: string;
  name: string;
  /** One or more, since an organisation is often more than one thing. */
  types: string[];
  place: string | null;
  status: VerificationStatus;
  submittedAt: string;
  waitedDays: number;
  listingCount: number;
  /** Null until they finished the profile, which is what asks to be reviewed. */
  requestedAt: string | null;
  /** How many profile answers are still missing. 0 means it is finished. */
  profileGaps: number;
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

  // The profile. Verification context: who they say they serve, how far they
  // reach, and how often they expect to show up.
  mission: string | null;
  uniqueOffer: string | null;
  audiences: string[];
  audiencesOther: string | null;
  serviceKinds: string[];
  accessRoutes: string[];
  costOptions: string[];
  costNote: string | null;
  coverage: string | null;
  coverageNote: string | null;
  eligibility: string | null;
  notEligible: string | null;
  postingFrequency: string | null;
  availability: string | null;
  availabilityNote: string | null;
  logoUrl: string | null;
  logoSource: string | null;
  profileUpdatedAt: string | null;
  verifiedAt: string | null;
  zoneNames: string[];
};

const DAY = 24 * 60 * 60 * 1000;

/**
 * Organisations awaiting a decision, oldest first.
 *
 * Onboarding tells them "usually within two working days", and that promise
 * is the reason anyone drafts a listing before being verified.
 *
 * "Waiting" means they asked. An organisation still filling in its profile
 * has not asked, and putting it in the queue is how a queue fills with
 * half-empty records nobody can decide on.
 */
export async function getOrganisationsToVerify(): Promise<OrganisationSummary[]> {
  // Every organisation, not only the ones waiting. An admin needs to be able
  // to look one up after the fact, and to see what was declined, not just
  // work a queue. The screen filters; the query does not decide for it.
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("organisations")
    .select(
      `id, name, types, place, status, created_at, verification_requested_at,
       mission, audiences, service_kinds, access_routes, cost_options,
       coverage, eligibility, posting_frequency`,
    )
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
    types: row.types ?? [],
    place: row.place,
    status: row.status as VerificationStatus,
    submittedAt: row.verification_requested_at ?? row.created_at,
    // From when they asked, not from when they signed up. Someone who spent a
    // fortnight writing their profile has not been waiting a fortnight on us.
    waitedDays: Math.floor(
      (now - new Date(row.verification_requested_at ?? row.created_at).getTime()) /
        DAY,
    ),
    listingCount: counts.get(row.id) ?? 0,
    requestedAt: row.verification_requested_at,
    profileGaps: profileGapCount({
      mission: row.mission,
      audiences: row.audiences ?? [],
      serviceKinds: row.service_kinds ?? [],
      accessRoutes: row.access_routes ?? [],
      costOptions: row.cost_options ?? [],
      coverage: row.coverage,
      eligibility: row.eligibility,
      postingFrequency: row.posting_frequency,
    }),
  }));
}

export async function getOrganisation(
  id: string,
): Promise<OrganisationDetail | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("organisations")
    .select(
      `id, name, types, place, website, blurb, status, created_at,
       registration_number, funder_note, contact_name, contact_role,
       contact_phone, review_note, verified_at, mission, unique_offer,
       audiences, audiences_other, service_kinds, access_routes, cost_options,
       cost_note, coverage, coverage_note, eligibility, not_eligible,
       posting_frequency, availability, availability_note, logo_path,
       logo_source, profile_updated_at, verification_requested_at,
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
    types: row.types ?? [],
    place: row.place,
    website: row.website,
    blurb: row.blurb,
    status: row.status as VerificationStatus,
    submittedAt: row.created_at,
    waitedDays: Math.floor(
      (Date.now() - new Date(row.created_at).getTime()) / DAY,
    ),
    listingCount: count ?? 0,
    requestedAt: row.verification_requested_at,
    profileGaps: profileGapCount({
      mission: row.mission,
      audiences: row.audiences ?? [],
      serviceKinds: row.service_kinds ?? [],
      accessRoutes: row.access_routes ?? [],
      costOptions: row.cost_options ?? [],
      coverage: row.coverage,
      eligibility: row.eligibility,
      postingFrequency: row.posting_frequency,
    }),
    registrationNumber: row.registration_number,
    funderNote: row.funder_note,
    contactName: row.contact_name,
    contactRole: row.contact_role,
    contactPhone: row.contact_phone,
    reviewNote: row.review_note,
    verifiedAt: row.verified_at,
    mission: row.mission,
    uniqueOffer: row.unique_offer,
    audiences: row.audiences ?? [],
    audiencesOther: row.audiences_other,
    serviceKinds: row.service_kinds ?? [],
    accessRoutes: row.access_routes ?? [],
    costOptions: row.cost_options ?? [],
    costNote: row.cost_note,
    coverage: row.coverage,
    coverageNote: row.coverage_note,
    eligibility: row.eligibility,
    notEligible: row.not_eligible,
    postingFrequency: row.posting_frequency,
    availability: row.availability,
    availabilityNote: row.availability_note,
    logoUrl: row.logo_path
      ? supabase.storage.from("organisation-logos").getPublicUrl(row.logo_path)
          .data.publicUrl
      : null,
    logoSource: row.logo_source,
    profileUpdatedAt: row.profile_updated_at,
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

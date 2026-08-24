/**
 * Fixed vocabularies, stored as slugs and rendered as these labels.
 *
 * Access Zones and situations are NOT here. Both are admin-owned and come
 * from the database, so that HWS can add, rename or retire one without a
 * release. Everything in this file is fixed by the design and changing it
 * means changing a check constraint too.
 */

export const ORGANISATION_TYPES = [
  { slug: "charity", label: "Charity" },
  { slug: "social_enterprise", label: "Social enterprise" },
  { slug: "public_body", label: "Public body" },
  { slug: "business", label: "Business" },
  { slug: "network_or_group", label: "Network or group" },
  { slug: "college_or_university", label: "College or university" },
] as const;

export const SOLUTION_KINDS = [
  { slug: "course_or_programme", label: "Course or programme" },
  { slug: "grant_or_fund", label: "Grant or fund" },
  { slug: "advice_or_one_to_one", label: "Advice or one to one" },
  { slug: "drop_in", label: "Drop in" },
  { slug: "event", label: "Event" },
  { slug: "mentoring", label: "Mentoring" },
] as const;

export const COSTS = [
  { slug: "free", label: "Free" },
  { slug: "free_to_apply", label: "Free to apply" },
  { slug: "there_is_a_cost", label: "There is a cost" },
] as const;

export const FORMATS = [
  { slug: "in_person", label: "In person" },
  { slug: "online", label: "Online" },
  { slug: "by_phone", label: "By phone" },
  { slug: "evenings_or_weekends", label: "Evenings or weekends" },
] as const;

export type Vocabulary = readonly { slug: string; label: string }[];

export function labelFor(vocabulary: Vocabulary, slug: string | null): string {
  if (!slug) return "";
  return vocabulary.find((entry) => entry.slug === slug)?.label ?? slug;
}

/** Minimum password length, matched by the live hint on sign up and reset. */
export const MIN_PASSWORD_LENGTH = 10;

/** A live listing is prompted for re-confirmation after this long. */
export const FRESHNESS_MONTHS = 6;

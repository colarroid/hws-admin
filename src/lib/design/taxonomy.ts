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

/**
 * Who an organisation is set up to serve.
 *
 * About circumstance rather than identity, and about the audience an
 * organisation names when it describes itself. The finer matching a woman
 * gets is done from situations, which are admin-owned and live in the
 * database so they can change without a release.
 */
export const AUDIENCES = [
  { slug: "any_woman", label: "Any woman" },
  { slug: "women_returning_to_work", label: "Women returning to work" },
  { slug: "carers", label: "Carers" },
  { slug: "single_parents", label: "Single parents" },
  { slug: "survivors_of_abuse", label: "Survivors of abuse" },
  { slug: "refugees_and_new_scots", label: "Refugees and New Scots" },
  { slug: "disabled_women", label: "Disabled women" },
  { slug: "women_on_low_income", label: "Women on a low income" },
  { slug: "young_women", label: "Young women, 16 to 25" },
  { slug: "women_over_50", label: "Women over 50" },
  { slug: "women_leaving_prison", label: "Women leaving prison" },
] as const;

/** How far an organisation's offer reaches. Drives a follow-up question. */
export const COVERAGE = [
  { slug: "one_area", label: "One town or neighbourhood" },
  { slug: "local_authority", label: "One local authority" },
  { slug: "several_areas", label: "Several areas" },
  { slug: "scotland_wide", label: "All of Scotland" },
  { slug: "online_only", label: "Online only, anywhere" },
] as const;

/** Coverage answers that leave "where, exactly?" unanswered. */
export const COVERAGE_NEEDS_DETAIL: readonly string[] = [
  "one_area",
  "local_authority",
  "several_areas",
];

/**
 * How often an organisation expects to post.
 *
 * Not a promise and not enforced. It sets the rhythm of the freshness
 * reminders, so an organisation that posts when funding allows stops being
 * nagged on the same clock as one that posts most weeks.
 */
export const POSTING_FREQUENCY = [
  { slug: "weekly", label: "Most weeks" },
  { slug: "monthly", label: "Monthly" },
  { slug: "quarterly", label: "Every few months" },
  { slug: "few_times_a_year", label: "A few times a year" },
  { slug: "when_funding_allows", label: "When funding allows" },
] as const;

/** When the offer actually runs. Two of these need a follow-up. */
export const AVAILABILITY = [
  { slug: "year_round", label: "All year round" },
  { slug: "term_time", label: "Term time only" },
  { slug: "seasonal", label: "Seasonal" },
  { slug: "funding_dependent", label: "Only while funded" },
] as const;

/** Availability answers that leave "when, exactly?" unanswered. */
export const AVAILABILITY_NEEDS_DETAIL: readonly string[] = [
  "term_time",
  "seasonal",
];

export type Vocabulary = readonly { slug: string; label: string }[];

export function labelFor(vocabulary: Vocabulary, slug: string | null): string {
  if (!slug) return "";
  return vocabulary.find((entry) => entry.slug === slug)?.label ?? slug;
}

/** Every label for a set of slugs, in the vocabulary's order rather than theirs. */
export function labelsFor(
  vocabulary: Vocabulary,
  slugs: readonly string[] | null,
): string[] {
  if (!slugs || slugs.length === 0) return [];
  return vocabulary
    .filter((entry) => slugs.includes(entry.slug))
    .map((entry) => entry.label);
}

/** Minimum password length, matched by the live feedback on sign up and reset. */
export const MIN_PASSWORD_LENGTH = 8;

/** A live listing is prompted for re-confirmation after this long. */
export const FRESHNESS_MONTHS = 6;

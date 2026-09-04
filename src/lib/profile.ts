/**
 * How much of an organisation's profile is filled in.
 *
 * Duplicated from the organisation portal rather than shared, like the rest
 * of the layer the three apps have in common. The two copies must say the
 * same thing: this decides what an admin is told is missing, and that copy
 * decides what the organisation is asked for.
 *
 * Verification no longer waits on this — an organisation asks to be verified
 * when it finishes onboarding, and writes the profile afterwards. So this is
 * not a gate, it is context: deciding on an organisation whose profile is
 * blank means deciding on a name and a registration number.
 */
export function profileGapCount(organisation: {
  mission: string | null;
  audiences: string[];
  serviceKinds: string[];
  accessRoutes: string[];
  costOptions: string[];
  coverage: string | null;
  eligibility: string | null;
  postingFrequency: string | null;
}): number {
  let gaps = 0;

  if (!organisation.mission) gaps++;
  if (organisation.audiences.length === 0) gaps++;
  if (organisation.serviceKinds.length === 0) gaps++;
  if (organisation.accessRoutes.length === 0) gaps++;
  if (organisation.costOptions.length === 0) gaps++;
  if (!organisation.coverage) gaps++;
  if (!organisation.eligibility) gaps++;
  if (!organisation.postingFrequency) gaps++;

  return gaps;
}

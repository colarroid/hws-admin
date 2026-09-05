import "server-only";

/**
 * The organisation portal's origin, for links in the mail this tool sends.
 *
 * It used to be `process.env.ORG_PORTAL_URL ?? ""`, written out twice. With
 * the variable unset that produced a button pointing at `/solutions`: a
 * relative path in an email, which resolves against nothing, so the message
 * arrives looking finished with a button that goes nowhere. Silent, and the
 * admin who pressed the button has already been told the organisation was
 * notified.
 *
 * The freshness cron in hws-global refuses to run at all without the same
 * variable. This is the same rule, one layer up: an email whose link cannot
 * work is not worth sending, so the caller is told and the decision it was
 * reporting still stands.
 *
 * Returns null rather than throwing, because every caller is reporting a
 * decision that has already been made in the database. Losing the email is
 * bad; losing the takedown is worse.
 */
export function portalUrl(): string | null {
  const raw = process.env.ORG_PORTAL_URL?.trim();
  if (!raw) return null;

  // A bare host is a common way to set this and would produce a link the mail
  // client treats as relative. Anything without a scheme is refused rather
  // than guessed at, so the failure is visible here and not in an inbox.
  if (!/^https?:\/\//i.test(raw)) return null;

  return raw.replace(/\/$/, "");
}

/**
 * One absolute link into the portal, or null if there is nowhere to point.
 *
 * Callers treat null as "do not send", which surfaces to the admin as the
 * same "we could not tell them" they already get when the mail provider is
 * down. That is the honest report: an email with a dead button in it did not
 * tell anybody anything.
 */
export function portalLink(path: string): string | null {
  const base = portalUrl();
  return base ? `${base}${path}` : null;
}

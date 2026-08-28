import {
  emailButton,
  emailLayout,
  emailQuote,
  emailText,
  escapeHtml,
} from "@/emails/layout";

/**
 * What an organisation is told when one of its listings is moderated.
 *
 * Nothing here is an approval. A verified organisation publishes directly, so
 * the only decision an admin makes about a live listing is whether it should
 * stop being shown, and these two emails are the two sides of that.
 *
 * The reason is quoted rather than folded into a sentence. It is the part the
 * organisation has to act on, and it has to survive being skimmed.
 *
 * Both ask for a reply, which is why the admin deployment sends from a real
 * mailbox rather than a noreply address.
 */

export function listingHidden(
  listingName: string,
  reason: string,
  dashboardUrl: string,
) {
  const subject = `${listingName} is not showing to women at the moment`;

  const text = [
    `We have taken ${listingName} down while something is sorted. Women`,
    "searching will not see it until it goes back up.",
    "",
    reason,
    "",
    "Nothing is lost. The listing is still on your dashboard exactly as you",
    "wrote it. Edit it and reply to this email, and we will put it back.",
    "",
    `Your dashboard: ${dashboardUrl}`,
  ].join("\n");

  const html = emailLayout({
    preheader: "We have taken it down while something is sorted.",
    heading: `${listingName} is not showing at the moment`,
    body:
      emailText(
        `We have taken <strong>${escapeHtml(listingName)}</strong> down while something is sorted. Women searching will not see it until it goes back up.`,
      ) +
      emailQuote(reason) +
      emailText(
        "Nothing is lost. The listing is still on your dashboard exactly as you wrote it. Edit it and reply to this email, and we will put it back.",
        "muted",
      ) +
      emailButton("Open your dashboard", dashboardUrl),
  });

  return { subject, text, html };
}

export function listingRestored(listingName: string, dashboardUrl: string) {
  const subject = `${listingName} is showing again`;

  const text = [
    `${listingName} is back in front of women searching.`,
    "",
    "Thank you for sorting it.",
    "",
    `Your dashboard: ${dashboardUrl}`,
  ].join("\n");

  const html = emailLayout({
    preheader: "It is back in front of women searching.",
    heading: `${listingName} is showing again`,
    body:
      emailText(
        `<strong>${escapeHtml(listingName)}</strong> is back in front of women searching. Thank you for sorting it.`,
      ) + emailButton("Open your dashboard", dashboardUrl),
  });

  return { subject, text, html };
}

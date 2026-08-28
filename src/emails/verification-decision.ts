import {
  emailButton,
  emailLayout,
  emailQuote,
  emailText,
  escapeHtml,
} from "@/emails/layout";

/**
 * The three verification outcomes.
 *
 * Two of them carry a note written by an admin, and it is sent word for word.
 * A decision with no reason gives an organisation nothing to act on, and both
 * of those notes are quoted rather than folded into a sentence, because the
 * instruction is the part that has to survive being skimmed.
 *
 * Both also ask for a reply, which is why the admin deployment sends from a
 * real mailbox rather than a noreply address.
 */

export function verified(organisationName: string, dashboardUrl: string) {
  const subject = "You're verified";

  const text = [
    `${organisationName} is verified.`,
    "",
    "You can post solutions now, and they go live without waiting for anyone.",
    "",
    "Women see a verified stamp and the date each listing was last checked.",
    "",
    `Your dashboard: ${dashboardUrl}`,
  ].join("\n");

  const html = emailLayout({
    preheader: `${organisationName} can now post solutions.`,
    heading: "You're verified",
    body:
      emailText(
        `<strong>${escapeHtml(organisationName)}</strong> is verified.`,
      ) +
      emailText(
        "You can post solutions now, and they go live without waiting for anyone. Women see a verified stamp beside each one, with the date it was last checked.",
        "muted",
      ) +
      emailButton("Post a solution", dashboardUrl),
  });

  return { subject, text, html };
}

export function moreEvidence(
  organisationName: string,
  note: string,
  dashboardUrl: string,
) {
  const subject = "We need one more thing to verify you";

  const text = [
    `We looked at ${organisationName} and need one more thing before we can`,
    "verify you:",
    "",
    note,
    "",
    "Your drafts are safe and nothing is lost. Reply to this email with what",
    "we have asked for and we will pick it up from there.",
    "",
    `Your dashboard: ${dashboardUrl}`,
  ].join("\n");

  const html = emailLayout({
    preheader: "One more thing before we can verify you.",
    heading: "We need one more thing",
    body:
      emailText(
        `We looked at <strong>${escapeHtml(organisationName)}</strong> and need one more thing before we can verify you.`,
      ) +
      emailQuote(note) +
      emailText(
        "Your drafts are safe and nothing is lost. Reply to this email with what we have asked for and we will pick it up from there.",
        "muted",
      ) +
      emailButton("Open your dashboard", dashboardUrl),
  });

  return { subject, text, html };
}

export function rejected(
  organisationName: string,
  note: string,
  dashboardUrl: string,
) {
  const subject = "About your listing account";

  const text = [
    `We are not able to verify ${organisationName} at the moment.`,
    "",
    note,
    "",
    "This is not permanent. If something changes, or if you think we have",
    "this wrong, reply to this email and a person will look again.",
    "",
    `Your dashboard: ${dashboardUrl}`,
  ].join("\n");

  const html = emailLayout({
    preheader: "We cannot verify you at the moment, and why.",
    heading: "About your listing account",
    body:
      emailText(
        `We are not able to verify <strong>${escapeHtml(organisationName)}</strong> at the moment.`,
      ) +
      emailQuote(note) +
      emailText(
        "This is not permanent. If something changes, or if you think we have this wrong, reply to this email and a person will look again.",
        "muted",
      ) +
      emailButton("Open your dashboard", dashboardUrl),
  });

  return { subject, text, html };
}

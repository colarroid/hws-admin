import {
  emailButton,
  emailLayout,
  emailQuote,
  emailText,
  escapeHtml,
} from "@/emails/layout";

/**
 * What an organisation is told about one of its listings.
 *
 * Listings publish without waiting for a reviewer now, so `listingPublished`
 * is a moderation outcome rather than an approval: it is sent when an admin
 * has edited wording, which screen 12 of the portal promises never happens
 * silently. `changesNeeded` remains the way to ask for a fix.
 */

export function listingPublished(
  listingName: string,
  dashboardUrl: string,
  edits: string[],
) {
  const edited = edits.length > 0;

  const subject = `${listingName} is now live`;

  const text = [
    `${listingName} has been checked and is now showing to women searching.`,
    "",
    ...(edited
      ? [
          "We edited some wording for clarity before publishing:",
          ...edits.map((field) => `  - ${field}`),
          "",
          "If any of that reads wrong, edit it on your dashboard and it will",
          "come back to us.",
          "",
        ]
      : []),
    `Your dashboard: ${dashboardUrl}`,
  ].join("\n");

  const html = emailLayout({
    preheader: edited
      ? "Live, with a note about wording we changed."
      : "It is showing to women searching now.",
    heading: `${listingName} is live`,
    body:
      emailText(
        `<strong>${escapeHtml(listingName)}</strong> has been checked and is now showing to women searching.`,
      ) +
      (edited
        ? emailText(
            "We edited some wording for clarity. Nothing about what you offer has changed, only how it reads:",
            "muted",
          ) +
          emailQuote(edits.join("\n")) +
          emailText(
            "If any of that reads wrong, edit it on your dashboard and it comes straight back to us.",
            "muted",
          )
        : "") +
      emailButton("Open your dashboard", dashboardUrl),
  });

  return { subject, text, html };
}

export function changesNeeded(
  listingName: string,
  note: string,
  dashboardUrl: string,
) {
  const subject = `${listingName} needs a small change`;

  const text = [
    `We read ${listingName} and it is nearly there. One thing to sort before`,
    "it can go live:",
    "",
    note,
    "",
    "Edit it on your dashboard and it comes straight back to us. We usually",
    "look again within two working days.",
    "",
    `Your dashboard: ${dashboardUrl}`,
  ].join("\n");

  const html = emailLayout({
    preheader: "One thing to sort before it can go live.",
    heading: `${listingName} needs a small change`,
    body:
      emailText(
        `We read <strong>${escapeHtml(listingName)}</strong> and it is nearly there. One thing to sort before it can go live.`,
      ) +
      emailQuote(note) +
      emailText(
        "Edit it on your dashboard and it comes straight back to us. We usually look again within two working days.",
        "muted",
      ) +
      emailButton("Edit the listing", dashboardUrl),
  });

  return { subject, text, html };
}

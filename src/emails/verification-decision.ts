/**
 * What an organisation is told about verification.
 *
 * Verification gates publishing, not access, so none of these locks them
 * out. Even a rejection leaves their drafts intact and says how to come
 * back, because "no" without a route forward is how a legitimate
 * organisation with a scrappy paper trail gets lost.
 */
export function verified(organisationName: string, dashboardUrl: string) {
  const subject = "You're verified";

  const text = [
    `${organisationName} is verified.`,
    "",
    "Anything you have already submitted can now be published, and anything",
    "you post from here goes to review as normal.",
    "",
    "Women see a verified stamp and the date each listing was last checked.",
    "",
    `Your dashboard: ${dashboardUrl}`,
  ].join("\n");

  return {
    subject,
    text,
    html: wrap(`
      <p style="margin:0 0 16px;font-size:18px;line-height:1.6;">
        <strong>${escapeHtml(organisationName)}</strong> is verified.
      </p>
      <p style="margin:0 0 20px;font-size:16px;line-height:1.6;color:rgba(18,9,2,0.7);">
        Anything you have already submitted can now be published, and anything
        you post from here goes to review as normal. Women see a verified
        stamp and the date each listing was last checked.
      </p>
      ${button(dashboardUrl, "See my listings")}
    `),
  };
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

  return {
    subject,
    text,
    html: wrap(`
      <p style="margin:0 0 16px;font-size:18px;line-height:1.6;">
        We looked at <strong>${escapeHtml(organisationName)}</strong> and need
        one more thing before we can verify you.
      </p>
      <div style="background:#F7F3EB;border:1px solid #DED1B0;border-radius:10px;padding:16px;margin:0 0 16px;">
        <div style="font-size:16px;line-height:1.6;color:#5F5230;">${escapeHtml(note)}</div>
      </div>
      <p style="margin:0 0 20px;font-size:16px;line-height:1.6;color:rgba(18,9,2,0.7);">
        Your drafts are safe and nothing is lost. Reply to this email with what
        we have asked for and we will pick it up from there.
      </p>
      ${button(dashboardUrl, "See my dashboard")}
    `),
  };
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

  return {
    subject,
    text,
    html: wrap(`
      <p style="margin:0 0 16px;font-size:18px;line-height:1.6;">
        We are not able to verify <strong>${escapeHtml(organisationName)}</strong>
        at the moment.
      </p>
      <div style="background:#FDEEEB;border:1px solid #F1C7C0;border-radius:10px;padding:16px;margin:0 0 16px;">
        <div style="font-size:16px;line-height:1.6;color:#B91C1C;">${escapeHtml(note)}</div>
      </div>
      <p style="margin:0 0 20px;font-size:16px;line-height:1.6;color:rgba(18,9,2,0.7);">
        This is not permanent. If something changes, or if you think we have
        this wrong, reply to this email and a person will look again.
      </p>
      ${button(dashboardUrl, "See my dashboard")}
    `),
  };
}

function button(url: string, label: string) {
  return `<p style="margin:0;"><a href="${url}" style="display:inline-block;background:#120902;color:#FFFFFF;font-size:16px;font-weight:700;text-decoration:none;padding:14px 24px;border-radius:10px;">${label}</a></p>`;
}

function wrap(inner: string) {
  return `<!doctype html>
<html lang="en-GB">
<body style="margin:0;background:#F9F6F1;font-family:Helvetica,Arial,sans-serif;color:#120902;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F9F6F1;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#FFFFFF;border:1px solid rgba(18,9,2,0.16);border-radius:14px;padding:28px;">
        <tr><td>${inner}</td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

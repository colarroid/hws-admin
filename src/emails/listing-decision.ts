/**
 * What an organisation is told after review.
 *
 * Screen 12 of the portal promises: "We may edit wording for clarity and
 * will tell you if we do." So an approval that involved an edit says so and
 * shows what changed. Silently improving someone's words and letting them
 * find out later is the fastest way to lose the organisations this depends on.
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
    "Women see the date we last confirmed it, so we will ask you to check it",
    "again in six months.",
    "",
    `Your dashboard: ${dashboardUrl}`,
  ].join("\n");

  const html = wrap(`
    <p style="margin:0 0 16px;font-size:18px;line-height:1.6;">
      <strong>${escapeHtml(listingName)}</strong> has been checked and is now
      showing to women searching.
    </p>
    ${
      edited
        ? `<div style="background:#F7F3EB;border:1px solid #DED1B0;border-radius:10px;padding:16px;margin:0 0 16px;">
             <div style="font-size:15px;font-weight:700;color:#5F5230;">We edited some wording for clarity</div>
             <div style="font-size:15px;color:#5F5230;padding-top:6px;">${edits.map(escapeHtml).join(", ")}</div>
             <div style="font-size:14px;color:#5F5230;padding-top:8px;">If any of it reads wrong, edit it on your dashboard and it comes back to us.</div>
           </div>`
        : ""
    }
    <p style="margin:0 0 20px;font-size:16px;line-height:1.6;color:rgba(18,9,2,0.7);">
      Women see the date we last confirmed it, so we will ask you to check it
      again in six months.
    </p>
    ${button(dashboardUrl, "See my listings")}
  `);

  return { subject, html, text };
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

  const html = wrap(`
    <p style="margin:0 0 16px;font-size:18px;line-height:1.6;">
      We read <strong>${escapeHtml(listingName)}</strong> and it is nearly
      there. One thing to sort before it can go live.
    </p>
    <div style="background:#FDEEEB;border:1px solid #F1C7C0;border-radius:10px;padding:16px;margin:0 0 16px;">
      <div style="font-size:16px;line-height:1.6;color:#B91C1C;">${escapeHtml(note)}</div>
    </div>
    <p style="margin:0 0 20px;font-size:16px;line-height:1.6;color:rgba(18,9,2,0.7);">
      Edit it on your dashboard and it comes straight back to us. We usually
      look again within two working days.
    </p>
    ${button(dashboardUrl, "Edit my listing")}
  `);

  return { subject, html, text };
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

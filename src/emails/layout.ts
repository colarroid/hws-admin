/**
 * One shell for every email the platform sends.
 *
 * Email is not the web. The rules that shape this are old and unglamorous:
 * tables rather than flex, inline styles rather than classes, no webfonts, no
 * external stylesheet. Anything clever is a thing Outlook renders differently.
 *
 * Three properties matter more than the styling:
 *
 *   - The logo is a PNG, not the SVG the sites use. Gmail and Outlook strip
 *     SVG entirely, so the mark would simply be missing. It carries real alt
 *     text, because most clients block images by default and a blocked logo
 *     should still read as the sender's name rather than a broken box.
 *   - Every colour is stated, including backgrounds. A client with a dark
 *     mode will otherwise recolour the ground and leave dark text on it.
 *   - The preheader is the line shown beside the subject in an inbox list.
 *     Left unset, clients pull the first text they find, which is usually the
 *     alt text of the logo.
 *
 * Playfair Display is not available here, so headings fall back to Georgia,
 * which is the same fallback the sites declare.
 */

const INK = "#120902";
const INK_70 = "#4a423d";
const INK_60 = "#6b625c";
const GROUND = "#f9f6f1";
const SURFACE = "#ffffff";
const HAIRLINE = "#e6e0d8";
const GOLD_700 = "#5f5230";

/**
 * Absolute, because an email has no origin to resolve a relative path
 * against. Served from the woman-facing site: it is the one deployment that
 * is public by design, where the admin tools may be locked at the edge.
 */
const LOGO_URL =
  process.env.EMAIL_LOGO_URL ?? "https://www.hwspathgrid.com/logo-email.png";

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** A single call to action. Built from a table so Outlook fills the shape. */
export function emailButton(label: string, url: string) {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:28px 0 0;">
      <tr>
        <td align="center" bgcolor="${INK}" style="border-radius:6px;">
          <a href="${escapeHtml(url)}"
             style="display:inline-block;padding:15px 30px;font-family:Helvetica,Arial,sans-serif;font-size:17px;font-weight:700;line-height:1;color:#ffffff;text-decoration:none;border-radius:6px;">
            ${escapeHtml(label)}
          </a>
        </td>
      </tr>
    </table>`;
}

/**
 * A one-time code, set large enough to read off a screen and type on another.
 *
 * Letter-spaced but not split into groups: a code broken up for legibility is
 * a code somebody types with the spaces in. Selectable as one run of digits,
 * so copy and paste gives the field exactly what it wants.
 *
 * The only place this is used today is the Supabase sign-in template, which
 * lives outside this codebase and is generated from here by
 * `scripts/build-auth-emails.ts`. It is in this file rather than in that
 * script so the auth mail cannot drift from the mail the app sends itself.
 */
export function emailCode(code: string) {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0 4px;">
      <tr>
        <td align="center" bgcolor="${GROUND}" style="background:${GROUND};border:1px solid ${HAIRLINE};border-radius:8px;padding:22px 16px;font-family:Helvetica,Arial,sans-serif;font-size:34px;font-weight:700;letter-spacing:0.24em;line-height:1.2;color:${INK};">
          ${code}
        </td>
      </tr>
    </table>`;
}

/** A quoted block: something HWS wrote, set apart from the sentence around it. */
export function emailQuote(body: string) {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:20px 0 0;">
      <tr>
        <td style="background:${GROUND};border:1px solid ${HAIRLINE};border-radius:8px;padding:16px 18px;font-family:Helvetica,Arial,sans-serif;font-size:16px;line-height:1.6;color:${INK};">
          ${escapeHtml(body).replace(/\n/g, "<br>")}
        </td>
      </tr>
    </table>`;
}

export function emailLayout({
  preheader,
  heading,
  body,
  footnote,
}: {
  /** The line an inbox shows beside the subject. Never rendered in the body. */
  preheader: string;
  heading: string;
  /** Pre-built HTML: paragraphs, buttons, quotes. */
  body: string;
  /** Small print under the rule. Optional. */
  footnote?: string;
}) {
  return `<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light only">
<title>${escapeHtml(heading)}</title>
</head>
<body style="margin:0;padding:0;background:${GROUND};">
  <span style="display:none!important;visibility:hidden;opacity:0;height:0;width:0;overflow:hidden;mso-hide:all;">${escapeHtml(preheader)}</span>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${GROUND};">
    <tr>
      <td align="center" style="padding:32px 16px;">

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;">
          <tr>
            <td style="padding:0 4px 20px;">
              <img src="${LOGO_URL}" alt="HWS Path Grid" width="150" height="54"
                   style="display:block;width:150px;height:54px;border:0;outline:none;text-decoration:none;">
            </td>
          </tr>

          <tr>
            <td style="background:${SURFACE};border:1px solid ${HAIRLINE};border-radius:14px;padding:32px;">
              <h1 style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-size:26px;line-height:1.25;font-weight:400;color:${INK};">
                ${escapeHtml(heading)}
              </h1>
              ${body}
            </td>
          </tr>

          <tr>
            <td style="padding:20px 4px 0;font-family:Helvetica,Arial,sans-serif;font-size:13px;line-height:1.6;color:${INK_60};">
              ${footnote ? `${escapeHtml(footnote)}<br><br>` : ""}
              HWS Path Grid &middot; support for women across Scotland
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** A paragraph in the body. Kept here so every email spaces them the same. */
export function emailText(body: string, tone: "normal" | "muted" = "normal") {
  const colour = tone === "muted" ? INK_70 : INK;
  return `<p style="margin:0 0 14px;font-family:Helvetica,Arial,sans-serif;font-size:16px;line-height:1.6;color:${colour};">${body}</p>`;
}

/** A link inside a paragraph. */
export function emailLink(label: string, url: string) {
  return `<a href="${escapeHtml(url)}" style="color:${GOLD_700};text-decoration:underline;">${escapeHtml(label)}</a>`;
}

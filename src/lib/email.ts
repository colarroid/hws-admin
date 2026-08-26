import "server-only";

/**
 * Send one email through Resend.
 *
 * Sender name and subject are the caller's responsibility and both must stay
 * neutral. These land in inboxes that other people read on shared devices,
 * and a subject line naming a category of support could tell someone
 * something she has not chosen to tell them. That is a safety property, not
 * a style preference.
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<{ ok: boolean; error?: string }> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!key || !from) {
    return { ok: false, error: "RESEND_API_KEY or EMAIL_FROM is not set." };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, html, text }),
  });

  if (!response.ok) {
    return { ok: false, error: `Resend returned ${response.status}: ${await response.text()}` };
  }

  return { ok: true };
}

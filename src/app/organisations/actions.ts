"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/data/admin";
import { getOrganisation } from "@/lib/data/organisations";
import { getOrganisationEmails } from "@/lib/data/queue";
import { sendEmail } from "@/lib/email";
import { verified, moreEvidence, rejected } from "@/emails/verification-decision";

const LIST = "/organisations";

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

/**
 * Turn a provider failure into something an admin can act on.
 *
 * A 403 from Resend is nearly always an unverified sending domain, and while
 * it is unverified the only address it will deliver to is the account
 * owner. That reads from here like a bad recipient, which sends the admin
 * off to check a perfectly good address.
 */
function describeSendFailure(raw: string | undefined): string {
  const detail = raw ?? "";

  if (detail.includes("RESEND_API_KEY") || detail.includes("EMAIL_FROM"))
    return "email is not configured on this deployment";
  if (detail.includes("reserved address"))
    return "their address is on a reserved testing domain and cannot receive email";
  if (detail.includes("403"))
    return "our email provider refused it, which usually means the sending domain is not verified yet";
  if (detail.includes("429")) return "we are being rate limited by the email provider";
  if (detail.includes("422")) return "the email provider would not accept their address";

  return detail || "no reason came back";
}

function portalUrl() {
  return process.env.ORG_PORTAL_URL ?? "";
}

/**
 * Same rule as the review queue: the decision stands even if the email does
 * not. What changed is that a failure now says why.
 *
 * It used to return a bare false and swallow the reason in a catch, so a
 * decision that never reached anyone looked the same as one that did, and the
 * cause was not recorded anywhere. An organisation waiting on an instruction
 * it was never sent is the worst version of this screen.
 */
async function notify(
  organisationId: string,
  message: { subject: string; html: string; text: string },
): Promise<{ ok: boolean; reason?: string }> {
  try {
    const addresses = await getOrganisationEmails(organisationId);

    if (addresses.length === 0) {
      return { ok: false, reason: "That organisation has no member we can email." };
    }

    let delivered = false;
    let lastError: string | undefined;

    for (const address of addresses) {
      const result = await sendEmail({ to: address, ...message });
      if (result.ok) delivered = true;
      else lastError = result.error;
    }

    if (delivered) return { ok: true };

    console.error("verification decision email failed", lastError);
    return { ok: false, reason: describeSendFailure(lastError) };
  } catch (thrown) {
    const reason = thrown instanceof Error ? thrown.message : String(thrown);
    console.error("verification decision email threw", thrown);
    return { ok: false, reason };
  }
}

/**
 * Verify an organisation.
 *
 * This is the single act the whole trust model rests on. Everything a woman
 * sees carries a verified stamp, and the stamp means one person checked this
 * organisation is real against a public register.
 *
 * It does not publish their listings. Those still go through review, because
 * a real organisation can still write a listing with a date that has passed.
 */
export async function markVerified(formData: FormData) {
  const admin = await requireAdmin();
  const id = text(formData, "id");

  const organisation = await getOrganisation(id);
  if (!organisation) redirect(LIST);

  const supabase = await createClient();
  const { error } = await supabase
    .from("organisations")
    .update({
      status: "verified",
      verified_at: new Date().toISOString(),
      verified_by: admin.id,
      review_note: null,
    })
    .eq("id", id);

  if (error) redirect(`${LIST}/${id}?error=${encodeURIComponent(error.message)}`);

  const told = await notify(
    id,
    verified(organisation.name, `${portalUrl()}/dashboard`),
  );

  revalidatePath(LIST);
  redirect(
    told.ok
      ? LIST
      : `${LIST}?notified=failed&why=${encodeURIComponent(told.reason ?? "")}`,
  );
}

/**
 * Ask for something more.
 *
 * Not a rejection. A legitimate organisation with a scrappy paper trail is
 * exactly who this state exists for, and their drafts stay untouched.
 */
export async function askForEvidence(formData: FormData) {
  const admin = await requireAdmin();
  const id = text(formData, "id");
  const note = text(formData, "note");

  if (!note) redirect(`${LIST}/${id}?error=note`);

  const organisation = await getOrganisation(id);
  if (!organisation) redirect(LIST);

  const supabase = await createClient();
  const { error } = await supabase
    .from("organisations")
    .update({
      status: "more_evidence",
      review_note: note,
      verified_by: admin.id,
    })
    .eq("id", id);

  if (error) redirect(`${LIST}/${id}?error=${encodeURIComponent(error.message)}`);

  const told = await notify(
    id,
    moreEvidence(organisation.name, note, `${portalUrl()}/dashboard`),
  );

  revalidatePath(LIST);
  redirect(
    told.ok
      ? LIST
      : `${LIST}?notified=failed&why=${encodeURIComponent(told.reason ?? "")}`,
  );
}

/**
 * Decline, for now.
 *
 * The note is required and is sent word for word. A refusal with no reason
 * gives an organisation nothing to act on, and this is reversible: the state
 * can be changed later if something changes.
 */
export async function markRejected(formData: FormData) {
  const admin = await requireAdmin();
  const id = text(formData, "id");
  const note = text(formData, "note");

  if (!note) redirect(`${LIST}/${id}?error=note`);

  const organisation = await getOrganisation(id);
  if (!organisation) redirect(LIST);

  const supabase = await createClient();
  const { error } = await supabase
    .from("organisations")
    .update({
      status: "rejected",
      review_note: note,
      verified_by: admin.id,
      verified_at: null,
    })
    .eq("id", id);

  if (error) redirect(`${LIST}/${id}?error=${encodeURIComponent(error.message)}`);

  const told = await notify(
    id,
    rejected(organisation.name, note, `${portalUrl()}/dashboard`),
  );

  revalidatePath(LIST);
  redirect(
    told.ok
      ? LIST
      : `${LIST}?notified=failed&why=${encodeURIComponent(told.reason ?? "")}`,
  );
}

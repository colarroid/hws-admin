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

function portalUrl() {
  return process.env.ORG_PORTAL_URL ?? "";
}

/** Same rule as the review queue: the decision stands even if the email does not. */
async function notify(
  organisationId: string,
  message: { subject: string; html: string; text: string },
): Promise<boolean> {
  try {
    const addresses = await getOrganisationEmails(organisationId);
    if (addresses.length === 0) return false;

    let delivered = false;
    for (const address of addresses) {
      const result = await sendEmail({ to: address, ...message });
      if (result.ok) delivered = true;
    }
    return delivered;
  } catch {
    return false;
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
  redirect(told ? LIST : `${LIST}?notified=failed`);
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
  redirect(told ? LIST : `${LIST}?notified=failed`);
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
  redirect(told ? LIST : `${LIST}?notified=failed`);
}

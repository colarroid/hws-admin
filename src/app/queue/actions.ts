"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/data/admin";
import { getOrganisationEmails, getReviewListing } from "@/lib/data/queue";
import { sendEmail } from "@/lib/email";
import { listingPublished, changesNeeded } from "@/emails/listing-decision";

const EDITABLE = ["name", "blurb", "who_for", "what_to_expect"] as const;

const FIELD_LABELS: Record<string, string> = {
  name: "the name",
  blurb: "what it does",
  who_for: "who it is for",
  what_to_expect: "what to expect",
};

function portalUrl() {
  return process.env.ORG_PORTAL_URL ?? "";
}

/**
 * Tell the organisation, without letting that failure undo the decision.
 *
 * The review is the work; the email is a courtesy. If it does not go, the
 * listing is still published and the reviewer needs to know the message did
 * not arrive, not be shown a server error for something that succeeded and
 * invited to do it twice.
 */
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
 * Approve, publishing the listing.
 *
 * Any wording the reviewer changed is written into the audit trail as a
 * before and after, and named in the email. Screen 12 of the portal promises
 * exactly that, and an unrecorded edit makes the promise a lie the next time
 * anyone checks.
 *
 * last_confirmed_at is stamped here because publishing *is* the first
 * confirmation. Leaving it null would make a brand new listing count as stale
 * the moment it goes live.
 */
export async function approve(formData: FormData) {
  const admin = await requireAdmin();
  const id = String(formData.get("listingId"));

  const listing = await getReviewListing(id);
  if (!listing) redirect("/queue");

  const supabase = await createClient();

  const changes: Record<string, { from: string; to: string }> = {};
  const updates: Record<string, string> = {};

  for (const field of EDITABLE) {
    const submitted = String(formData.get(field) ?? "").trim();
    const original = (listing[field] ?? "").trim();
    if (submitted !== original) {
      changes[field] = { from: original, to: submitted };
      updates[field] = submitted;
    }
  }

  const now = new Date().toISOString();

  const { error } = await supabase
    .from("listings")
    .update({
      ...updates,
      status: "live",
      published_at: now,
      last_confirmed_at: now,
    })
    .eq("id", id);

  if (error) throw new Error(`Could not publish: ${error.message}`);

  const edited = Object.keys(changes).length > 0;

  if (edited) {
    await supabase.from("listing_reviews").insert({
      listing_id: id,
      actor_id: admin.id,
      action: "edited",
      note: "Wording edited for clarity during review.",
      changes,
    });
  }

  await supabase.from("listing_reviews").insert({
    listing_id: id,
    actor_id: admin.id,
    action: "approved",
  });

  const told = await notify(
    listing.organisationId,
    listingPublished(
      updates.name ?? listing.name,
      `${portalUrl()}/dashboard`,
      Object.keys(changes).map((field) => FIELD_LABELS[field] ?? field),
    ),
  );

  revalidatePath("/queue");
  redirect(told ? "/queue" : "/queue?notified=failed");
}

/**
 * Send it back with one thing to fix.
 *
 * The note is required. "Needs changes" with no reason turns a two-day
 * promise into an unbounded loop, and the organisation has no way to guess
 * what to do.
 */
export async function requestChanges(formData: FormData) {
  const admin = await requireAdmin();
  const id = String(formData.get("listingId"));
  const note = String(formData.get("note") ?? "").trim();

  if (!note) redirect(`/queue/${id}?error=note`);

  const listing = await getReviewListing(id);
  if (!listing) redirect("/queue");

  const supabase = await createClient();

  const { error: auditError } = await supabase.from("listing_reviews").insert({
    listing_id: id,
    actor_id: admin.id,
    action: "changes_requested",
    note,
  });

  if (auditError) {
    throw new Error(`Could not record the decision: ${auditError.message}`);
  }

  const { error } = await supabase
    .from("listings")
    .update({ status: "changes_requested" })
    .eq("id", id);

  if (error) throw new Error(`Could not update the listing: ${error.message}`);

  const told = await notify(
    listing.organisationId,
    changesNeeded(listing.name, note, `${portalUrl()}/dashboard`),
  );

  revalidatePath("/queue");
  redirect(told ? "/queue" : "/queue?notified=failed");
}

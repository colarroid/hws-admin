"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/data/admin";
import { getOrganisationEmails, getReviewListing } from "@/lib/data/moderation";
import { sendEmail } from "@/lib/email";
import { listingHidden, listingRestored } from "@/emails/listing-decision";
import { portalLink } from "@/lib/portal";

/**
 * Tell the organisation, without letting that failure undo the decision.
 *
 * The takedown is the work; the email is how they find out. If it does not
 * go, the listing is still hidden and the admin needs to know the message did
 * not arrive, not be shown a server error for something that succeeded and
 * invited to do it twice. The portal shows the same thing either way, so a
 * lost email delays the news rather than losing it.
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
 * Take a listing down from every woman-facing surface.
 *
 * A hide, not a delete. Nothing an organisation wrote is destroyed, the
 * listing stays in their own dashboard with the reason attached, and a
 * takedown that can be explained is one they can act on. The two public
 * views filter on `hidden_at`, so this is the whole mechanism.
 *
 * Admins do not approve listings any more: a verified organisation publishes
 * directly. This is what replaces that, and it runs after the fact.
 */
export async function hideListing(formData: FormData) {
  const listingId = String(formData.get("listingId") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim();
  // The form marks the reason required, but the action is its own endpoint
  // and a takedown nobody can explain is the thing this is meant to prevent.
  if (!listingId || !reason) return;

  const admin = await requireAdmin();
  const supabase = await createClient();

  const listing = await getReviewListing(listingId);
  if (!listing) return;

  const { error } = await supabase
    .from("listings")
    .update({
      hidden_at: new Date().toISOString(),
      hidden_by: admin.id,
      hidden_reason: reason,
    })
    .eq("id", listingId);

  if (error) throw new Error(`Could not hide the listing: ${error.message}`);

  // Append-only, like every other review action, so a takedown is on the
  // record rather than only in the listing's current state.
  await supabase.from("listing_reviews").insert({
    listing_id: listingId,
    actor_id: admin.id,
    action: "hidden",
    changes: { reason },
  });

  // Without a portal URL the button in that email points at "/solutions",
  // which is a relative path in an inbox and resolves against nothing. An
  // email with a dead button has told nobody anything, so it is not sent and
  // the admin is shown the same "we could not tell them" as a bounce. The
  // takedown itself has already happened and stands either way.
  const link = portalLink("/solutions");
  const told = link
    ? await notify(
        listing.organisationId,
        listingHidden(listing.name, reason, link),
      )
    : false;

  revalidatePath("/listings");
  revalidatePath("/listings/" + listingId);
  redirect(told ? "/listings/" + listingId : "/listings/" + listingId + "?notified=failed");
}

/** Put it back. */
export async function unhideListing(formData: FormData) {
  const listingId = String(formData.get("listingId") ?? "").trim();
  if (!listingId) return;

  const admin = await requireAdmin();
  const supabase = await createClient();

  const listing = await getReviewListing(listingId);
  if (!listing) return;

  const { error } = await supabase
    .from("listings")
    .update({ hidden_at: null, hidden_by: null, hidden_reason: null })
    .eq("id", listingId);

  if (error) throw new Error(`Could not restore the listing: ${error.message}`);

  await supabase.from("listing_reviews").insert({
    listing_id: listingId,
    actor_id: admin.id,
    action: "unhidden",
  });

  const link = portalLink("/solutions");
  const told = link
    ? await notify(listing.organisationId, listingRestored(listing.name, link))
    : false;

  revalidatePath("/listings");
  revalidatePath("/listings/" + listingId);
  redirect(told ? "/listings/" + listingId : "/listings/" + listingId + "?notified=failed");
}

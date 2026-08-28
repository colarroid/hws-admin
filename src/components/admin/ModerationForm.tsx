import { Eye, EyeOff, Flag, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { hideListing, unhideListing } from "@/app/listings/actions";
import type { ReviewListing } from "@/lib/data/moderation";

/**
 * What an admin can do to a listing after it is published.
 *
 * Nothing is approved here any more. A verified organisation publishes
 * directly, so the only decision left is whether something already live
 * should stop being shown. Flagging is what does that, and it is a hide
 * rather than a delete: the organisation keeps everything it wrote, sees the
 * reason, and can fix it.
 *
 * The reason is required, and it is the organisation's copy of why. A listing
 * that disappears with no explanation is indistinguishable from a bug, and
 * leaves them nothing to act on.
 */
export function ModerationForm({ listing }: { listing: ReviewListing }) {
  const hidden = Boolean(listing.hiddenAt);

  if (hidden) {
    return (
      <div className="flex flex-col gap-4 rounded-card border border-red-200 bg-red-50 p-6">
        <div className="flex items-start gap-3">
          <EyeOff
            size={20}
            strokeWidth={2}
            className="mt-1 shrink-0 text-red-700"
            aria-hidden="true"
          />
          <div className="flex flex-col gap-1">
            <span className="text-[17px] font-bold text-red-700">
              Flagged and hidden from women
            </span>
            <span className="text-[15px] leading-[1.6] text-red-700">
              It is gone from search and from its own page. The organisation
              sees it with the reason below.
            </span>
          </div>
        </div>

        {listing.hiddenReason ? (
          <blockquote className="m-0 rounded-control border border-red-200 bg-surface px-4 py-3 text-[16px] leading-[1.6] text-ink">
            {listing.hiddenReason}
          </blockquote>
        ) : null}

        <form action={unhideListing}>
          <input type="hidden" name="listingId" value={listing.id} />
          <Button type="submit" variant="secondary" size="inline">
            <Eye size={16} strokeWidth={2} aria-hidden="true" />
            Unflag and show it again
          </Button>
        </form>
      </div>
    );
  }

  return (
    <form
      action={hideListing}
      className="flex flex-col gap-4 rounded-card bg-surface p-6 shadow-hairline"
    >
      <input type="hidden" name="listingId" value={listing.id} />

      <div className="flex flex-col gap-1">
        <span className="text-[17px] font-bold">
          Something wrong with this listing?
        </span>
        <span className="max-w-[62ch] text-[15px] leading-[1.6] text-ink-70">
          Flagging hides it from women. It stops appearing in search and its
          own page stops resolving. Nothing is deleted: the organisation keeps
          the listing and sees why, so they can fix it and you can restore it.
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="reason" className="text-[15px] font-semibold">
          Why you are flagging it
        </label>
        <textarea
          id="reason"
          name="reason"
          rows={3}
          required
          placeholder="e.g. The closing date has passed and the link goes to a page that no longer exists."
          className="rounded-control bg-surface p-4 text-[17px] text-ink shadow-hairline"
        />
        <span className="flex items-start gap-2 text-[14px] leading-[1.5] text-ink-60">
          <TriangleAlert
            size={15}
            strokeWidth={2}
            className="mt-[3px] shrink-0"
            aria-hidden="true"
          />
          The organisation would see the reason why this is flagged.
        </span>
      </div>

      <Button
        type="submit"
        variant="destructive"
        size="inline"
        className="self-start"
      >
        <Flag size={16} strokeWidth={2} aria-hidden="true" />
        Flag this content
      </Button>
    </form>
  );
}

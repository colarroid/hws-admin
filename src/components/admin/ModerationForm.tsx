import { EyeOff, Eye, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { hideListing, unhideListing } from "@/app/queue/actions";
import type { ReviewListing } from "@/lib/data/queue";

/**
 * What an admin can do to a listing after it is published.
 *
 * Nothing is approved here any more. A verified organisation publishes
 * directly, so the only decision left is whether something already live
 * should stop being shown, and that is a hide rather than a delete: the
 * organisation keeps everything it wrote, sees the reason, and can fix it.
 *
 * The reason is required. A listing that disappears with no explanation is
 * indistinguishable from a bug, and the organisation would have nothing to
 * act on.
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
              Hidden from women
            </span>
            <span className="text-[15px] leading-[1.6] text-red-700">
              It is gone from search and from its own page. The organisation
              still sees it, with the reason below.
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
            Show it again
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
        <span className="text-[17px] font-bold">Hide this from women</span>
        <span className="max-w-[62ch] text-[15px] leading-[1.6] text-ink-70">
          It stops appearing in search and its own page stops resolving.
          Nothing is deleted: the organisation keeps the listing and sees why,
          so they can fix it and you can show it again.
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="reason" className="text-[15px] font-semibold">
          Why, in their words
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
          This is shown to the organisation. A listing that vanishes with no
          reason reads as a bug rather than a decision.
        </span>
      </div>

      <Button
        type="submit"
        variant="destructive"
        size="inline"
        className="self-start"
      >
        <EyeOff size={16} strokeWidth={2} aria-hidden="true" />
        Hide from women
      </Button>
    </form>
  );
}

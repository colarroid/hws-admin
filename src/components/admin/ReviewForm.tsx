"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field, TextAreaField } from "@/components/ui/Field";
import { approve, requestChanges } from "@/app/queue/actions";
import type { ReviewListing } from "@/lib/data/queue";

/**
 * The four checks the portal promises, then the decision.
 *
 * The checks are not stored. They are a reviewer's memory aid, not a record:
 * pretending a tick box is evidence of a link being tested would make the
 * audit trail claim more than it knows. What is recorded is the decision and
 * any wording changed.
 */
const CHECKS = [
  "Eligibility is clear enough that she can tell whether she qualifies",
  "The dates are real and still ahead",
  "The link works and lands somewhere she can act on",
  "The description matches what they actually run",
];

export function ReviewForm({
  listing,
  blockedReason,
  noteError,
}: {
  listing: ReviewListing;
  /** Set when something must be fixed before this can go live. */
  blockedReason: string | null;
  noteError: boolean;
}) {
  const [checked, setChecked] = useState<boolean[]>(CHECKS.map(() => false));
  const [mode, setMode] = useState<"none" | "changes">(
    noteError ? "changes" : "none",
  );

  const allChecked = checked.every(Boolean);
  const canApprove = allChecked && !blockedReason;

  return (
    <div className="flex flex-col gap-7 border-t border-hairline pt-7">
      <div className="flex flex-col gap-3">
        <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink-60">
          What we check
        </span>
        <div className="flex flex-col gap-2">
          {CHECKS.map((check, index) => (
            <label
              key={check}
              className="flex min-h-[44px] cursor-pointer items-start gap-3 text-[16px] leading-[1.5]"
            >
              <input
                type="checkbox"
                checked={checked[index]}
                onChange={() =>
                  setChecked(checked.map((v, i) => (i === index ? !v : v)))
                }
                className="mt-[5px] h-[18px] w-[18px] shrink-0 accent-[#120902]"
              />
              <span>{check}</span>
            </label>
          ))}
        </div>
        {listing.situationCount === 0 ? (
          <span className="text-[15px] leading-[1.5] text-ink-60">
            No situations tagged, so this can only be matched on its words and
            location. Worth asking for, but not on its own a reason to reject.
          </span>
        ) : null}
      </div>

      {/* Editing is allowed and recorded. The organisation is told exactly
          which fields changed, so nothing is improved behind their back. */}
      <form action={approve} className="flex flex-col gap-5">
        <input type="hidden" name="listingId" value={listing.id} />

        <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink-60">
          Edit wording for clarity
        </span>

        <Field label="Name" name="name" defaultValue={listing.name} />
        <TextAreaField
          label="What it does"
          name="blurb"
          rows={3}
          defaultValue={listing.blurb ?? ""}
        />
        <TextAreaField
          label="Who it's for"
          name="who_for"
          rows={2}
          defaultValue={listing.who_for ?? ""}
        />
        <TextAreaField
          label="What to expect"
          name="what_to_expect"
          rows={2}
          defaultValue={listing.what_to_expect ?? ""}
        />

        <div className="flex flex-col gap-2">
          <Button type="submit" disabled={!canApprove}>
            Publish this listing
          </Button>
          {blockedReason ? (
            <span className="text-[14px] leading-[1.5] text-red-700">
              Blocked: {blockedReason}.
            </span>
          ) : !allChecked ? (
            <span className="text-[14px] leading-[1.5] text-ink-60">
              Work through the four checks above first.
            </span>
          ) : null}
        </div>
      </form>

      <div className="flex flex-col gap-3 border-t border-hairline-soft pt-6">
        {mode === "none" ? (
          <Button
            variant="secondary"
            size="inline"
            className="self-start"
            onClick={() => setMode("changes")}
          >
            Send it back instead
          </Button>
        ) : (
          <form action={requestChanges} className="flex flex-col gap-4">
            <input type="hidden" name="listingId" value={listing.id} />
            <TextAreaField
              label="What needs to change?"
              name="note"
              rows={3}
              required
              defaultValue=""
              placeholder="e.g. The closing date has already passed. Give us the next one and we'll publish it."
              hint="This is sent to them word for word, so write it to them rather than about them."
              error={
                noteError ? "Say what needs changing before sending it back." : undefined
              }
            />
            <div className="flex flex-wrap gap-3">
              <Button type="submit" variant="destructive" size="inline">
                Send back with this note
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="inline"
                onClick={() => setMode("none")}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

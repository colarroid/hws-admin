"use client";

import { useEffect, useRef, useState } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { updateSituation, retireSituation } from "@/app/taxonomy/actions";

export type SituationSummary = {
  id: string;
  slug: string;
  label: string;
  matchPhrase: string | null;
  sortOrder: number;
  womanOnly: boolean;
  listingCount: number;
};

const DIALOG =
  "m-auto max-h-[calc(100vh-48px)] w-[min(560px,calc(100vw-32px))] overflow-y-auto " +
  "rounded-card border-0 bg-surface p-0 text-ink shadow-panel backdrop:bg-ink/40";

/**
 * One situation, as a row that opens.
 *
 * Same shape as the zone list, and for the same reason: twelve of these
 * rendered as open forms was a screen nobody could scan. The row carries what
 * you look one up by, and everything else waits until you ask for it.
 */
export function SituationRow({ situation }: { situation: SituationSummary }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-hairline-soft px-1 py-4 last:border-b-0">
        <div className="flex min-w-0 flex-col gap-1">
          <span className="flex flex-wrap items-center gap-2 text-[17px] font-semibold">
            {situation.label}
            {situation.womanOnly ? (
              <span className="rounded-tag bg-sage-200 px-2 py-[2px] text-[12px] font-bold text-green-700">
                Her answer only
              </span>
            ) : null}
          </span>
          <span className="text-[14px] text-ink-60">
            <code className="rounded-[4px] bg-closed px-[5px] py-[1px] text-[13px]">
              {situation.slug}
            </code>{" "}
            &middot; on {situation.listingCount} listing
            {situation.listingCount === 1 ? "" : "s"}
            {situation.matchPhrase ? ` · “${situation.matchPhrase}”` : " · no match phrase"}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-control border-0 bg-surface px-4 py-[10px] text-[15px] font-semibold text-ink shadow-hairline transition-[color,background-color,box-shadow] duration-150 ease-out hover:shadow-hairline-gold"
        >
          <Pencil size={16} strokeWidth={2} aria-hidden="true" />
          Edit
        </button>
      </div>

      <dialog
        ref={dialogRef}
        onClose={() => setOpen(false)}
        aria-label={`Edit ${situation.label}`}
        className={DIALOG}
      >
        <div className="flex flex-col gap-5 p-6">
          <div className="flex flex-col gap-1">
            <h2 className="m-0 font-display text-[26px] font-normal leading-[1.2]">
              {situation.label}
            </h2>
            <span className="text-[14px] text-ink-60">
              <code className="rounded-[4px] bg-closed px-[5px] py-[1px] text-[13px]">
                {situation.slug}
              </code>{" "}
              cannot change, so renaming is safe at any time.
            </span>
          </div>

          <form action={updateSituation} className="flex flex-col gap-4">
            <input type="hidden" name="id" value={situation.id} />

            <div className="flex flex-wrap items-end gap-4">
              <div className="min-w-[220px] flex-1">
                <Field
                  label="Label"
                  name="label"
                  defaultValue={situation.label}
                  required
                  hint="What she reads on the chip."
                />
              </div>
              <div className="w-[110px]">
                <Field
                  label="Order"
                  name="sortOrder"
                  type="number"
                  defaultValue={String(situation.sortOrder)}
                />
              </div>
            </div>

            {/* The part that is easiest to overlook and most visible: it is
                the fragment inside "Why this matched you". */}
            <Field
              label="Match phrase"
              name="matchPhrase"
              defaultValue={situation.matchPhrase ?? ""}
              placeholder="you're returning to work"
              hint={`Reads as "Why this matched you: you told us ___". Second person, lower case, no full stop.`}
            />

            <label className="flex min-h-[44px] cursor-pointer items-center gap-3 text-[16px]">
              <input
                type="checkbox"
                name="womanOnly"
                defaultChecked={situation.womanOnly}
                className="h-[18px] w-[18px] accent-[#120902]"
              />
              <span>
                Her answer only, never a listing tag
                <span className="block text-[14px] leading-[1.5] text-ink-60">
                  For answers like &ldquo;Prefer not to say&rdquo;, which she
                  can give but no listing can claim.
                </span>
              </span>
            </label>

            <div className="flex flex-wrap justify-end gap-3">
              <Button
                type="button"
                variant="secondary"
                size="inline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" size="inline">
                Save changes
              </Button>
            </div>
          </form>

          <form
            action={retireSituation}
            className="flex flex-col gap-3 border-t border-hairline-soft pt-5"
          >
            <input type="hidden" name="id" value={situation.id} />
            <span className="text-[14px] leading-[1.5] text-ink-60">
              {/* No successor, unlike a zone: reassigning what she said about
                  herself would put words in her mouth. */}
              Retiring stops it being offered and stops it matching. Listings
              keep the tag, and you can put it back.
            </span>
            <Button
              type="submit"
              variant="destructive"
              size="inline"
              className="self-start"
            >
              Retire this situation
            </Button>
          </form>
        </div>
      </dialog>
    </>
  );
}

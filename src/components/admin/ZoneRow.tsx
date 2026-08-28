"use client";

import { useEffect, useRef, useState } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field, TextAreaField } from "@/components/ui/Field";
import { updateZone, retireZone } from "@/app/taxonomy/actions";

export type ZoneSummary = {
  id: string;
  slug: string;
  name: string;
  focus: string;
  sortOrder: number;
  organisationCount: number;
  listingCount: number;
};

/**
 * One zone, as a row that opens.
 *
 * Eight zones each rendered as an open form made the screen a wall of inputs
 * where nothing could be scanned and every field looked equally urgent. Zones
 * are read far more often than they are changed, so the list is the default
 * and editing is the exception you ask for.
 *
 * A native dialog rather than a div: focus trapping, Escape, the backdrop and
 * inertness of everything behind it are all free and all correct, and none of
 * them are things worth reimplementing.
 */
export function ZoneRow({
  zone,
  others,
  canRetire,
}: {
  zone: ZoneSummary;
  /** The zones anything attached to this one could move to. */
  others: { id: string; name: string }[];
  canRetire: boolean;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const attached = zone.organisationCount + zone.listingCount;

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
          <span className="text-[17px] font-semibold">{zone.name}</span>
          <span className="text-[14px] text-ink-60">
            <code className="rounded-[4px] bg-closed px-[5px] py-[1px] text-[13px]">
              {zone.slug}
            </code>{" "}
            &middot; {zone.organisationCount} organisation
            {zone.organisationCount === 1 ? "" : "s"}, {zone.listingCount} listing
            {zone.listingCount === 1 ? "" : "s"}
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
        aria-label={`Edit ${zone.name}`}
        className="w-[min(560px,calc(100vw-32px))] rounded-card border-0 bg-surface p-0 text-ink shadow-panel backdrop:bg-ink/40"
      >
        <div className="flex flex-col gap-5 p-6">
          <div className="flex flex-col gap-1">
            <h2 className="m-0 font-display text-[26px] font-normal leading-[1.2]">
              {zone.name}
            </h2>
            <span className="text-[14px] text-ink-60">
              {/* The slug is shown and never editable: every organisation and
                  listing holds it, so a rename must not touch identity. */}
              <code className="rounded-[4px] bg-closed px-[5px] py-[1px] text-[13px]">
                {zone.slug}
              </code>{" "}
              cannot change, so renaming is safe at any time.
            </span>
          </div>

          <form action={updateZone} className="flex flex-col gap-4">
            <input type="hidden" name="id" value={zone.id} />

            <div className="flex flex-wrap items-end gap-4">
              <div className="min-w-[220px] flex-1">
                <Field label="Name" name="name" defaultValue={zone.name} required />
              </div>
              <div className="w-[110px]">
                <Field
                  label="Order"
                  name="sortOrder"
                  type="number"
                  defaultValue={String(zone.sortOrder)}
                />
              </div>
            </div>

            <TextAreaField
              label="Focus"
              name="focus"
              rows={2}
              defaultValue={zone.focus}
              required
              hint="The line beneath the name on the organisation's zone picker."
            />

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

          {canRetire ? (
            <form
              action={retireZone}
              className="flex flex-col gap-3 border-t border-hairline-soft pt-5"
            >
              <input type="hidden" name="id" value={zone.id} />
              <label
                htmlFor={`successor-${zone.id}`}
                className="text-[15px] font-semibold"
              >
                Retire, moving everything to
              </label>
              <select
                id={`successor-${zone.id}`}
                name="successorId"
                required
                defaultValue=""
                className="min-h-[44px] rounded-control bg-surface p-3 text-[16px] text-ink shadow-hairline"
              >
                <option value="" disabled>
                  Choose a zone…
                </option>
                {others.map((other) => (
                  <option key={other.id} value={other.id}>
                    {other.name}
                  </option>
                ))}
              </select>
              {/* A count, not a warning. The difference between a decision
                  and a guess is knowing how much moves. */}
              <span className="text-[14px] leading-[1.5] text-ink-60">
                {attached === 0
                  ? "Nothing is attached, so nothing moves."
                  : `${zone.organisationCount} organisation${zone.organisationCount === 1 ? "" : "s"} and ${zone.listingCount} listing${zone.listingCount === 1 ? "" : "s"} will move.`}
              </span>
              <Button
                type="submit"
                variant="destructive"
                size="inline"
                className="self-start"
              >
                Retire this zone
              </Button>
            </form>
          ) : null}
        </div>
      </dialog>
    </>
  );
}

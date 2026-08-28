"use client";

import { useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { createSituation } from "@/app/taxonomy/actions";

const DIALOG =
  "m-auto max-h-[calc(100vh-48px)] w-[min(560px,calc(100vw-32px))] overflow-y-auto " +
  "rounded-card border-0 bg-surface p-0 text-ink shadow-panel backdrop:bg-ink/40";

/** Adding a situation, behind a button, matching the zone screen. */
export function AddSituation() {
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
      <Button
        type="button"
        size="inline"
        className="self-start px-6 py-[14px] text-[16px]"
        onClick={() => setOpen(true)}
      >
        <Plus size={17} strokeWidth={2} aria-hidden="true" />
        Add a situation
      </Button>

      <dialog
        ref={dialogRef}
        onClose={() => setOpen(false)}
        aria-label="Add a situation"
        className={DIALOG}
      >
        <div className="flex flex-col gap-5 p-6">
          <div className="flex flex-col gap-2">
            <h2 className="m-0 font-display text-[26px] font-normal leading-[1.2]">
              Add a situation
            </h2>
            <p className="m-0 text-[16px] leading-[1.6] text-ink-70">
              This puts a new chip on question three and a new tag on the
              organisation form. Existing listings will not carry it until an
              organisation ticks it.
            </p>
          </div>

          <form action={createSituation} className="flex flex-col gap-4">
            <Field
              label="Label"
              name="label"
              required
              placeholder="e.g. Leaving the armed forces"
            />
            <Field
              label="Match phrase"
              name="matchPhrase"
              placeholder="e.g. you're leaving the armed forces"
              hint="Optional. Left blank, the reason falls back to the label."
            />
            <label className="flex min-h-[44px] cursor-pointer items-center gap-3 text-[16px]">
              <input
                type="checkbox"
                name="womanOnly"
                className="h-[18px] w-[18px] accent-[#120902]"
              />
              <span>Her answer only, never a listing tag</span>
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
                Add situation
              </Button>
            </div>
          </form>
        </div>
      </dialog>
    </>
  );
}

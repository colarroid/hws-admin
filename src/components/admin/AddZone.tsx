"use client";

import { useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field, TextAreaField } from "@/components/ui/Field";
import { createZone } from "@/app/taxonomy/actions";

/**
 * Adding a zone, behind a button.
 *
 * It sat open at the bottom of the screen, which put a blank form on a page
 * whose job is to show what already exists. Adding a zone is rare and
 * deliberate, so it asks to be opened like editing one does.
 */
export function AddZone() {
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
        Add a zone
      </Button>

      <dialog
        ref={dialogRef}
        onClose={() => setOpen(false)}
        aria-label="Add a zone"
        className="w-[min(560px,calc(100vw-32px))] rounded-card border-0 bg-surface p-0 text-ink shadow-panel backdrop:bg-ink/40"
      >
        <div className="flex flex-col gap-5 p-6">
          <div className="flex flex-col gap-2">
            <h2 className="m-0 font-display text-[26px] font-normal leading-[1.2]">
              Add a zone
            </h2>
            <p className="m-0 text-[16px] leading-[1.6] text-ink-70">
              Housing, safety and rights, support for new Scots, and caring and
              family life have no zone yet. Organisations working in those areas
              have nothing to pick until one exists.
            </p>
          </div>

          <form action={createZone} className="flex flex-col gap-4">
            <Field
              label="Name"
              name="name"
              required
              placeholder="e.g. Housing &amp; Practical Support"
            />
            <TextAreaField
              label="Focus"
              name="focus"
              rows={2}
              required
              placeholder="e.g. Housing information, homelessness prevention, household support"
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
                Add zone
              </Button>
            </div>
          </form>
        </div>
      </dialog>
    </>
  );
}

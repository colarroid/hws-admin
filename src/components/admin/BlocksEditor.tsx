"use client";

import { useActionState, useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { FormError, SubmitButton } from "@/components/ui/Form";
import { addBlock, removeBlock, type CalendarState } from "@/app/bookings/actions";
import { minutesToTime, type Block } from "@/lib/design/calendar";

const DATE = new Intl.DateTimeFormat("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

/**
 * Closing a date, or part of one.
 *
 * The thing an admin actually comes back to this screen for. Holidays, an
 * afternoon out, one meeting at eleven.
 *
 * Whole day is a checkbox rather than 00:00 to 23:59, because that is how
 * somebody says it and because typing midnight twice to mean "I am not in" is
 * a small daily annoyance.
 *
 * The reason is optional and never leaves this tool. A woman sees the slot
 * missing, not why: she has no business knowing somebody is at a funeral.
 */
export function BlocksEditor({ blocks }: { blocks: Block[] }) {
  const [state, formAction] = useActionState<CalendarState, FormData>(
    addBlock,
    null,
  );
  const [pending, start] = useTransition();
  const [wholeDay, setWholeDay] = useState(true);

  return (
    <section className="flex flex-col gap-4 border-t border-hairline pt-8">
      <div className="flex flex-col gap-2">
        <h2 className="m-0 eyebrow text-ink-60">Days we are closed</h2>
        <p className="m-0 max-w-[58ch] text-[15px] leading-[1.6] text-ink-70">
          These win over the weekly pattern. Anything already booked stays
          booked, so check the bookings list before closing a day somebody has
          been given.
        </p>
      </div>

      {blocks.length > 0 ? (
        <div className="flex flex-col gap-[10px]">
          {blocks.map((block) => (
            <div
              key={block.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-card bg-surface px-5 py-4 shadow-hairline"
            >
              <span className="text-[16px] text-ink">
                <strong className="font-semibold">
                  {DATE.format(new Date(`${block.onDate}T12:00:00`))}
                </strong>
                <span className="text-ink-60">
                  {"  ·  "}
                  {block.startMinute === null
                    ? "all day"
                    : `${minutesToTime(block.startMinute)} to ${minutesToTime(block.endMinute ?? 0)}`}
                  {block.reason ? `  ·  ${block.reason}` : ""}
                </span>
              </span>
              <button
                type="button"
                disabled={pending}
                onClick={() => start(() => removeBlock(block.id))}
                aria-label={`Reopen ${block.onDate}`}
                className="inline-flex min-h-[40px] cursor-pointer items-center gap-2 rounded-control border-0 bg-ground px-4 py-2 text-[14px] font-bold text-ink disabled:opacity-40"
              >
                <Trash2 size={15} strokeWidth={2} aria-hidden="true" />
                Reopen
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="m-0 text-[15px] leading-[1.6] text-ink-60">
          Nothing closed. The weekly pattern applies to every date.
        </p>
      )}

      <form
        action={formAction}
        className="flex flex-col gap-4 rounded-card bg-surface p-5 shadow-hairline"
      >
        <FormError message={state?.error} />

        <div className="flex flex-wrap items-end gap-4">
          <label className="flex flex-col gap-2">
            <span className="text-[14px] font-semibold">Date</span>
            <input
              type="date"
              name="date"
              required
              className="min-h-[44px] rounded-control bg-ground px-3 py-2 text-[15px] text-ink shadow-hairline"
            />
          </label>

          <label className="inline-flex min-h-[44px] items-center gap-[10px] text-[15px] font-semibold">
            <input
              type="checkbox"
              name="whole"
              checked={wholeDay}
              onChange={(event) => setWholeDay(event.target.checked)}
              className="size-[18px]"
            />
            All day
          </label>

          {wholeDay ? null : (
            <>
              <label className="flex flex-col gap-2">
                <span className="text-[14px] font-semibold">From</span>
                <input
                  type="time"
                  name="start"
                  defaultValue="12:00"
                  className="min-h-[44px] rounded-control bg-ground px-3 py-2 text-[15px] text-ink shadow-hairline"
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-[14px] font-semibold">To</span>
                <input
                  type="time"
                  name="end"
                  defaultValue="14:00"
                  className="min-h-[44px] rounded-control bg-ground px-3 py-2 text-[15px] text-ink shadow-hairline"
                />
              </label>
            </>
          )}
        </div>

        <label className="flex flex-col gap-2">
          <span className="text-[14px] font-semibold">
            Why, for your own reference
          </span>
          <input
            type="text"
            name="reason"
            maxLength={200}
            placeholder="Optional. She never sees this."
            className="min-h-[44px] rounded-control bg-ground px-3 py-2 text-[15px] text-ink shadow-hairline placeholder:text-ink-60"
          />
        </label>

        <SubmitButton>Close this date</SubmitButton>
      </form>
    </section>
  );
}

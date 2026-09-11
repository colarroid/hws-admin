"use client";

import { useActionState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { FormError, SubmitButton } from "@/components/ui/Form";
import { addHours, removeHours, type CalendarState } from "@/app/bookings/actions";
import { minutesToTime, type OpeningHours } from "@/lib/design/calendar";

/**
 * The hours, which are the same on every date.
 *
 * One line is the normal case: ten to four, half-hour slots. A second line is
 * a morning and an afternoon with lunch between them. There is no weekday
 * here and no date — this is the shape of a day HWS is in, and the calendar
 * below says which days those are.
 *
 * Native time inputs rather than dropdowns of every half hour: the browser
 * already knows how to ask for a time on a phone, and it does it better than
 * a list of forty-eight options.
 *
 * Deleting is immediate and has no confirmation. Nothing is lost that cannot
 * be typed again in five seconds, and bookings already taken are unaffected:
 * removing hours stops new slots being offered, it does not cancel anybody.
 */
export function OpeningHoursEditor({ hours }: { hours: OpeningHours[] }) {
  const [state, formAction] = useActionState<CalendarState, FormData>(
    addHours,
    null,
  );
  const [pending, start] = useTransition();

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <h2 className="m-0 eyebrow text-ink-60">Hours</h2>
        <p className="m-0 max-w-[58ch] text-[15px] leading-[1.6] text-ink-70">
          The same on every day the calendar below is open.
        </p>
      </div>

      {hours.length > 0 ? (
        <div className="flex flex-col gap-[10px]">
          {hours.map((span) => (
            <div
              key={span.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-card bg-surface px-5 py-4 shadow-hairline"
            >
              <span className="text-[16px] text-ink">
                <strong className="font-semibold tabular-nums">
                  {minutesToTime(span.startMinute)} to{" "}
                  {minutesToTime(span.endMinute)}
                </strong>
                <span className="text-ink-60">
                  {"  ·  "}
                  {span.slotMinutes} minute slots
                </span>
              </span>
              <button
                type="button"
                disabled={pending}
                onClick={() => start(() => removeHours(span.id))}
                aria-label={`Remove ${minutesToTime(span.startMinute)} to ${minutesToTime(span.endMinute)}`}
                className="inline-flex min-h-[40px] cursor-pointer items-center gap-2 rounded-control border-0 bg-ground px-4 py-2 text-[14px] font-bold text-ink disabled:opacity-40"
              >
                <Trash2 size={15} strokeWidth={2} aria-hidden="true" />
                Remove
              </button>
            </div>
          ))}
        </div>
      ) : null}

      <form
        action={formAction}
        className="flex flex-col gap-4 rounded-card bg-surface p-5 shadow-hairline"
      >
        <FormError message={state?.error} />

        <div className="flex flex-wrap items-end gap-4">
          <label className="flex flex-col gap-2">
            <span className="text-[14px] font-semibold">From</span>
            <input
              type="time"
              name="start"
              defaultValue="10:00"
              required
              className="min-h-[44px] rounded-control bg-ground px-3 py-2 text-[15px] text-ink shadow-hairline"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-[14px] font-semibold">To</span>
            <input
              type="time"
              name="end"
              defaultValue="16:00"
              required
              className="min-h-[44px] rounded-control bg-ground px-3 py-2 text-[15px] text-ink shadow-hairline"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-[14px] font-semibold">Slot</span>
            <select
              name="slot"
              defaultValue="30"
              className="min-h-[44px] rounded-control bg-ground px-3 py-2 text-[15px] text-ink shadow-hairline"
            >
              {[20, 30, 45, 60].map((minutes) => (
                <option key={minutes} value={minutes}>
                  {minutes} min
                </option>
              ))}
            </select>
          </label>
        </div>

        <SubmitButton>
          {hours.length === 0 ? "Set these hours" : "Add these hours"}
        </SubmitButton>
      </form>
    </section>
  );
}

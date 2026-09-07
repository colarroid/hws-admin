"use client";

import { useActionState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { FormError, SubmitButton } from "@/components/ui/Form";
import {
  addAvailability,
  removeAvailability,
  type CalendarState,
} from "@/app/bookings/actions";
import {
  WEEKDAYS,
  minutesToTime,
  type AvailabilityRule,
} from "@/lib/design/calendar";

/**
 * The weekly pattern.
 *
 * A rule per line, and a row of fields to add another. Native time inputs
 * rather than dropdowns of every half hour: the browser already knows how to
 * ask for a time on a phone, and it does it better than a list of forty-eight
 * options.
 *
 * Deleting is immediate and has no confirmation. Nothing is lost that cannot
 * be typed again in five seconds, and bookings already taken are unaffected:
 * removing a rule stops new slots being offered, it does not cancel anybody.
 */
export function AvailabilityEditor({ rules }: { rules: AvailabilityRule[] }) {
  const [state, formAction] = useActionState<CalendarState, FormData>(
    addAvailability,
    null,
  );
  const [pending, start] = useTransition();

  return (
    <section className="flex flex-col gap-4">
      <h2 className="m-0 eyebrow text-ink-60">Every week</h2>

      {rules.length > 0 ? (
        <div className="flex flex-col gap-[10px]">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-card bg-surface px-5 py-4 shadow-hairline"
            >
              <span className="text-[16px] text-ink">
                <strong className="font-semibold">{WEEKDAYS[rule.weekday]}s</strong>
                {"  "}
                {minutesToTime(rule.startMinute)} to {minutesToTime(rule.endMinute)}
                <span className="text-ink-60">
                  {"  ·  "}
                  {rule.slotMinutes} minute slots
                </span>
              </span>
              <button
                type="button"
                disabled={pending}
                onClick={() => start(() => removeAvailability(rule.id))}
                aria-label={`Remove ${WEEKDAYS[rule.weekday]}s`}
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
            <span className="text-[14px] font-semibold">Day</span>
            <select
              name="weekday"
              defaultValue="2"
              className="min-h-[44px] rounded-control bg-ground px-3 py-2 text-[15px] text-ink shadow-hairline"
            >
              {WEEKDAYS.map((day, index) => (
                <option key={day} value={index}>
                  {day}
                </option>
              ))}
            </select>
          </label>

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

        <SubmitButton>Add these hours</SubmitButton>
      </form>
    </section>
  );
}

"use client";

import { useTransition } from "react";
import { Check, Mail, Phone, X } from "lucide-react";
import { cancelBooking, markBookingDone } from "@/app/bookings/actions";
import type { Booking } from "@/lib/design/calendar";

const WHEN = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/London",
});

/**
 * One call, with everything needed to make it.
 *
 * Her contact details are links rather than text, because the next thing
 * anybody does with this row is ring or email her, and making that a
 * copy-and-paste is a small tax paid several times a day.
 *
 * What she searched for sits under her name rather than behind a click. It is
 * the whole reason this calendar is ours: a scheduling company would have
 * given us a name and a time and nothing else.
 */
export function BookingRow({ booking }: { booking: Booking }) {
  const [pending, start] = useTransition();
  const cancelled = booking.status === "cancelled";
  const done = booking.status === "done";

  const context = [
    booking.need && `Searched for “${booking.need}”`,
    booking.place && `in ${booking.place}`,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={[
        "flex flex-col gap-4 rounded-card bg-surface p-6 shadow-hairline sm:flex-row sm:items-start sm:justify-between",
        cancelled ? "opacity-55" : "",
      ].join(" ")}
    >
      <div className="flex min-w-0 flex-col gap-2">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="font-display text-[20px] font-normal leading-[1.3] text-ink">
            {booking.name}
          </span>
          <span className="text-[14px] font-bold tracking-[0.08em] text-ink-60">
            {booking.reference}
          </span>
        </div>

        <span className="text-[15px] font-semibold text-ink">
          {WHEN.format(new Date(booking.slotAt))} · {booking.slotMinutes} min
        </span>

        {context ? (
          <span className="text-[15px] leading-[1.5] text-ink-65">{context}</span>
        ) : null}

        {booking.situations.length > 0 ? (
          <span className="text-[14px] leading-[1.5] text-ink-60">
            Told us: {booking.situations.join(", ")}
          </span>
        ) : null}

        {booking.note ? (
          <p className="m-0 mt-1 max-w-[58ch] rounded-control bg-ground px-4 py-3 text-[15px] leading-[1.55] text-ink">
            {booking.note}
          </p>
        ) : null}

        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
          <a
            href={`mailto:${booking.email}`}
            className="inline-flex min-h-[38px] items-center gap-[6px] text-[15px] font-semibold text-gold-700 no-underline hover:underline"
          >
            <Mail size={15} strokeWidth={2} aria-hidden="true" />
            {booking.email}
          </a>
          {booking.phone ? (
            <a
              href={`tel:${booking.phone.replace(/\s/g, "")}`}
              className="inline-flex min-h-[38px] items-center gap-[6px] text-[15px] font-semibold text-gold-700 no-underline hover:underline"
            >
              <Phone size={15} strokeWidth={2} aria-hidden="true" />
              {booking.phone}
            </a>
          ) : null}
        </div>
      </div>

      {cancelled || done ? (
        <span className="shrink-0 self-start whitespace-nowrap rounded-pill-sm bg-closed px-[11px] py-[7px] text-[13px] font-bold text-ink-65">
          {cancelled ? "Cancelled" : "Done"}
        </span>
      ) : (
        <div className="flex shrink-0 flex-wrap gap-2 sm:flex-col">
          <button
            type="button"
            disabled={pending}
            onClick={() => start(() => markBookingDone(booking.id))}
            className="inline-flex min-h-[40px] cursor-pointer items-center gap-2 whitespace-nowrap rounded-control border-0 bg-ground px-4 py-2 text-[14px] font-bold text-ink disabled:opacity-40"
          >
            <Check size={15} strokeWidth={2} aria-hidden="true" />
            Done
          </button>
          {/* No confirmation step and no email from here. Cancelling reopens
              the slot; telling her is a message a person should write. */}
          <button
            type="button"
            disabled={pending}
            onClick={() => start(() => cancelBooking(booking.id))}
            className="inline-flex min-h-[40px] cursor-pointer items-center gap-2 whitespace-nowrap rounded-control border-0 bg-red-50 px-4 py-2 text-[14px] font-bold text-red-700 disabled:opacity-40"
          >
            <X size={15} strokeWidth={2} aria-hidden="true" />
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

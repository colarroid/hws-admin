"use client";

import { useMemo, useOptimistic, useState, useTransition } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { closeDates, openDates } from "@/app/bookings/actions";
import {
  WEEKDAYS,
  WEEKDAYS_SHORT,
  WEEK_ORDER,
  minutesToTime,
  monthGrid,
  monthLabel,
  monthOf,
  shiftMonth,
  type Block,
  type OpeningHours,
} from "@/lib/design/calendar";

/**
 * The month, open by default.
 *
 * This replaced a weekly pattern, and the direction is the point. The pattern
 * said nothing is open until somebody opens it; this says every day is open
 * until somebody takes it off. HWS asked for the second, and it is also the
 * safer failure: forget to do anything here and the calendar still offers
 * times, which somebody may have to decline. The other way round, forgetting
 * means telling every woman there is nothing free, correctly and silently.
 *
 * A square is a toggle, not a selection. There is no confirm step and no save
 * button because there is nothing to get half-done: one press takes a day
 * off, the same press puts it back, and both are visible immediately whether
 * or not the server has answered yet.
 *
 * The weekday headers take the whole column, which is how weekends get closed
 * without fourteen presses a month. They toggle as a set: if every one of
 * that weekday is already off, pressing it puts them all back.
 *
 * What this cannot do is say "never Saturdays" once. Days off are dates, so
 * closing the weekend is a monthly job. If that becomes a thing somebody
 * forgets, the fix is a standing weekday exclusion rather than going back to
 * opening dates by hand.
 */
export function MonthEditor({
  hours,
  blocks,
  today,
}: {
  hours: OpeningHours[];
  blocks: Block[];
  /** Today in Europe/London. From the server, so the grid cannot disagree. */
  today: string;
}) {
  const [cursor, setCursor] = useState(() => monthOf(today));
  const [pending, start] = useTransition();

  const closed = useMemo(
    () =>
      new Set(
        blocks.filter((b) => b.startMinute === null).map((b) => b.onDate),
      ),
    [blocks],
  );

  // Part-day closures are somebody else's business — the editor below owns
  // them — but the square has to say one exists, or an admin looking at an
  // open-looking Thursday does not know an hour of it has gone.
  const partial = useMemo(() => {
    const map = new Map<string, number>();
    for (const b of blocks) {
      if (b.startMinute === null) continue;
      map.set(b.onDate, (map.get(b.onDate) ?? 0) + 1);
    }
    return map;
  }, [blocks]);

  const [shown, apply] = useOptimistic(
    closed,
    (state: Set<string>, change: { dates: string[]; close: boolean }) => {
      const next = new Set(state);
      for (const date of change.dates) {
        if (change.close) next.add(date);
        else next.delete(date);
      }
      return next;
    },
  );

  const squares = useMemo(() => monthGrid(cursor), [cursor]);
  const live = (square: (typeof squares)[number]) =>
    square.inMonth && square.date >= today;

  const set = (dates: string[], close: boolean) => {
    if (dates.length === 0) return;
    start(() => {
      apply({ dates, close });
      if (close) closeDates(dates);
      else openDates(dates);
    });
  };

  const toggleWeekday = (weekday: number) => {
    const dates = squares
      .filter((square) => live(square) && square.weekday === weekday)
      .map((square) => square.date);
    if (dates.length === 0) return;

    // Every one already off means the press is asking for them back.
    const allClosed = dates.every((date) => shown.has(date));
    set(
      allClosed ? dates : dates.filter((date) => !shown.has(date)),
      !allClosed,
    );
  };

  const atStart =
    cursor.year === monthOf(today).year && cursor.month === monthOf(today).month;

  const offThisMonth = squares.filter(
    (square) => live(square) && shown.has(square.date),
  ).length;

  return (
    <section className="flex flex-col gap-4 border-t border-hairline pt-8">
      <div className="flex flex-col gap-2">
        <h2 className="m-0 eyebrow text-ink-60">Days off</h2>
        <p className="m-0 max-w-[58ch] text-[15px] leading-[1.6] text-ink-70">
          Every day is open for the hours above. Press a day to take it off.
          Press a weekday name to take the whole column off, which is how
          weekends are done.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-[15px] text-ink-70">
          {offThisMonth === 0
            ? "Nothing off this month."
            : `${offThisMonth} day${offThisMonth === 1 ? "" : "s"} off this month.`}
        </span>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setCursor((c) => shiftMonth(c, -1))}
            disabled={atStart}
            aria-label="Previous month"
            className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-control border-0 bg-ground text-ink disabled:cursor-default disabled:opacity-30"
          >
            <ChevronLeft size={17} strokeWidth={2} aria-hidden="true" />
          </button>
          <span
            aria-live="polite"
            className="min-w-[9.5rem] text-center text-[16px] font-semibold text-ink"
          >
            {monthLabel(cursor)}
          </span>
          <button
            type="button"
            onClick={() => setCursor((c) => shiftMonth(c, 1))}
            aria-label="Next month"
            className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-control border-0 bg-ground text-ink"
          >
            <ChevronRight size={17} strokeWidth={2} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div
        aria-busy={pending}
        className="flex flex-col gap-3 rounded-card bg-surface p-4 shadow-hairline sm:p-5"
      >
        {/* The weekday headers double as the close-the-column control. One row
            instead of two, and the thing you press sits directly above the
            column it changes, which is the only place it could be. */}
        <div className="grid grid-cols-7 gap-[6px]">
          {WEEK_ORDER.map((weekday) => (
            <button
              key={weekday}
              type="button"
              onClick={() => toggleWeekday(weekday)}
              title={`Take every ${WEEKDAYS[weekday]} this month off, or put them back`}
              className="cursor-pointer rounded-control border-0 bg-transparent py-2 text-[12px] font-bold uppercase tracking-[0.08em] text-ink-60 hover:bg-gold-200 hover:text-gold-700"
            >
              {WEEKDAYS_SHORT[weekday]}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-[6px]">
          {squares.map((square) => {
            if (!square.inMonth) {
              return (
                <div
                  key={square.date}
                  aria-hidden="true"
                  className="min-h-[64px] rounded-control"
                />
              );
            }

            const isOff = shown.has(square.date);
            const parts = partial.get(square.date) ?? 0;
            const selectable = live(square);

            return (
              <button
                key={square.date}
                type="button"
                disabled={!selectable}
                onClick={() => set([square.date], !isOff)}
                aria-pressed={isOff}
                aria-label={`${square.date}${isOff ? ", off" : ", open"}`}
                className={[
                  "flex min-h-[64px] cursor-pointer flex-col items-start gap-[3px] rounded-control border-0 px-2 py-[7px] text-left transition-colors duration-100",
                  !selectable
                    ? "cursor-default bg-transparent text-ink-40"
                    : isOff
                      ? "bg-ground text-ink-40"
                      : "bg-gold-200 text-gold-700 hover:bg-gold-300",
                ].join(" ")}
              >
                <span
                  className={`text-[14px] font-semibold ${
                    selectable && isOff ? "line-through" : ""
                  }`}
                >
                  {square.day}
                </span>

                {selectable && !isOff && hours.length > 0 ? (
                  <span className="text-[10px] leading-[1.3] tabular-nums">
                    {minutesToTime(hours[0].startMinute)}–
                    {minutesToTime(hours[0].endMinute)}
                    {hours.length > 1 ? " +" : ""}
                  </span>
                ) : null}

                {selectable && !isOff && parts > 0 ? (
                  <span className="text-[10px] leading-[1.3]">
                    part closed
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

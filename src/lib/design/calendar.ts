/**
 * The calendar's shapes, its two conversions, and the month arithmetic.
 *
 * Split out of lib/data/booking.ts because the editors that use them are
 * client components, and importing a value from that module dragged
 * `next/headers` into the browser bundle through the Supabase client. Types
 * alone would have been erased; everything below is a value, so it has to
 * live somewhere that reads nothing.
 *
 * Nothing here touches the local clock except where it is handed a date to
 * start from. Dates are built and read in UTC and only ever formatted, which
 * is what stops a day appearing to move when the clocks change: a calendar
 * square is a label, not an instant, and treating it as an instant is how
 * these things end up a day out for half the year.
 */

/**
 * A span of the day HWS is open, on every date.
 *
 * There is no date and no weekday on it, which is the whole of the model: a
 * date is open unless a block closes it. One row is the normal case. Two are
 * a morning and an afternoon.
 */
export type OpeningHours = {
  id: string;
  startMinute: number;
  endMinute: number;
  slotMinutes: number;
};

export type Block = {
  id: string;
  onDate: string;
  startMinute: number | null;
  endMinute: number | null;
  reason: string | null;
};

export type Booking = {
  id: string;
  reference: string;
  slotAt: string;
  slotMinutes: number;
  name: string;
  email: string;
  phone: string | null;
  need: string | null;
  place: string | null;
  situations: string[];
  note: string | null;
  status: string;
};

/** Index matches getUTCDay(), so nothing has to be translated. */
export const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export const WEEKDAYS_SHORT = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
] as const;

/**
 * The weekdays in the order a British calendar draws them, still carrying
 * their getUTCDay() index. Monday first: a week that starts on Sunday puts
 * the weekend either side of the working days and makes "every Tuesday"
 * harder to see, which is the main thing an admin is looking for here.
 */
export const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0] as const;

/** 600 becomes "10:00". Minutes past midnight is how the table stores it. */
export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** "10:00" becomes 600. Null for anything that is not a time. */
export function timeToMinutes(value: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (h > 23 || m > 59) return null;
  return h * 60 + m;
}

/** True for a string that is a calendar date and nothing else. */
export function isDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export type Month = { year: number; month: number };

/** The month a YYYY-MM-DD belongs to. `month` is 0-indexed, as Date has it. */
export function monthOf(date: string): Month {
  return { year: Number(date.slice(0, 4)), month: Number(date.slice(5, 7)) - 1 };
}

/** Step a month forward or back, rolling the year over. */
export function shiftMonth({ year, month }: Month, by: number): Month {
  const n = year * 12 + month + by;
  return { year: Math.floor(n / 12), month: ((n % 12) + 12) % 12 };
}

/** "September 2026". */
export function monthLabel({ year, month }: Month): string {
  return new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(Date.UTC(year, month, 1));
}

export type Square = {
  /** YYYY-MM-DD. */
  date: string;
  /** The number shown in the square. */
  day: number;
  /** getUTCDay(): 0 is Sunday. */
  weekday: number;
  /** False for the leading and trailing days borrowed from either side. */
  inMonth: boolean;
};

/**
 * One month as a grid of whole weeks, Monday first.
 *
 * Always whole weeks, so the grid is a clean 7 by 5 or 7 by 6 and the days
 * borrowed from the months either side keep their real dates. Those are
 * rendered faintly and are not selectable: a square that looks like a day but
 * silently belongs to another month is worse than a gap.
 */
export function monthGrid(month: Month): Square[] {
  const first = new Date(Date.UTC(month.year, month.month, 1));
  // How many days to reach back to the Monday on or before the 1st.
  const lead = (first.getUTCDay() + 6) % 7;

  const start = new Date(first);
  start.setUTCDate(start.getUTCDate() - lead);

  // Day 0 of the next month is the last day of this one.
  const length = new Date(Date.UTC(month.year, month.month + 1, 0)).getUTCDate();
  // Whole weeks, and six rows only when the month actually needs them.
  const total = Math.ceil((lead + length) / 7) * 7;

  const squares: Square[] = [];
  for (let i = 0; i < total; i += 1) {
    const d = new Date(start);
    d.setUTCDate(d.getUTCDate() + i);
    squares.push({
      date: d.toISOString().slice(0, 10),
      day: d.getUTCDate(),
      weekday: d.getUTCDay(),
      inMonth: d.getUTCMonth() === month.month && d.getUTCFullYear() === month.year,
    });
  }
  return squares;
}


/**
 * The calendar's shapes and its two conversions, with nothing behind them.
 *
 * Split out of lib/data/booking.ts because the editors that use them are
 * client components, and importing a value from that module dragged
 * `next/headers` into the browser bundle through the Supabase client. Types
 * alone would have been erased; `WEEKDAYS` and `minutesToTime` are values, so
 * they have to live somewhere that reads nothing.
 */

export type AvailabilityRule = {
  id: string;
  weekday: number;
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

/** Index matches extract(dow), so nothing has to be translated. */
export const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

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

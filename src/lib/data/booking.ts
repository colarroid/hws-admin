import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/data/admin";
import type {
  AvailabilityRule,
  Block,
  Booking,
} from "@/lib/design/calendar";

/**
 * The calendar, from the side that sets it.
 *
 * Straight table reads, unlike the woman-facing side, which goes through two
 * security-definer functions because she is allowed to know only which times
 * are free. An admin is allowed to know everything, so RLS on `is_admin()`
 * is the whole of the access control here.
 */

export type {
  AvailabilityRule,
  Block,
  Booking,
} from "@/lib/design/calendar";

export async function getAvailability(): Promise<AvailabilityRule[]> {
  await requireAdmin();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("booking_availability")
    .select("id, weekday, start_minute, end_minute, slot_minutes")
    .order("weekday")
    .order("start_minute");

  // Thrown, not swallowed. An admin looking at an empty availability screen
  // must be looking at no rules rather than at a failed read: the first is a
  // calendar to set up and the second is a calendar that has silently
  // stopped offering anybody a time.
  if (error) throw new Error(`booking_availability read failed: ${error.message}`);

  return (data ?? []).map((row) => ({
    id: row.id,
    weekday: row.weekday,
    startMinute: row.start_minute,
    endMinute: row.end_minute,
    slotMinutes: row.slot_minutes,
  }));
}

/** Blocks from today onwards. Past ones are history nobody needs to see. */
export async function getBlocks(): Promise<Block[]> {
  await requireAdmin();
  const supabase = await createClient();

  const today = new Date().toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("booking_blocks")
    .select("id, on_date, start_minute, end_minute, reason")
    .gte("on_date", today)
    .order("on_date");

  if (error) throw new Error(`booking_blocks read failed: ${error.message}`);

  return (data ?? []).map((row) => ({
    id: row.id,
    onDate: row.on_date,
    startMinute: row.start_minute,
    endMinute: row.end_minute,
    reason: row.reason,
  }));
}

/**
 * Bookings, soonest first, upcoming by default.
 *
 * Past ones are kept and readable, because "what did she say when she booked"
 * is a question somebody asks after the call as often as before it.
 */
export async function getBookings(options?: {
  includePast?: boolean;
}): Promise<Booking[]> {
  await requireAdmin();
  const supabase = await createClient();

  let query = supabase
    .from("bookings")
    .select(
      "id, reference, slot_at, slot_minutes, name, email, phone, need, place, situations, note, status",
    )
    .order("slot_at");

  if (!options?.includePast) {
    query = query.gte("slot_at", new Date().toISOString());
  }

  const { data, error } = await query;
  if (error) throw new Error(`bookings read failed: ${error.message}`);

  return (data ?? []).map((row) => ({
    id: row.id,
    reference: row.reference,
    slotAt: row.slot_at,
    slotMinutes: row.slot_minutes,
    name: row.name,
    email: row.email,
    phone: row.phone,
    need: row.need,
    place: row.place,
    situations: row.situations ?? [],
    note: row.note,
    status: row.status,
  }));
}

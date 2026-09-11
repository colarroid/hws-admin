"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/data/admin";
import { isDate, timeToMinutes } from "@/lib/design/calendar";

export type CalendarState = { error?: string } | null;

/**
 * Setting when HWS is open, and when it is not.
 *
 * Every one of these re-checks the admin before it writes. RLS would refuse
 * anyway, but a policy failure surfaces as a confusing empty result and a
 * check here surfaces as a redirect to sign in, which is the true answer.
 */

/**
 * Set the hours HWS is open. They apply to every date.
 *
 * Upsert rather than insert, on the unique span index. Saving the same hours
 * twice is then a no-op instead of an error about a duplicate key.
 */
export async function addHours(
  _prev: CalendarState,
  formData: FormData,
): Promise<CalendarState> {
  await requireAdmin();

  const start = timeToMinutes(String(formData.get("start") ?? ""));
  const end = timeToMinutes(String(formData.get("end") ?? ""));
  const slot = Number(formData.get("slot") ?? 30);

  if (start === null || end === null) {
    return { error: "Times need to look like 10:00." };
  }
  if (end <= start) {
    return { error: "The finish has to be after the start." };
  }
  if (end - start < slot) {
    return { error: `That is less than one ${slot} minute slot.` };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("booking_availability")
    .upsert(
      { start_minute: start, end_minute: end, slot_minutes: slot },
      { onConflict: "start_minute,end_minute" },
    );

  if (error) return { error: error.message };

  revalidatePath("/bookings/availability");
  return null;
}

export async function removeHours(id: string) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("booking_availability").delete().eq("id", id);
  revalidatePath("/bookings/availability");
}

/**
 * Take days off.
 *
 * A whole-day block per date. Delete first, so pressing this on a day that is
 * already off leaves one block rather than two — there is no unique index to
 * upsert against, and a partial one over `start_minute is null` is more
 * machinery than two statements are worth.
 *
 * The delete is narrowed to whole-day blocks so it cannot quietly remove a
 * part-day closure that the blocks editor below put there, which carries a
 * reason somebody typed.
 *
 * Bookings already taken are untouched. Closing a day stops new slots being
 * offered on it and cancels nobody: a booking that needs cancelling is
 * cancelled from the bookings screen, by a person who then writes to her.
 */
export async function closeDates(dates: string[]) {
  await requireAdmin();

  const clean = dates.filter(isDate);
  if (clean.length === 0) return;

  const supabase = await createClient();

  await supabase
    .from("booking_blocks")
    .delete()
    .in("on_date", clean)
    .is("start_minute", null);

  const { error } = await supabase
    .from("booking_blocks")
    .insert(clean.map((on_date) => ({ on_date })));

  if (error) throw new Error(`closing dates failed: ${error.message}`);

  revalidatePath("/bookings/availability");
}

/**
 * Put days back.
 *
 * Only the whole-day closures. A part-day block on the same date is somebody
 * saying "I have a meeting at eleven", and reopening the day should not throw
 * that away as well.
 */
export async function openDates(dates: string[]) {
  await requireAdmin();

  const clean = dates.filter(isDate);
  if (clean.length === 0) return;

  const supabase = await createClient();
  await supabase
    .from("booking_blocks")
    .delete()
    .in("on_date", clean)
    .is("start_minute", null);

  revalidatePath("/bookings/availability");
}

/**
 * Close part of a date.
 *
 * Whole days are the calendar's job now — a square you press — so this is
 * only ever a span, and the checkbox that used to mean "all day" is gone
 * rather than left as a second way to do the same thing.
 *
 * The reason is for the admin and never leaves this tool. A woman choosing a
 * time sees the slot missing, not why: she has no business knowing somebody
 * is at a funeral on Thursday.
 */
export async function addBlock(
  _prev: CalendarState,
  formData: FormData,
): Promise<CalendarState> {
  await requireAdmin();

  const onDate = String(formData.get("date") ?? "").trim();
  if (!isDate(onDate)) return { error: "Pick a date." };

  const start = timeToMinutes(String(formData.get("start") ?? ""));
  const end = timeToMinutes(String(formData.get("end") ?? ""));

  if (start === null || end === null) {
    return { error: "Give a start and a finish." };
  }
  if (end <= start) {
    return { error: "The finish has to be after the start." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("booking_blocks").insert({
    on_date: onDate,
    start_minute: start,
    end_minute: end,
    reason: String(formData.get("reason") ?? "").trim() || null,
  });

  if (error) return { error: error.message };

  revalidatePath("/bookings/availability");
  return null;
}

export async function removeBlock(id: string) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("booking_blocks").delete().eq("id", id);
  revalidatePath("/bookings/availability");
}

/**
 * Cancel a booking.
 *
 * Marked rather than deleted, so the slot reopens without the record of the
 * conversation disappearing. `free_slots` already ignores anything cancelled.
 *
 * She is not emailed from here. Telling somebody her call is off is a message
 * that should be written by a person, and a form that sends it in one click
 * makes that the easy path.
 */
export async function cancelBooking(id: string) {
  await requireAdmin();
  const supabase = await createClient();

  await supabase
    .from("bookings")
    .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
    .eq("id", id);

  revalidatePath("/bookings");
}

/** Mark it as having happened. Keeps the upcoming list honest. */
export async function markBookingDone(id: string) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("bookings").update({ status: "done" }).eq("id", id);
  revalidatePath("/bookings");
}

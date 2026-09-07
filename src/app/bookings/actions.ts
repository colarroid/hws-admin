"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/data/admin";
import { timeToMinutes } from "@/lib/design/calendar";

export type CalendarState = { error?: string } | null;

/**
 * Setting when HWS is open, and when it is not.
 *
 * Every one of these re-checks the admin before it writes. RLS would refuse
 * anyway, but a policy failure surfaces as a confusing empty result and a
 * check here surfaces as a redirect to sign in, which is the true answer.
 */

/** Add a weekly rule: "Tuesdays, ten to four, half-hour slots". */
export async function addAvailability(
  _prev: CalendarState,
  formData: FormData,
): Promise<CalendarState> {
  await requireAdmin();

  const weekday = Number(formData.get("weekday"));
  const start = timeToMinutes(String(formData.get("start") ?? ""));
  const end = timeToMinutes(String(formData.get("end") ?? ""));
  const slot = Number(formData.get("slot") ?? 30);

  if (!Number.isInteger(weekday) || weekday < 0 || weekday > 6) {
    return { error: "Pick a day." };
  }
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
  const { error } = await supabase.from("booking_availability").insert({
    weekday,
    start_minute: start,
    end_minute: end,
    slot_minutes: slot,
  });

  if (error) return { error: error.message };

  revalidatePath("/bookings/availability");
  return null;
}

export async function removeAvailability(id: string) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("booking_availability").delete().eq("id", id);
  revalidatePath("/bookings/availability");
}

/**
 * Close a date, or part of one.
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
  if (!/^\d{4}-\d{2}-\d{2}$/.test(onDate)) return { error: "Pick a date." };

  const wholeDay = formData.get("whole") === "on";
  const start = wholeDay ? null : timeToMinutes(String(formData.get("start") ?? ""));
  const end = wholeDay ? null : timeToMinutes(String(formData.get("end") ?? ""));

  if (!wholeDay && (start === null || end === null)) {
    return { error: "Give a start and a finish, or tick the whole day." };
  }
  if (start !== null && end !== null && end <= start) {
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

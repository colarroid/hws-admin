"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export type FormState = { error?: string } | null;

const schema = z.object({
  email: z.string().trim().min(1, "Add your email address.").email(),
  password: z.string().min(1, "Add your password."),
});

/**
 * Sign in with an email address and a password.
 *
 * Nothing here can create an account. Admin is granted by hand against the
 * database, because `handle_new_user` resolves any self-claimed role other
 * than `organisation` to `woman`, so there is no path from this screen to
 * becoming staff.
 *
 * One message covers both a wrong password and an address that is not staff
 * at all. Distinguishing them would turn this form into a way to ask which
 * addresses belong to HWS, and that is worth more to an attacker than it is
 * to the handful of people who work here.
 */
export async function signIn(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = schema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  const denied = { error: "That email address and password do not match." };

  if (error || !data.user) return denied;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    // Real credentials for an account that is not staff: an organisation, or
    // a woman. Sign the session straight back out rather than leaving this
    // deployment holding one it should never have opened.
    await supabase.auth.signOut();
    return denied;
  }

  redirect("/queue");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/sign-in");
}

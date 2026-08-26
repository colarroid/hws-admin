"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export type FormState = { error?: string } | null;

const email = z.string().trim().min(1, "Add your email address.").email();

/**
 * Send a sign-in code.
 *
 * `shouldCreateUser` is false, so this can never bring an account into
 * existence. Admin accounts are made by hand; there is no path from this
 * screen to becoming one.
 */
export async function sendCode(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = email.safeParse(formData.get("email"));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  await supabase.auth.signInWithOtp({
    email: parsed.data,
    options: { shouldCreateUser: false },
  });

  // The same response either way. This screen never confirms whether an
  // address belongs to staff.
  redirect(`/sign-in/code?email=${encodeURIComponent(parsed.data)}`);
}

export async function verifyCode(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const address = String(formData.get("email") ?? "");
  const token = String(formData.get("code") ?? "").replace(/\D/g, "");

  if (token.length < 6) return { error: "That code looks too short." };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.verifyOtp({
    email: address,
    token,
    type: "email",
  });

  if (error || !data.user) {
    return { error: "That code didn't work. Ask for a new one below." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    // A valid code for a real account that is not staff. Sign the session
    // straight back out rather than leaving it half-open.
    await supabase.auth.signOut();
    return { error: "That account doesn't have access to these tools." };
  }

  redirect("/queue");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/sign-in");
}

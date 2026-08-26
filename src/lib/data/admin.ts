import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type Admin = { id: string; email: string };

/**
 * The signed-in admin, or null.
 *
 * Being signed in is not enough. Every organisation and every woman on the
 * platform has a Supabase session too, and this deployment must be useless
 * to both. The role comes from `profiles`, which nothing self-assigns:
 * `handle_new_user` resolves anything other than `organisation` to `woman`,
 * so an admin row is only ever created by hand against the database.
 */
export async function getAdmin(): Promise<Admin | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (data?.role !== "admin") return null;

  return { id: user.id, email: user.email ?? "" };
}

/** Guard for every page behind sign-in. */
export async function requireAdmin(): Promise<Admin> {
  const admin = await getAdmin();
  if (!admin) redirect("/sign-in");
  return admin;
}

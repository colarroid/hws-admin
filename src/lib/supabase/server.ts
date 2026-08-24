import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Server-side Supabase client, cookie-backed so the session survives
 * navigation and server actions.
 *
 * Env is read at call time rather than module load, so the app still builds
 * and the design work still renders before credentials are wired up.
 */
export async function createClient() {
  // Read cookies first. Any route reaching this is session-dependent, and
  // touching cookies is what opts it out of static prerendering. Throwing
  // above this line would fail the build instead.
  const cookieStore = await cookies();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and " +
        "NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local (see .env.example).",
    );
  }

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component, where cookies are read-only.
          // Middleware refreshes the session, so this is safe to ignore.
        }
      },
    },
  });
}

/** True when credentials are present. Used to render an honest setup notice. */
export function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

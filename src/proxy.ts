import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Keeps the session alive across requests.
 *
 * Named proxy.ts rather than middleware.ts because Next 16 deprecated the
 * middleware convention and renamed it; the file does the same job under the
 * new name, and the exported function has to be called `proxy` to be found.
 *
 * Every server.ts in this codebase swallows the cookie write it cannot do
 * from a Server Component and says "middleware refreshes the session, so this
 * is safe to ignore". That was true of the pattern it was copied from and was
 * not true here, because there was no such file. The consequence is quiet
 * and nasty: once the access token expires, a Server Component render spends
 * the refresh token, gets a new pair back, and then cannot write them down,
 * because a Server Component cannot set a cookie. With refresh token rotation
 * on, the token it just spent is now dead, so the next request has nothing
 * left to refresh with and the person is signed out mid-task with no
 * explanation. It looks like a random logout and it is not random at all: it
 * is an hour after signing in, every time.
 *
 * The fix is this file. Cookies are readable and writable here, so this is
 * where the refresh happens: getClaims() renews the pair if it is due, the
 * new cookies go onto both the request (so this render sees them) and the
 * response (so the browser keeps them), and the Server Component further down
 * finds a valid session and has nothing to write.
 *
 * Two rules for anybody editing this:
 *
 *   * Always return the `response` object built here, or one that copies its
 *     cookies. Returning a fresh NextResponse.next() throws away the rotated
 *     tokens and re-creates the bug.
 *   * Do not put anything between creating the client and calling getClaims.
 *     A stray await in the middle is the usual cause of sessions that expire
 *     at random.
 *
 * This does no authorisation. Which pages need a session is decided by the
 * pages themselves, next to the data they are protecting, and RLS decides it
 * again in the database. A proxy that redirects is a proxy somebody
 * eventually trusts as the only guard.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // The design work renders before credentials are wired up, and a middleware
  // that threw here would take every page down with it.
  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // The call that does the work. It validates the access token and refreshes
  // the pair when it is close to expiry, which is the only reason this file
  // exists. The result is deliberately unused.
  await supabase.auth.getClaims();

  return response;
}

export const config = {
  matcher: [
    /*
     * Everything except the things that never carry a session: Next's own
     * build output, the favicon and static image files. Refreshing a token on
     * a request for a PNG costs a round trip to Supabase and buys nothing.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};

import Link from "next/link";
import { LogOut } from "lucide-react";
import { MobileNav } from "@/components/ui/MobileNav";
import { getAdmin } from "@/lib/data/admin";
import { signOut } from "@/app/actions";

const LINK =
  "inline-flex min-h-[44px] items-center rounded-full shadow-hairline bg-surface " +
  "px-4 py-[9px] text-[15px] font-semibold text-ink no-underline " +
  "transition-[color,background-color,box-shadow] duration-150 ease-out hover:shadow-hairline-gold";

/**
 * Sign out.
 *
 * A form posting to a server action rather than a link, since signing out is
 * a state change and must not be something a prefetch or a crawler can do.
 *
 * Icon only on the desktop row, where four links already fill it, and
 * labelled in the mobile panel. This matches both other headers.
 */
function SignOutControl({ label = false }: { label?: boolean }) {
  return (
    <form action={signOut} className={label ? "contents" : "flex"}>
      <button
        type="submit"
        aria-label={label ? undefined : "Sign out"}
        className={[
          "inline-flex min-h-[44px] cursor-pointer items-center justify-center",
          "rounded-full border-0 bg-surface text-ink shadow-hairline",
          "transition-[color,background-color,box-shadow] duration-150 ease-out",
          "hover:shadow-hairline-gold",
          label
            ? "w-full gap-2 px-4 py-[9px] text-[15px] font-semibold"
            : "min-w-[44px]",
        ].join(" ")}
      >
        <LogOut size={17} strokeWidth={2} aria-hidden="true" />
        {label ? <span>Sign out</span> : null}
      </button>
    </form>
  );
}

/** One list, two layouts, so the desktop row and mobile panel cannot drift. */
function Links() {
  return (
    <>
      <Link href="/queue" className={LINK}>Review queue</Link>
      <Link href="/organisations" className={LINK}>Verify</Link>
      <Link href="/taxonomy/zones" className={LINK}>Access Zones</Link>
      <Link href="/taxonomy/situations" className={LINK}>Situations</Link>
    </>
  );
}

/**
 * Shown only once signed in, since nothing here is reachable otherwise.
 *
 * Four items is already too many for a phone, and this is the tool most
 * likely to be opened on one: a listing needs checking and someone is not at
 * their desk.
 */
export async function AdminNav() {
  const admin = await getAdmin();
  if (!admin) return null;

  return (
    <>
      <nav aria-label="Admin" className="hidden flex-wrap items-center gap-2 lg:flex">
        <Links />
        <SignOutControl />
      </nav>

      <MobileNav label="admin menu">
        <Links />
        <SignOutControl label />
      </MobileNav>
    </>
  );
}

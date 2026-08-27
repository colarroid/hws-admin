import Link from "next/link";
import { MobileNav } from "@/components/ui/MobileNav";
import { getAdmin } from "@/lib/data/admin";

const LINK =
  "inline-flex min-h-[44px] items-center rounded-full shadow-hairline bg-surface " +
  "px-4 py-[9px] text-[15px] font-semibold text-ink no-underline " +
  "transition-[color,background-color,box-shadow] duration-150 ease-out hover:shadow-hairline-gold";

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
      </nav>

      <MobileNav label="admin menu">
        <Links />
      </MobileNav>
    </>
  );
}

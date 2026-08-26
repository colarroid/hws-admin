import Link from "next/link";
import { getAdmin } from "@/lib/data/admin";

const LINK =
  "inline-flex min-h-[44px] items-center rounded-full border border-ring bg-surface px-4 py-[9px] text-[15px] font-semibold text-ink no-underline transition-colors duration-150 ease-out hover:border-gold-500";

/** Shown only once signed in, since nothing here is reachable otherwise. */
export async function AdminNav() {
  const admin = await getAdmin();
  if (!admin) return null;

  return (
    <nav aria-label="Admin" className="flex flex-wrap items-center gap-2">
      <Link href="/queue" className={LINK}>Review queue</Link>
      <Link href="/taxonomy/zones" className={LINK}>Access Zones</Link>
      <Link href="/taxonomy/situations" className={LINK}>Situations</Link>
    </nav>
  );
}

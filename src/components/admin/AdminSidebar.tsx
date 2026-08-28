import Image from "next/image";
import Link from "next/link";
import { AdminNavList } from "@/components/admin/AdminNavList";

/**
 * The admin rail.
 *
 * Near-black rather than the cream the other two portals use, and that is the
 * point: these are internal tools sitting on the same database as a service
 * built to feel warm and unofficial. Someone with an organisation portal and
 * the admin tools open in two tabs should never have to read the page to know
 * which one they are typing into.
 *
 * Below the desktop breakpoint it is not rendered. The header keeps the menu
 * panel there, holding the same places.
 */
export function AdminSidebar() {
  return (
    <aside className="hidden w-[248px] shrink-0 border-r border-ink bg-ink lg:block">
      <div className="sticky top-0 flex h-screen flex-col px-5 py-6">
        <Link
          href="/queue"
          aria-label="HWS Pathgrid admin, listings"
          className="mb-7 flex shrink-0 items-center no-underline"
        >
          {/* A white cut of the mark rather than a filter over the dark one.
              The wordmark and the ring carry their colour differently, so a
              blanket invert would not have caught both. */}
          <Image
            src="/logo-white.svg"
            alt=""
            width={100}
            height={36}
            priority
            unoptimized
          />
        </Link>

        <AdminNavList variant="rail" />
      </div>
    </aside>
  );
}

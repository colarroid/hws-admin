import { MobileNav } from "@/components/ui/MobileNav";
import { AdminNavList } from "@/components/admin/AdminNavList";
import { getAdmin } from "@/lib/data/admin";

/**
 * The menu below the desktop breakpoint, where there is no rail.
 *
 * The desktop row it used to hold is gone: the rail carries navigation there
 * now, and the panel and the rail render from one list so they cannot drift.
 *
 * Shown only once signed in, since nothing here is reachable otherwise. Four
 * items is already too many for a phone, and this is the tool most likely to
 * be opened on one: a listing needs checking and someone is not at their desk.
 */
export async function AdminNav() {
  const admin = await getAdmin();
  if (!admin) return null;

  return (
    <MobileNav label="admin menu">
      <AdminNavList variant="panel" />
    </MobileNav>
  );
}

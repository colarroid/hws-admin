import "server-only";
import { createClient } from "@/lib/supabase/server";

export type AccessZone = {
  id: string;
  slug: string;
  name: string;
  focus: string;
};

/**
 * The Access Zones, in admin-set order.
 *
 * Comes from the database rather than a constant, because an HWS admin can
 * add, rename, re-describe or retire one without a release. Retired zones are
 * filtered out by RLS, so a retired zone stops being offered without any
 * change here.
 */
export async function getAccessZones(): Promise<AccessZone[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("access_zones")
    .select("id, slug, name, focus")
    .is("retired_at", null)
    .order("sort_order");

  if (error) throw error;
  return data ?? [];
}

export type MyOrganisation = {
  id: string;
  name: string;
  type: string;
  website: string | null;
  place: string | null;
  blurb: string | null;
  status: string;
  primaryZoneId: string | null;
  alsoZoneIds: string[];
};

/** The organisation the signed-in user belongs to, if any. */
export async function getMyOrganisation(): Promise<MyOrganisation | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: membership } = await supabase
    .from("organisation_members")
    .select("organisation_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!membership) return null;

  const { data: org } = await supabase
    .from("organisations")
    .select("id, name, type, website, place, blurb, status")
    .eq("id", membership.organisation_id)
    .single();

  if (!org) return null;

  const { data: zones } = await supabase
    .from("organisation_zones")
    .select("zone_id, role")
    .eq("organisation_id", org.id);

  return {
    ...org,
    primaryZoneId: zones?.find((z) => z.role === "primary")?.zone_id ?? null,
    alsoZoneIds: (zones ?? [])
      .filter((z) => z.role === "also")
      .map((z) => z.zone_id),
  };
}

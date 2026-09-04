import "server-only";
import { createClient } from "@/lib/supabase/server";

/**
 * Secondary markets: what an organisation can be used for.
 *
 * Distinct from its Access Zones, which say where it lives. A zone is what an
 * organisation says about itself during onboarding; a market is HWS's own
 * judgment about what a woman can reach through it, and it is assigned here
 * rather than by the organisation. She is trusting that judgment, not their
 * marketing.
 *
 * From the PathGrid map. The document lists about fifty terms across its rows
 * and twenty in its own vocabulary; these are the twenty.
 */

export type Market = {
  id: string;
  slug: string;
  label: string;
};

export async function getMarkets(): Promise<Market[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("secondary_markets")
    .select("id, slug, label")
    .is("retired_at", null)
    .order("sort_order");

  if (error) throw error;
  return data ?? [];
}

export async function getMarketsForOrganisation(
  organisationId: string,
): Promise<string[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("organisation_markets")
    .select("market_id")
    .eq("organisation_id", organisationId);

  if (error) throw error;
  return (data ?? []).map((row) => row.market_id);
}

export type AccessZone = {
  id: string;
  slug: string;
  name: string;
  focus: string;
};

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

export async function getZonesForOrganisation(
  organisationId: string,
): Promise<{ primaryId: string | null; alsoIds: string[] }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("organisation_zones")
    .select("zone_id, role")
    .eq("organisation_id", organisationId);

  if (error) throw error;

  return {
    primaryId: (data ?? []).find((z) => z.role === "primary")?.zone_id ?? null,
    alsoIds: (data ?? [])
      .filter((z) => z.role === "also")
      .map((z) => z.zone_id),
  };
}

/**
 * Every organisation, for the picker on the listing form.
 *
 * Unverified ones included and labelled. An admin posting on behalf of an
 * organisation that has not been checked yet is a decision they can make with
 * their eyes open; hiding it would only make them create a duplicate.
 */
export async function getOrganisationOptions(): Promise<
  { id: string; name: string; status: string; unclaimed: boolean }[]
> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("organisations")
    .select("id, name, status, organisation_members ( user_id )")
    .order("name");

  if (error) throw error;

  type Row = {
    id: string;
    name: string;
    status: string;
    organisation_members: { user_id: string }[] | null;
  };

  return ((data ?? []) as unknown as Row[]).map((row) => ({
    id: row.id,
    name: row.name,
    status: row.status,
    unclaimed: (row.organisation_members ?? []).length === 0,
  }));
}

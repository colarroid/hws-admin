import "server-only";
import { createClient } from "@/lib/supabase/server";

export type Situation = {
  id: string;
  slug: string;
  label: string;
};

export type OrganisationOption = {
  id: string;
  name: string;
  status: string;
  /** Nobody holds an account for it: HWS entered it. */
  unclaimed: boolean;
};

/**
 * The situations a listing can be tagged with.
 *
 * `woman_only` ones are excluded: "Prefer not to say" is something a woman
 * says about herself and cannot be a property of a listing.
 */
export async function getSituations(): Promise<Situation[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("situations")
    .select("id, slug, label")
    .eq("woman_only", false)
    .is("retired_at", null)
    .order("sort_order");

  if (error) throw error;
  return data ?? [];
}

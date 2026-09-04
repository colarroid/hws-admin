import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

const NOTES: Record<string, string> = {
  town: "town",
  council_area: "council area",
  postcode_district: "postcode area",
};

/**
 * Place lookup for "Where you are based".
 *
 * Deliberately the same query, and the same `value` shape, as the copy on the
 * woman-facing side. Her answer is substring-matched against this string when
 * her results are ranked, so the two sides have to be drawing on one
 * vocabulary. Free text here and canonical text there would match only when
 * the two happened to agree.
 *
 * `value` keeps every level of the place, town and council area both. That is
 * what lets "My area" match on the town while "Nearby areas" widens to the
 * council area around it.
 *
 * Places are not personal data, so this is readable signed out. It has to be:
 * onboarding step 1 runs before there is an organisation to belong to.
 */
export async function GET(request: NextRequest) {
  const query = (request.nextUrl.searchParams.get("q") ?? "").trim();
  if (query.length < 2) return NextResponse.json([]);

  const supabase = await createClient();
  const { data } = await supabase
    .from("places")
    .select("name, kind, council_area")
    .ilike("name", `${query}%`)
    .order("kind")
    .limit(6);

  return NextResponse.json(
    (data ?? []).map((place) => ({
      name: place.name,
      note: place.council_area ?? NOTES[place.kind] ?? place.kind,
      value: [place.name, place.council_area].filter(Boolean).join(" · "),
    })),
  );
}

import type { Metadata } from "next";
import { Page } from "@/components/ui/Page";
import { Button } from "@/components/ui/Button";
import { requireAdmin } from "@/lib/data/admin";
import { getSituations } from "@/lib/data/taxonomy";
import { SituationRow } from "@/components/admin/SituationRow";
import { AddSituation } from "@/components/admin/AddSituation";
import { restoreSituation } from "../actions";

export const metadata: Metadata = { title: "Situations" };

/**
 * Situation management.
 *
 * One list feeds two screens: the chips a woman ticks on question three, and
 * the tags an organisation puts on a listing. Editing here changes both,
 * which is the point of it being one table.
 *
 * A list, with editing behind a dialog, matching the zone screen. Twelve of
 * these as open forms was a wall of inputs where nothing could be scanned.
 *
 * The match phrase is the part that is easy to overlook and most visible. It
 * is the fragment that appears in "Why this matched you", and the labels are
 * a mix of verb and noun phrases, so no single sentence template fits them
 * all. Left blank the ranker falls back to the label, which reads bluntly
 * rather than breaking, so the row says when one is missing.
 */
export default async function SituationsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireAdmin();
  const { error } = await searchParams;
  const situations = await getSituations();

  const live = situations.filter((s) => !s.retiredAt);
  const retired = situations.filter((s) => s.retiredAt);

  return (
    <Page width={820} top={56} gap={30}>
      <div className="flex flex-col gap-[10px]">
        <h1 className="m-0 font-display text-[32px] font-normal leading-[1.1] tracking-[-0.01em] sm:text-[42px]">
          Situations
        </h1>
        <p className="m-0 max-w-[62ch] text-[17px] leading-[1.55] text-ink-70">
          What a woman ticks about herself on question three, and what an
          organisation tags a listing with. Same list, both sides.
        </p>
      </div>

      {error ? (
        <p
          role="alert"
          className="m-0 rounded-control border border-red-200 bg-red-50 px-4 py-3 text-[16px] leading-[1.5] text-red-700"
        >
          {error === "missing" ? "A situation needs a label." : error}
        </p>
      ) : null}

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="m-0 eyebrow text-ink-60">{live.length} in use</h2>
          <AddSituation />
        </div>

        <div className="flex flex-col rounded-card bg-surface px-[22px] py-2 shadow-hairline">
          {live.map((situation) => (
            <SituationRow
              key={situation.id}
              situation={{
                id: situation.id,
                slug: situation.slug,
                label: situation.label,
                matchPhrase: situation.matchPhrase,
                sortOrder: situation.sortOrder,
                womanOnly: situation.womanOnly,
                listingCount: situation.listingCount,
              }}
            />
          ))}
        </div>
      </section>

      {retired.length > 0 ? (
        <section className="flex flex-col gap-[14px]">
          <h2 className="m-0 eyebrow text-ink-60">Retired</h2>
          {retired.map((situation) => (
            <form
              key={situation.id}
              action={restoreSituation}
              className="flex flex-wrap items-center justify-between gap-4 rounded-card bg-surface-subtle p-5 shadow-hairline"
            >
              <input type="hidden" name="id" value={situation.id} />
              <div className="flex flex-col gap-1">
                <span className="text-[17px] font-bold">{situation.label}</span>
                <span className="text-[14px] text-ink-60">
                  Still on {situation.listingCount} listing
                  {situation.listingCount === 1 ? "" : "s"}
                </span>
              </div>
              <Button type="submit" variant="secondary" size="inline">
                Put back in use
              </Button>
            </form>
          ))}
        </section>
      ) : null}
    </Page>
  );
}

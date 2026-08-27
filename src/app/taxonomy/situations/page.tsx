import { Page } from "@/components/ui/Page";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { requireAdmin } from "@/lib/data/admin";
import { getSituations } from "@/lib/data/taxonomy";
import {
  createSituation,
  updateSituation,
  retireSituation,
  restoreSituation,
} from "../actions";

/**
 * Situation management.
 *
 * One list feeds two screens: the chips a woman ticks on question three, and
 * the tags an organisation puts on a listing. Editing here changes both,
 * which is the point of it being one table.
 *
 * The match phrase is the part that is easy to overlook and most visible.
 * It is the fragment that appears in "Why this matched you", and the labels
 * are a mix of verb and noun phrases, so no single sentence template fits
 * them all. Left blank the ranker falls back to the label, which reads
 * bluntly rather than breaking.
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

      <section className="flex flex-col gap-[14px]">
        <h2 className="m-0 eyebrow text-ink-60">
          {live.length} in use
        </h2>

        {live.map((situation) => (
          <div
            key={situation.id}
            className="flex flex-col gap-4 rounded-card shadow-hairline bg-surface p-6"
          >
            <form action={updateSituation} className="flex flex-col gap-4">
              <input type="hidden" name="id" value={situation.id} />

              <div className="flex flex-wrap items-end gap-4">
                <div className="min-w-[240px] flex-1">
                  <Field
                    label="Label"
                    name="label"
                    defaultValue={situation.label}
                    required
                    hint="What she reads on the chip."
                  />
                </div>
                <div className="w-[110px]">
                  <Field
                    label="Order"
                    name="sortOrder"
                    type="number"
                    defaultValue={String(situation.sortOrder)}
                  />
                </div>
              </div>

              <Field
                label="Match phrase"
                name="matchPhrase"
                defaultValue={situation.matchPhrase ?? ""}
                placeholder="you're returning to work"
                hint={`Reads as "Why this matched you: you told us ___". Second person, lower case, no full stop.`}
              />

              <label className="flex min-h-[44px] cursor-pointer items-center gap-3 text-[16px]">
                <input
                  type="checkbox"
                  name="womanOnly"
                  defaultChecked={situation.womanOnly}
                  className="h-[18px] w-[18px] accent-[#120902]"
                />
                <span>
                  Her answer only, never a listing tag
                  <span className="block text-[14px] leading-[1.5] text-ink-60">
                    For answers like &ldquo;Prefer not to say&rdquo;, which she
                    can give but no listing can claim.
                  </span>
                </span>
              </label>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-[14px] text-ink-60">
                  <code className="rounded-[4px] bg-closed px-[5px] py-[1px] text-[13px]">
                    {situation.slug}
                  </code>{" "}
                  &middot; on {situation.listingCount} listing
                  {situation.listingCount === 1 ? "" : "s"}
                </span>
                <div className="flex gap-3">
                  <Button type="submit" variant="secondary" size="inline">
                    Save changes
                  </Button>
                </div>
              </div>
            </form>

            <form
              action={retireSituation}
              className="flex flex-wrap items-center justify-between gap-3 border-t border-hairline-soft pt-4"
            >
              <input type="hidden" name="id" value={situation.id} />
              <span className="text-[14px] leading-[1.5] text-ink-60">
                {/* No successor, unlike a zone: reassigning what she said
                    about herself would put words in her mouth. */}
                Retiring stops it being offered and stops it matching. Listings
                keep the tag, and you can put it back.
              </span>
              <Button type="submit" variant="destructive" size="inline">
                Retire
              </Button>
            </form>
          </div>
        ))}
      </section>

      <section className="flex flex-col gap-4 rounded-card-lg shadow-hairline bg-surface p-6">
        <h2 className="m-0 font-display text-[24px] font-normal leading-[1.2]">
          Add a situation
        </h2>
        <p className="m-0 max-w-[62ch] text-[16px] leading-[1.6] text-ink-70">
          Adding one puts a new chip on question three and a new tag on the
          organisation form. Existing listings will not carry it until an
          organisation ticks it.
        </p>
        <form action={createSituation} className="flex flex-col gap-4">
          <Field
            label="Label"
            name="label"
            required
            placeholder="e.g. Leaving the armed forces"
          />
          <Field
            label="Match phrase"
            name="matchPhrase"
            placeholder="e.g. you're leaving the armed forces"
            hint="Optional. Left blank, the reason falls back to the label."
          />
          <label className="flex min-h-[44px] cursor-pointer items-center gap-3 text-[16px]">
            <input
              type="checkbox"
              name="womanOnly"
              className="h-[18px] w-[18px] accent-[#120902]"
            />
            <span>Her answer only, never a listing tag</span>
          </label>
          <Button type="submit" size="inline" className="self-start px-6 py-4">
            Add situation
          </Button>
        </form>
      </section>

      {retired.length > 0 ? (
        <section className="flex flex-col gap-[14px]">
          <h2 className="m-0 eyebrow text-ink-60">
            Retired
          </h2>
          {retired.map((situation) => (
            <form
              key={situation.id}
              action={restoreSituation}
              className="flex flex-wrap items-center justify-between gap-4 rounded-card shadow-hairline bg-surface-subtle p-5"
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

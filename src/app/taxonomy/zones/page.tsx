import type { Metadata } from "next";
import { Page } from "@/components/ui/Page";
import { Button } from "@/components/ui/Button";
import { Field, TextAreaField } from "@/components/ui/Field";
import { requireAdmin } from "@/lib/data/admin";
import { getZones } from "@/lib/data/taxonomy";
import {
  createZone,
  updateZone,
  retireZone,
  restoreZone,
} from "../actions";

const DATE = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export const metadata: Metadata = { title: "Access Zones" };

/**
 * Access Zone management.
 *
 * The brief is explicit that zones are created and maintained by an HWS
 * administrator, so the taxonomy can grow as the ecosystem does without a
 * release. This is that screen.
 *
 * Three things it has to get right, all of them consequences of zones being
 * data rather than an enumerated type:
 *
 *   - The slug is shown but never editable. Every organisation and listing
 *     holds it, so identity and name have to be separable or a rename breaks
 *     everything attached.
 *   - Retiring collects a destination, and says how much will move. The brief
 *     requires a defined path for whatever is attached, and a count is the
 *     difference between a decision and a guess.
 *   - Retired zones stay visible here and can be restored. An admin who
 *     cannot see what they retired cannot undo it.
 */
export default async function ZonesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireAdmin();
  const { error } = await searchParams;
  const zones = await getZones();

  const live = zones.filter((z) => !z.retiredAt);
  const retired = zones.filter((z) => z.retiredAt);

  return (
    <Page width={820} top={56} gap={30}>
      <div className="flex flex-col gap-[10px]">
        <h1 className="m-0 font-display text-[32px] font-normal leading-[1.1] tracking-[-0.01em] sm:text-[42px]">
          Access Zones
        </h1>
        <p className="m-0 max-w-[62ch] text-[17px] leading-[1.55] text-ink-70">
          Where an organisation sits in the ecosystem. Organisations pick from
          these during onboarding; women are never asked. Renaming one is safe
          at any time.
        </p>
      </div>

      {error ? (
        <p
          role="alert"
          className="m-0 rounded-control border border-red-200 bg-red-50 px-4 py-3 text-[16px] leading-[1.5] text-red-700"
        >
          {error === "missing"
            ? "A zone needs a name and a focus line."
            : error === "successor"
              ? "Choose a different zone for everything attached to move to."
              : error}
        </p>
      ) : null}

      <section className="flex flex-col gap-[14px]">
        <h2 className="m-0 eyebrow text-ink-60">
          {live.length} in use
        </h2>

        {live.map((zone) => (
          <div
            key={zone.id}
            className="flex flex-col gap-4 rounded-card shadow-hairline bg-surface p-6"
          >
            <form action={updateZone} className="flex flex-col gap-4">
              <input type="hidden" name="id" value={zone.id} />

              <div className="flex flex-wrap items-end gap-4">
                <div className="min-w-[240px] flex-1">
                  <Field label="Name" name="name" defaultValue={zone.name} required />
                </div>
                <div className="w-[110px]">
                  <Field
                    label="Order"
                    name="sortOrder"
                    type="number"
                    defaultValue={String(zone.sortOrder)}
                  />
                </div>
              </div>

              <TextAreaField
                label="Focus"
                name="focus"
                rows={2}
                defaultValue={zone.focus}
                required
                hint="The line beneath the name on the organisation's zone picker."
              />

              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-[14px] text-ink-60">
                  <code className="rounded-[4px] bg-closed px-[5px] py-[1px] text-[13px]">
                    {zone.slug}
                  </code>{" "}
                  &middot; {zone.organisationCount} organisation
                  {zone.organisationCount === 1 ? "" : "s"},{" "}
                  {zone.listingCount} listing
                  {zone.listingCount === 1 ? "" : "s"}
                </span>
                <Button type="submit" variant="secondary" size="inline">
                  Save changes
                </Button>
              </div>
            </form>

            {live.length > 1 ? (
              <form
                action={retireZone}
                className="flex flex-wrap items-end gap-3 border-t border-hairline-soft pt-4"
              >
                <input type="hidden" name="id" value={zone.id} />
                <div className="flex min-w-[260px] flex-1 flex-col gap-2">
                  <label
                    htmlFor={`successor-${zone.id}`}
                    className="text-[15px] font-semibold"
                  >
                    Retire, moving everything to
                  </label>
                  <select
                    id={`successor-${zone.id}`}
                    name="successorId"
                    required
                    defaultValue=""
                    className="min-h-[44px] rounded-control shadow-hairline bg-surface p-3 text-[16px] text-ink"
                  >
                    <option value="" disabled>
                      Choose a zone…
                    </option>
                    {live
                      .filter((other) => other.id !== zone.id)
                      .map((other) => (
                        <option key={other.id} value={other.id}>
                          {other.name}
                        </option>
                      ))}
                  </select>
                  <span className="text-[14px] leading-[1.5] text-ink-60">
                    {zone.organisationCount + zone.listingCount === 0
                      ? "Nothing is attached, so nothing moves."
                      : `${zone.organisationCount} organisation${zone.organisationCount === 1 ? "" : "s"} and ${zone.listingCount} listing${zone.listingCount === 1 ? "" : "s"} will move.`}
                  </span>
                </div>
                <Button type="submit" variant="destructive" size="inline">
                  Retire
                </Button>
              </form>
            ) : null}
          </div>
        ))}
      </section>

      <section className="flex flex-col gap-4 rounded-card-lg shadow-hairline bg-surface p-6">
        <h2 className="m-0 font-display text-[24px] font-normal leading-[1.2]">
          Add a zone
        </h2>
        <p className="m-0 max-w-[62ch] text-[16px] leading-[1.6] text-ink-70">
          Four areas from the original category list have no zone: housing,
          safety and rights, support for new Scots, and caring and family life.
          Until they do, organisations working in those areas can only reach
          the platform through hand routing.
        </p>
        <form action={createZone} className="flex flex-col gap-4">
          <Field
            label="Name"
            name="name"
            required
            placeholder="e.g. Housing &amp; Practical Support"
          />
          <TextAreaField
            label="Focus"
            name="focus"
            rows={2}
            required
            placeholder="e.g. Housing information, homelessness prevention, household support"
          />
          <Button type="submit" size="inline" className="self-start px-6 py-4">
            Add zone
          </Button>
        </form>
      </section>

      {retired.length > 0 ? (
        <section className="flex flex-col gap-[14px]">
          <h2 className="m-0 eyebrow text-ink-60">
            Retired
          </h2>
          {retired.map((zone) => (
            <form
              key={zone.id}
              action={restoreZone}
              className="flex flex-wrap items-center justify-between gap-4 rounded-card shadow-hairline bg-surface-subtle p-5"
            >
              <input type="hidden" name="id" value={zone.id} />
              <div className="flex flex-col gap-1">
                <span className="text-[17px] font-bold">{zone.name}</span>
                <span className="text-[14px] text-ink-60">
                  Retired {DATE.format(new Date(zone.retiredAt!))}
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

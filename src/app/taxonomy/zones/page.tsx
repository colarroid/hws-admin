import type { Metadata } from "next";
import { Page } from "@/components/ui/Page";
import { Button } from "@/components/ui/Button";
import { requireAdmin } from "@/lib/data/admin";
import { getZones } from "@/lib/data/taxonomy";
import { ZoneRow } from "@/components/admin/ZoneRow";
import { AddZone } from "@/components/admin/AddZone";
import { restoreZone } from "../actions";

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
 * A list, with editing behind a dialog. Every zone used to render as an open
 * form, which made a wall of inputs where nothing could be scanned and every
 * field looked equally urgent. Zones are read far more often than they are
 * changed.
 *
 * Three things it still has to get right, all of them consequences of zones
 * being data rather than an enumerated type:
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

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="m-0 eyebrow text-ink-60">{live.length} in use</h2>
          <AddZone />
        </div>

        <div className="flex flex-col rounded-card bg-surface px-[22px] py-2 shadow-hairline">
          {live.map((zone) => (
            <ZoneRow
              key={zone.id}
              zone={{
                id: zone.id,
                slug: zone.slug,
                name: zone.name,
                focus: zone.focus,
                sortOrder: zone.sortOrder,
                organisationCount: zone.organisationCount,
                listingCount: zone.listingCount,
              }}
              others={live
                .filter((other) => other.id !== zone.id)
                .map((other) => ({ id: other.id, name: other.name }))}
              // Retiring the last one would leave organisations with nothing
              // to pick, so it is not offered.
              canRetire={live.length > 1}
            />
          ))}
        </div>
      </section>

      {retired.length > 0 ? (
        <section className="flex flex-col gap-[14px]">
          <h2 className="m-0 eyebrow text-ink-60">Retired</h2>
          {retired.map((zone) => (
            <form
              key={zone.id}
              action={restoreZone}
              className="flex flex-wrap items-center justify-between gap-4 rounded-card bg-surface-subtle p-5 shadow-hairline"
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

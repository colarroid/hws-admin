"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import { CheckboxGroup } from "@/components/ui/Choice";
import { Button } from "@/components/ui/Button";
import { saveClassification } from "@/app/organisations/new/actions";
import type { AccessZone, Market } from "@/lib/data/markets";

/**
 * HWS's own layer on top of what an organisation said about itself.
 *
 * Access Zones used to be editable here and are not any more. They are the
 * organisation's account of where it works, chosen at onboarding, and an
 * admin moving one changes what that organisation is understood to do
 * without anybody there being told. They also decide who appears under each
 * zone on Discover, so a stray click on this screen rewrote a public page.
 *
 * They are shown, because deciding on a verification without seeing them
 * would be deciding on a name and a registration number. Shown and not
 * editable is the whole change.
 *
 * Markets are the opposite case and stay editable. No organisation ever sees
 * or chooses one; they are HWS's editorial judgement about what a woman can
 * reach through this organisation, and this screen is the only place they
 * can be set at all.
 */
export function ClassificationForm({
  organisationId,
  zones,
  markets,
  primaryZoneId,
  alsoZoneIds,
  marketIds,
}: {
  organisationId: string;
  zones: AccessZone[];
  markets: Market[];
  primaryZoneId: string | null;
  alsoZoneIds: string[];
  marketIds: string[];
}) {
  const [selected, setSelected] = useState<string[]>(marketIds);

  const marketOptions = markets.map((m) => ({ slug: m.id, label: m.label }));
  const nameOf = (id: string) => zones.find((z) => z.id === id)?.name ?? id;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 rounded-card bg-ground px-5 py-4">
        <div className="flex items-center gap-2">
          <Lock size={15} strokeWidth={2} className="shrink-0 text-ink-60" aria-hidden="true" />
          <h3 className="m-0 eyebrow text-ink-60">Access Zones</h3>
        </div>

        {primaryZoneId || alsoZoneIds.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {primaryZoneId ? (
              <span className="rounded-pill-sm bg-surface px-[13px] py-[7px] text-[15px] font-semibold text-ink shadow-hairline">
                {nameOf(primaryZoneId)}
                <span className="font-normal text-ink-60"> · primary</span>
              </span>
            ) : null}
            {alsoZoneIds.map((id) => (
              <span
                key={id}
                className="rounded-pill-sm bg-surface px-[13px] py-[7px] text-[15px] text-ink shadow-hairline"
              >
                {nameOf(id)}
              </span>
            ))}
          </div>
        ) : (
          <p className="m-0 text-[15px] leading-[1.5] text-ink-70">
            None chosen yet. This organisation has not finished onboarding.
          </p>
        )}

        {/* Says where it comes from, so somebody who wants it changed knows
            who to ask rather than hunting for a control that is not here. */}
        <p className="m-0 max-w-[62ch] text-[14px] leading-[1.55] text-ink-60">
          Chosen by the organisation when it onboarded, or set when it was
          entered by hand. Not changed from here: these decide where it
          appears on Discover, and moving one rewrites a public page without
          telling them.
        </p>
      </div>

      <form action={saveClassification} className="flex flex-col gap-5">
        <input type="hidden" name="organisationId" value={organisationId} />

        <CheckboxGroup
          legend="Secondary markets"
          hint="What a woman can reach through them. This is what puts them in front of her when she describes a need, so it matters more than the zone. Yours to set: they never see this."
          name="markets"
          options={marketOptions}
          selected={selected}
          onChange={setSelected}
          columns
        />

        <Button type="submit" size="inline" className="self-start">
          Save markets
        </Button>
      </form>
    </div>
  );
}

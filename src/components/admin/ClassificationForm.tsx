"use client";

import { useState } from "react";
import { CheckboxGroup, RadioGroup } from "@/components/ui/Choice";
import { Button } from "@/components/ui/Button";
import { saveClassification } from "@/app/organisations/new/actions";
import type { AccessZone, Market } from "@/lib/data/markets";

/**
 * HWS's own layer on top of what an organisation said about itself.
 *
 * Zones and markets only. Everything else on this page is the organisation's
 * account of itself and is edited in its own portal; keeping the two apart is
 * what stops an admin quietly rewriting somebody's words.
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
  const [primary, setPrimary] = useState(primaryZoneId ?? "");
  const [also, setAlso] = useState<string[]>(alsoZoneIds);
  const [selected, setSelected] = useState<string[]>(marketIds);

  const zoneOptions = zones.map((z) => ({ slug: z.id, label: z.name }));
  const marketOptions = markets.map((m) => ({ slug: m.id, label: m.label }));

  return (
    <form action={saveClassification} className="flex flex-col gap-5">
      <input type="hidden" name="organisationId" value={organisationId} />

      <RadioGroup
        legend="Primary Access Zone"
        name="primaryZone"
        options={zoneOptions}
        value={primary}
        onChange={(next) => {
          setPrimary(next);
          setAlso((current) => current.filter((id) => id !== next));
        }}
        columns
      />

      <CheckboxGroup
        legend="Also works in"
        hint="At most two."
        name="alsoZones"
        options={zoneOptions.filter((z) => z.slug !== primary)}
        selected={also}
        onChange={(next) => setAlso(next.slice(-2))}
        columns
      />

      <CheckboxGroup
        legend="Secondary markets"
        hint="What a woman can reach through them. This is what puts them in front of her when she describes a need, so it matters more than the zone."
        name="markets"
        options={marketOptions}
        selected={selected}
        onChange={setSelected}
        columns
      />

      <Button type="submit" size="inline" className="self-start">
        Save classification
      </Button>
    </form>
  );
}

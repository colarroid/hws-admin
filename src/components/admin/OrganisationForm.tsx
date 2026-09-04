"use client";

import { useActionState, useState } from "react";
import { Field, TextAreaField } from "@/components/ui/Field";
import { PlaceField } from "@/components/ui/PlaceField";
import { CheckboxGroup, RadioGroup } from "@/components/ui/Choice";
import { FormError, SubmitButton } from "@/components/ui/Form";
import { createOrganisation } from "@/app/organisations/new/actions";
import {
  AUDIENCES,
  AVAILABILITY,
  COSTS,
  COVERAGE,
  COVERAGE_NEEDS_DETAIL,
  FORMATS,
  ORGANISATION_TYPES,
  POSTING_FREQUENCY,
  SOLUTION_KINDS,
} from "@/lib/design/taxonomy";
import type { FormState } from "@/app/actions";
import type { AccessZone, Market } from "@/lib/data/markets";

function Section({
  title,
  blurb,
  children,
}: {
  title: string;
  blurb: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-5 rounded-card bg-surface p-6 shadow-hairline sm:p-7">
      <div className="flex flex-col gap-[6px]">
        <h2 className="m-0 font-display text-[24px] font-normal leading-[1.2]">
          {title}
        </h2>
        <p className="m-0 max-w-[62ch] text-[15px] leading-[1.6] text-ink-70">
          {blurb}
        </p>
      </div>
      {children}
    </section>
  );
}

/**
 * Entering an organisation that has not signed up.
 *
 * The same questions its own portal asks, because a woman reading the profile
 * cannot tell who typed it and the answer should not change what she gets. It
 * is one page rather than a wizard: the person filling this in is working from
 * a document with the answers already on it, and steps would only be places to
 * lose their place.
 *
 * Zones and markets are here too, which the organisation's own form does not
 * have. Zones are what an organisation says about itself; markets are HWS's
 * judgment about what it can be used for, and there is nowhere else to set
 * them.
 */
export function OrganisationForm({
  zones,
  markets,
}: {
  zones: AccessZone[];
  markets: Market[];
}) {
  const [state, formAction] = useActionState<FormState, FormData>(
    createOrganisation,
    null,
  );

  const [types, setTypes] = useState<string[]>([]);
  const [audiences, setAudiences] = useState<string[]>([]);
  const [serviceKinds, setServiceKinds] = useState<string[]>([]);
  const [accessRoutes, setAccessRoutes] = useState<string[]>([]);
  const [costOptions, setCostOptions] = useState<string[]>([]);
  const [coverage, setCoverage] = useState("");
  const [availability, setAvailability] = useState("");
  const [frequency, setFrequency] = useState("");
  const [primaryZone, setPrimaryZone] = useState("");
  const [alsoZones, setAlsoZones] = useState<string[]>([]);
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>([]);

  const zoneOptions = zones.map((z) => ({ slug: z.id, label: z.name }));
  const marketOptions = markets.map((m) => ({ slug: m.id, label: m.label }));

  return (
    <form action={formAction} className="flex flex-col gap-[18px]">
      <FormError message={state?.error} />

      <Section
        title="Who they are"
        blurb="What a woman sees first. Verified on save, because you typing them in is the check."
      >
        <Field label="Organisation name" name="name" required />

        <CheckboxGroup
          legend="What kind of organisation are they?"
          name="types"
          options={ORGANISATION_TYPES}
          selected={types}
          onChange={setTypes}
          columns
        />

        <div className="flex flex-col gap-[14px] sm:flex-row">
          <div className="flex-1">
            <PlaceField
              label="Where they are based"
              name="place"
              placeholder="e.g. Glasgow City"
            />
          </div>
          <div className="flex-1">
            <Field
              label="Website"
              name="website"
              inputMode="url"
              placeholder="example.org"
            />
          </div>
        </div>

        <TextAreaField
          label="In one sentence, what do they do?"
          name="blurb"
          rows={2}
          hint="Shown beside their name everywhere. Plain words."
        />
      </Section>

      <Section
        title="Classification"
        blurb="The zone is where they live. The markets are what a woman can actually reach through them, and they are yours to set. She is trusting your judgment, not their marketing."
      >
        <RadioGroup
          legend="Primary Access Zone"
          name="primaryZone"
          options={zoneOptions}
          value={primaryZone}
          onChange={(next) => {
            setPrimaryZone(next);
            setAlsoZones((current) => current.filter((id) => id !== next));
          }}
          columns
        />

        <CheckboxGroup
          legend="Also works in"
          hint="At most two."
          name="alsoZones"
          options={zoneOptions.filter((z) => z.slug !== primaryZone)}
          selected={alsoZones}
          onChange={(next) => setAlsoZones(next.slice(-2))}
          columns
        />

        <CheckboxGroup
          legend="Secondary markets"
          hint="Everything a woman could sensibly reach through them. This is what puts them in front of her when she describes a need."
          name="markets"
          options={marketOptions}
          selected={selectedMarkets}
          onChange={setSelectedMarkets}
          columns
        />
      </Section>

      <Section
        title="What they do"
        blurb="Everything below is optional and can be filled in later. The fuller it is, the better she is matched."
      >
        <TextAreaField
          label="What does this organisation exist to do?"
          name="mission"
          rows={4}
        />
        <TextAreaField
          label="What do they offer that others near them do not?"
          name="uniqueOffer"
          rows={2}
        />

        <CheckboxGroup
          legend="Who do they work with?"
          name="audiences"
          options={AUDIENCES}
          selected={audiences}
          onChange={setAudiences}
          columns
        />

        <CheckboxGroup
          legend="What kinds of support do they offer?"
          name="serviceKinds"
          options={SOLUTION_KINDS}
          selected={serviceKinds}
          onChange={setServiceKinds}
          columns
        />

        <CheckboxGroup
          legend="How do women reach them?"
          name="accessRoutes"
          options={FORMATS}
          selected={accessRoutes}
          onChange={setAccessRoutes}
          columns
        />

        <CheckboxGroup
          legend="What does it cost?"
          name="costOptions"
          options={COSTS}
          selected={costOptions}
          onChange={setCostOptions}
        />

        {costOptions.includes("there_is_a_cost") ? (
          <Field label="Roughly how much?" name="costNote" />
        ) : null}
      </Section>

      <Section
        title="Eligibility, coverage and rhythm"
        blurb="How far they reach, who they can take, and how often anything new is likely to appear."
      >
        <RadioGroup
          legend="How far does their offer reach?"
          name="coverage"
          options={COVERAGE}
          value={coverage}
          onChange={setCoverage}
        />

        {COVERAGE_NEEDS_DETAIL.includes(coverage) ? (
          <PlaceField
            label="Which areas, exactly?"
            name="coverageNote"
            placeholder="Start typing a town or council area"
            multiple
            hint="Add as many as they cover. Pick from the list where you can, so they match what women type."
          />
        ) : null}

        <TextAreaField label="Who can they help?" name="eligibility" rows={3} />
        <TextAreaField
          label="Who can they not help?"
          name="notEligible"
          rows={2}
          hint="The field that saves a woman an afternoon."
        />

        <RadioGroup
          legend="When is their offer available?"
          name="availability"
          options={AVAILABILITY}
          value={availability}
          onChange={setAvailability}
        />

        <RadioGroup
          legend="How often do they post?"
          name="postingFrequency"
          options={POSTING_FREQUENCY}
          value={frequency}
          onChange={setFrequency}
        />
      </Section>

      <div className="flex flex-wrap items-center gap-4">
        <SubmitButton>Create and verify</SubmitButton>
        <span className="text-[14px] text-ink-60">
          They go live on Discover straight away. Nobody has an account for
          them until you invite someone.
        </span>
      </div>
    </form>
  );
}

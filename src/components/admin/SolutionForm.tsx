"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Field, TextAreaField } from "@/components/ui/Field";
import { Chip, ChipGroup } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/Form";
import { SOLUTION_KINDS, COSTS, FORMATS } from "@/lib/design/taxonomy";
import { saveSolutionForOrganisation } from "@/app/listings/new/actions";
import type { FormState } from "@/app/actions";
import type { Situation, OrganisationOption } from "@/lib/data/solutions";

/** Around thirty words reads best on a phone. */
const IDEAL_WORDS = 30;

function countWords(text: string) {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

/**
 * Posting a solution on an organisation's behalf.
 *
 * The same eleven fields the organisation's own form collects, deliberately.
 * A woman reading a result cannot tell who typed it, and it should not change
 * what she gets. The only addition is the organisation itself, which their
 * copy of this form does not need to ask.
 *
 * Every hint explains a consequence for the woman rather than stating a rule.
 * It reads oddly in second person here — an admin is not the one being warned
 * — but it is the same warning, and two versions of this copy would drift.
 */
export function SolutionForm({
  situations,
  organisations,
}: {
  situations: Situation[];
  organisations: OrganisationOption[];
}) {
  const [state, formAction] = useActionState<FormState, FormData>(
    saveSolutionForOrganisation,
    null,
  );
  const [organisationId, setOrganisationId] = useState("");

  const [kind, setKind] = useState("");
  const [cost, setCost] = useState("");
  const [formats, setFormats] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [blurb, setBlurb] = useState("");

  const toggle = (list: string[], value: string) =>
    list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

  const words = countWords(blurb);

  return (
    <form action={formAction} className="flex flex-col gap-7">
      <FormError message={state?.error} />

      {/* Whose listing this is. First, because every hint below is about the
          women that organisation reaches, and answering it later means
          writing the whole thing without knowing who for. */}
      <div className="flex flex-col gap-[10px]">
        <label htmlFor="organisationId" className="text-[15px] font-semibold">
          Which organisation is this for?
          <span aria-hidden="true" className="text-gold-700"> *</span>
        </label>
        <select
          id="organisationId"
          name="organisationId"
          required
          value={organisationId}
          onChange={(event) => setOrganisationId(event.target.value)}
          className="min-h-[44px] rounded-control bg-surface p-4 text-[17px] text-ink shadow-hairline"
        >
          <option value="">Choose an organisation</option>
          {organisations.map((organisation) => (
            <option key={organisation.id} value={organisation.id}>
              {organisation.name}
              {organisation.status === "verified" ? "" : "  (not verified)"}
              {organisation.unclaimed ? "  (no account)" : ""}
            </option>
          ))}
        </select>
        <span className="text-[14px] leading-[1.5] text-ink-60">
          Not there?{" "}
          <Link href="/organisations/new" className="font-bold text-gold-700">
            Add the organisation first
          </Link>
          . A listing has to belong to somebody a woman can go to.
        </span>
      </div>
      {/* Chip selections are React state, so they travel as hidden inputs. */}
      {kind ? <input type="hidden" name="kind" value={kind} /> : null}
      {cost ? <input type="hidden" name="cost" value={cost} /> : null}
      {formats.map((f) => (
        <input key={f} type="hidden" name="formats" value={f} />
      ))}
      {tags.map((t) => (
        <input key={t} type="hidden" name="situations" value={t} />
      ))}

      <div className="flex flex-col gap-[22px]">
        <Field
          label="What is it called?"
          name="name"
          required
                    placeholder="e.g. Return to Work programme"
        />

        <div className="flex flex-col gap-[10px]">
          <span className="text-[15px] font-semibold">
            What kind of thing is it?
          </span>
          <ChipGroup label="What kind of thing is it?" multi={false}>
            {SOLUTION_KINDS.map((k) => (
              <Chip
                key={k.slug}
                label={k.label}
                selected={kind === k.slug}
                multi={false}
                onToggle={() => setKind(kind === k.slug ? "" : k.slug)}
              />
            ))}
          </ChipGroup>
        </div>

        <TextAreaField
          label="What does it do?"
          name="blurb"
          rows={3}
          value={blurb}
          onChange={(e) => setBlurb(e.target.value)}
          placeholder="e.g. A six-week group programme that helps women update their CV, practise interviews and meet local employers who are hiring."
          hint={`${words} ${words === 1 ? "word" : "words"}. Around ${IDEAL_WORDS} reads best on a phone.`}
        />

        <TextAreaField
          label="Who is it for?"
          name="whoFor"
          rows={2}
                    placeholder="e.g. Women aged 25 and over in West Lothian who have not worked in the last 12 months."
          hint="Be specific about eligibility. A woman who does not qualify but applies anyway loses her time and yours."
        />

        <TextAreaField
          label="What happens next for her?"
          name="whatToExpect"
          rows={2}
                    placeholder="e.g. A short form, then someone phones within a week. Or: drop in any Tuesday, no need to book."
          hint="Applying, turning up, or just reading it — say what actually happens. Not knowing is the most common reason women do not act on a listing."
        />

        <div className="flex flex-col gap-[10px]">
          <span className="text-[15px] font-semibold">Cost</span>
          <ChipGroup label="Cost" multi={false}>
            {COSTS.map((c) => (
              <Chip
                key={c.slug}
                label={c.label}
                selected={cost === c.slug}
                multi={false}
                onToggle={() => setCost(cost === c.slug ? "" : c.slug)}
              />
            ))}
          </ChipGroup>
        </div>

        <div className="flex flex-col gap-[10px]">
          <span className="text-[15px] font-semibold">
            How does she take part?
          </span>
          <ChipGroup label="How does she take part?">
            {FORMATS.map((f) => (
              <Chip
                key={f.slug}
                label={f.label}
                selected={formats.includes(f.slug)}
                onToggle={() => setFormats(toggle(formats, f.slug))}
              />
            ))}
          </ChipGroup>
        </div>

        <div className="flex flex-wrap gap-[14px]">
          <div className="min-w-[200px] flex-1">
            <Field
              label="Where"
              name="place"
                            placeholder="e.g. Bathgate, or Scotland-wide"
            />
          </div>
          <div className="min-w-[200px] flex-1">
            <Field
              label="Closing date"
              name="deadline"
              type="date"
                          />
          </div>
        </div>
        <span className="text-[14px] leading-[1.5] text-ink-60">
          Leave the date blank if it runs all year. We remind women seven days
          before a closing date, and we will ask you to confirm the listing when
          it passes.
        </span>

        <Field
          label="Where should she go to apply?"
          name="applyUrl"
                    placeholder="Link to your application page, or a phone number"
        />

        <div className="flex flex-col gap-[10px]">
          <span className="text-[15px] font-semibold">
            Which situations does this suit?
          </span>
          <span className="text-[14px] leading-[1.5] text-ink-60">
            We match on these. Pick only the ones that genuinely apply, or your
            listing shows up in searches it does not fit.
          </span>
          <ChipGroup label="Which situations does this suit?">
            {situations.map((s) => (
              <Chip
                key={s.id}
                label={s.label}
                selected={tags.includes(s.id)}
                onToggle={() => setTags(toggle(tags, s.id))}
              />
            ))}
          </ChipGroup>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-hairline pt-6">
        <Button
          type="submit"
          name="intent"
          value="publish"
          size="inline"
          className="px-7 py-4 text-[17px]"
        >
          Publish it
        </Button>
        <Button
          type="submit"
          name="intent"
          value="draft"
          variant="secondary"
          size="inline"
          className="px-[22px] py-[15px] text-[16px]"
        >
          Save as a draft
        </Button>
        <span className="text-[14px] leading-[1.5] text-ink-60">
          A draft is invisible to women until somebody publishes it.
        </span>
      </div>
    </form>
  );
}

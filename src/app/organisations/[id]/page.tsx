import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Page } from "@/components/ui/Page";
import { VerificationForm } from "@/components/admin/VerificationForm";
import { requireAdmin } from "@/lib/data/admin";
import { getOrganisation, registerLinks } from "@/lib/data/organisations";
import {
  AUDIENCES,
  AVAILABILITY,
  COSTS,
  COVERAGE,
  FORMATS,
  ORGANISATION_TYPES,
  POSTING_FREQUENCY,
  SOLUTION_KINDS,
  labelFor,
  labelsFor,
} from "@/lib/design/taxonomy";

const DATE = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

function Fact({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex flex-col gap-1 border-t border-hairline-soft pt-4">
      <span className="eyebrow text-ink-60">
        {label}
      </span>
      <span className={`text-[17px] leading-[1.5] ${value ? "" : "text-ink-60 italic"}`}>
        {value || "Not given"}
      </span>
    </div>
  );
}

export const metadata: Metadata = { title: "Verify organisation" };

/**
 * Verifying one organisation.
 *
 * The evidence they gave, and a way to check it. Everything here except the
 * name, place and description is invisible to women: the contact number was
 * collected with an explicit promise that it is "only used by us, and never
 * shown to women using the platform", which is why this deployment is the
 * only place it appears.
 */
export default async function VerifyOrganisationPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  await requireAdmin();

  const { id } = await params;
  const { error } = await searchParams;
  const organisation = await getOrganisation(id);

  if (!organisation) notFound();

  const links = registerLinks(organisation.registrationNumber);

  return (
    <Page width={720} top={56} gap={26}>
      <Link
        href="/organisations"
        className="inline-flex min-h-[44px] items-center gap-[6px] self-start text-[14px] font-bold text-ink no-underline"
      >
        <ArrowLeft size={16} strokeWidth={2} aria-hidden="true" />
        Verify organisations
      </Link>

      <div className="flex flex-col gap-[10px]">
        <h1 className="m-0 font-display text-[30px] font-normal leading-[1.1] tracking-[-0.01em] sm:text-[38px]">
          {organisation.name}
        </h1>
        <p className="m-0 text-[17px] text-ink-65">
          {[
            organisation.types
              .map((slug) => labelFor(ORGANISATION_TYPES, slug))
              .filter(Boolean)
              .join(", "),
            organisation.place,
            organisation.zoneNames[0],
          ]
            .filter(Boolean)
            .join(" · ")}
        </p>
        {organisation.status === "verified" && organisation.verifiedAt ? (
          <p className="m-0 text-[15px] font-semibold text-green-700">
            Verified {DATE.format(new Date(organisation.verifiedAt))}
          </p>
        ) : null}
      </div>

      {organisation.reviewNote ? (
        <div className="rounded-card border border-gold-300 bg-gold-200 px-[22px] py-5">
          <span className="eyebrow text-gold-700">
            Last thing we said to them
          </span>
          <p className="m-0 pt-2 text-[16px] leading-[1.6] text-gold-700">
            {organisation.reviewNote}
          </p>
        </div>
      ) : null}

      {/* The one thing a reviewer actually has to do, made one click. */}
      <section className="flex flex-col gap-3">
        <h2 className="m-0 eyebrow text-ink-60">
          Registration
        </h2>
        <p className="m-0 text-[22px] font-bold tabular-nums">
          {organisation.registrationNumber || "None given"}
        </p>
        {links ? (
          <div className="flex flex-wrap gap-3">
            <a
              href={links.charity}
              rel="noopener noreferrer"
              target="_blank"
              className="inline-flex min-h-[44px] items-center gap-2 rounded-control shadow-hairline bg-surface px-5 py-3 text-[16px] font-bold text-ink no-underline transition-[color,background-color,box-shadow] duration-150 ease-out hover:shadow-hairline-gold"
            >
              Check on OSCR
              <ExternalLink size={16} strokeWidth={2} aria-hidden="true" />
            </a>
            <a
              href={links.company}
              rel="noopener noreferrer"
              target="_blank"
              className="inline-flex min-h-[44px] items-center gap-2 rounded-control shadow-hairline bg-surface px-5 py-3 text-[16px] font-bold text-ink no-underline transition-[color,background-color,box-shadow] duration-150 ease-out hover:shadow-hairline-gold"
            >
              Check on Companies House
              <ExternalLink size={16} strokeWidth={2} aria-hidden="true" />
            </a>
          </div>
        ) : (
          <p className="m-0 max-w-[62ch] text-[16px] leading-[1.6] text-ink-70">
            They gave no registration number, which is expected for an
            unincorporated group. Their funder is the check instead.
          </p>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="m-0 eyebrow text-ink-60">
          What they told us
        </h2>
        <Fact label="Who funds them" value={organisation.funderNote} />
        <Fact label="Contact" value={organisation.contactName} />
        <Fact label="Their role" value={organisation.contactRole} />
        <Fact label="Contact number" value={organisation.contactPhone} />
        <Fact label="Website" value={organisation.website} />
        <Fact label="What they do" value={organisation.blurb} />
      </section>

      {/* The profile. Not evidence in the registry sense, but it is the only
          account of who they intend to serve and how far they reach, and a
          thin one is itself worth knowing before verifying. */}
      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="m-0 eyebrow text-ink-60">Their profile</h2>
          <span className="text-[14px] text-ink-60">
            {organisation.profileUpdatedAt
              ? "Last updated " + DATE.format(new Date(organisation.profileUpdatedAt))
              : "Never filled in"}
          </span>
        </div>

        {organisation.logoUrl ? (
          <div className="flex items-center gap-4 border-t border-hairline-soft pt-4">
            <span className="eyebrow text-ink-60">Logo</span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={organisation.logoUrl}
              alt=""
              className="size-[48px] rounded-control object-contain"
            />
            <span className="text-[15px] text-ink-60">
              {organisation.logoSource === "uploaded"
                ? "Uploaded by them"
                : "Taken from their website"}
            </span>
          </div>
        ) : null}

        <Fact label="Mission" value={organisation.mission} />
        <Fact label="What they offer that others do not" value={organisation.uniqueOffer} />
        <Fact
          label="Who they work with"
          value={
            [
              labelsFor(AUDIENCES, organisation.audiences).join(", "),
              organisation.audiencesOther,
            ]
              .filter(Boolean)
              .join(" · ") || null
          }
        />
        <Fact
          label="What they provide"
          value={labelsFor(SOLUTION_KINDS, organisation.serviceKinds).join(", ") || null}
        />
        <Fact
          label="How women reach them"
          value={labelsFor(FORMATS, organisation.accessRoutes).join(", ") || null}
        />
        <Fact
          label="Cost"
          value={
            [
              labelsFor(COSTS, organisation.costOptions).join(", "),
              organisation.costNote,
            ]
              .filter(Boolean)
              .join(" · ") || null
          }
        />
        <Fact
          label="How far they reach"
          value={
            [labelFor(COVERAGE, organisation.coverage), organisation.coverageNote]
              .filter(Boolean)
              .join(" · ") || null
          }
        />
        <Fact label="Who they can help" value={organisation.eligibility} />
        <Fact label="Who they cannot help" value={organisation.notEligible} />
        <Fact
          label="When they run"
          value={
            [
              labelFor(AVAILABILITY, organisation.availability),
              organisation.availabilityNote,
            ]
              .filter(Boolean)
              .join(" · ") || null
          }
        />
        <Fact
          label="How often they expect to post"
          value={labelFor(POSTING_FREQUENCY, organisation.postingFrequency) || null}
        />
      </section>

      <VerificationForm
        organisationId={organisation.id}
        status={organisation.status}
        listingCount={organisation.listingCount}
        noteError={error === "note"}
        otherError={error && error !== "note" ? error : null}
      />
    </Page>
  );
}

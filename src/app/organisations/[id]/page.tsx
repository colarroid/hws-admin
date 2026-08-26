import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Page } from "@/components/ui/Page";
import { VerificationForm } from "@/components/admin/VerificationForm";
import { requireAdmin } from "@/lib/data/admin";
import { getOrganisation, registerLinks } from "@/lib/data/organisations";
import { ORGANISATION_TYPES, labelFor } from "@/lib/design/taxonomy";

const DATE = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

function Fact({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex flex-col gap-1 border-t border-hairline-soft pt-4">
      <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink-60">
        {label}
      </span>
      <span className={`text-[17px] leading-[1.5] ${value ? "" : "text-ink-60 italic"}`}>
        {value || "Not given"}
      </span>
    </div>
  );
}

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
        <h1 className="m-0 font-display text-[30px] font-medium leading-[1.1] tracking-[-0.01em] sm:text-[38px]">
          {organisation.name}
        </h1>
        <p className="m-0 text-[17px] text-ink-65">
          {[
            labelFor(ORGANISATION_TYPES, organisation.type),
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
          <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-gold-700">
            Last thing we said to them
          </span>
          <p className="m-0 pt-2 text-[16px] leading-[1.6] text-gold-700">
            {organisation.reviewNote}
          </p>
        </div>
      ) : null}

      {/* The one thing a reviewer actually has to do, made one click. */}
      <section className="flex flex-col gap-3">
        <h2 className="m-0 text-[11px] font-bold uppercase tracking-[0.14em] text-ink-60">
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
              className="inline-flex min-h-[44px] items-center gap-2 rounded-control border border-ring bg-surface px-5 py-3 text-[16px] font-bold text-ink no-underline hover:border-gold-500"
            >
              Check on OSCR
              <ExternalLink size={16} strokeWidth={2} aria-hidden="true" />
            </a>
            <a
              href={links.company}
              rel="noopener noreferrer"
              target="_blank"
              className="inline-flex min-h-[44px] items-center gap-2 rounded-control border border-ring bg-surface px-5 py-3 text-[16px] font-bold text-ink no-underline hover:border-gold-500"
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
        <h2 className="m-0 text-[11px] font-bold uppercase tracking-[0.14em] text-ink-60">
          What they told us
        </h2>
        <Fact label="Who funds them" value={organisation.funderNote} />
        <Fact label="Contact" value={organisation.contactName} />
        <Fact label="Their role" value={organisation.contactRole} />
        <Fact label="Contact number" value={organisation.contactPhone} />
        <Fact label="Website" value={organisation.website} />
        <Fact label="What they do" value={organisation.blurb} />
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

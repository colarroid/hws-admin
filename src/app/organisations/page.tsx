import Link from "next/link";
import { Page } from "@/components/ui/Page";
import { requireAdmin } from "@/lib/data/admin";
import { getOrganisationsToVerify } from "@/lib/data/organisations";

const LABELS: Record<string, string> = {
  pending: "Waiting",
  more_evidence: "Waiting on them",
};

/**
 * Organisations to verify.
 *
 * Nothing an unverified organisation writes can go live, so this queue sits
 * upstream of the listing queue: a backlog here becomes a backlog there.
 */
export default async function OrganisationsPage({
  searchParams,
}: {
  searchParams: Promise<{ notified?: string }>;
}) {
  await requireAdmin();
  const { notified } = await searchParams;
  const organisations = await getOrganisationsToVerify();

  return (
    <Page width={820} top={56} gap={26}>
      <div className="flex flex-col gap-[10px]">
        <h1 className="m-0 font-display text-[32px] font-medium leading-[1.1] tracking-[-0.01em] sm:text-[42px]">
          Verify organisations
        </h1>
        <p className="m-0 max-w-[62ch] text-[17px] leading-[1.55] text-ink-70">
          {organisations.length === 0
            ? "Nobody waiting. Organisations appear here when they finish onboarding."
            : "Checked once, against a public register. Nothing they write can go live until this is done."}
        </p>
      </div>

      {notified === "failed" ? (
        <div className="rounded-card border border-red-200 bg-red-50 px-[22px] py-5 text-[16px] leading-[1.5] text-red-700">
          <strong>The decision saved, but we could not email them.</strong> They
          will not know until they open their dashboard.
        </div>
      ) : null}

      <div className="flex flex-col gap-[14px]">
        {organisations.map((organisation) => (
          <Link
            key={organisation.id}
            href={`/organisations/${organisation.id}`}
            className="flex flex-wrap items-center justify-between gap-4 rounded-card border border-ring bg-surface p-6 no-underline transition-colors duration-150 ease-out hover:border-gold-500"
          >
            <div className="flex flex-col gap-1">
              <span className="text-[20px] font-bold leading-[1.3] text-ink">
                {organisation.name}
              </span>
              <span className="text-[15px] text-ink-65">
                {[organisation.place, `${organisation.listingCount} listing${organisation.listingCount === 1 ? "" : "s"} waiting on this`]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span
                className={`rounded-pill-sm px-[11px] py-[7px] text-[13px] font-bold ${
                  organisation.waitedDays >= 2 && organisation.status === "pending"
                    ? "bg-red-50 text-red-700"
                    : "bg-gold-200 text-gold-700"
                }`}
              >
                {LABELS[organisation.status] ?? organisation.status}
              </span>
              <span className="text-[14px] text-ink-60">
                {organisation.waitedDays === 0
                  ? "Today"
                  : `${organisation.waitedDays} ${organisation.waitedDays === 1 ? "day" : "days"}`}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </Page>
  );
}

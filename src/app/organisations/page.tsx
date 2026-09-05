import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Page } from "@/components/ui/Page";
import { requireAdmin } from "@/lib/data/admin";
import { getOrganisationsToVerify } from "@/lib/data/organisations";

const LABELS: Record<string, string> = {
  pending: "Waiting",
  more_evidence: "Waiting on them",
  verified: "Verified",
  rejected: "Declined",
};

const TABS = ["Waiting", "Verified", "Declined", "All"] as const;
type Tab = (typeof TABS)[number];

type Row = { status: string; requestedAt: string | null };

/**
 * Waiting means they asked, which is the end of onboarding rather than the
 * end of the profile: checking starts while they are still writing it. An
 * organisation that broke off partway through onboarding never asked, so it
 * is not a decision anybody can make and appears only under All.
 */
const TAB_MATCHES: Record<Tab, (o: Row) => boolean> = {
  Waiting: (o) =>
    Boolean(o.requestedAt) &&
    (o.status === "pending" || o.status === "more_evidence"),
  Verified: (o) => o.status === "verified",
  Declined: (o) => o.status === "rejected",
  All: () => true,
};

const TAB_PILL =
  "inline-flex min-h-[44px] items-center rounded-full px-[18px] py-[10px] text-[15px] no-underline";

export const metadata: Metadata = { title: "Verify organisations" };

/**
 * Organisations to verify.
 *
 * Nothing an unverified organisation writes can go live, so this queue sits
 * upstream of the listing queue: a backlog here becomes a backlog there.
 */
export default async function OrganisationsPage({
  searchParams,
}: {
  searchParams: Promise<{ notified?: string; tab?: string; why?: string }>;
}) {
  await requireAdmin();
  const { notified, tab: rawTab, why } = await searchParams;
  const all = await getOrganisationsToVerify();

  // Waiting first, because that is the work. The other tabs are for looking
  // something up, which is why they exist at all.
  const tab: Tab = TABS.includes(rawTab as Tab) ? (rawTab as Tab) : "Waiting";
  const organisations = all.filter((o) => TAB_MATCHES[tab](o));
  const waiting = all.filter((o) => TAB_MATCHES.Waiting(o)).length;

  return (
    <Page width={820} top={56} gap={26}>
      <div className="flex flex-col gap-[10px]">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h1 className="m-0 font-display text-[32px] font-normal leading-[1.1] tracking-[-0.01em] sm:text-[42px]">
            Organisations
          </h1>
          <Link
            href="/organisations/new"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-ink px-6 py-[13px] text-[16px] font-bold text-white no-underline"
          >
            <Plus size={17} strokeWidth={2} aria-hidden="true" />
            Add an organisation
          </Link>
        </div>
        <p className="m-0 max-w-[62ch] text-[17px] leading-[1.55] text-ink-70">
          {waiting === 0
            ? "Nobody waiting. Organisations appear here when they finish onboarding."
            : "Checked once, against a public register. An organisation that is not verified cannot post a listing or invite anyone."}
        </p>
      </div>

      {notified === "failed" ? (
        <div
          role="alert"
          className="flex flex-col gap-1 rounded-card border border-red-200 bg-red-50 px-[22px] py-5 text-[16px] leading-[1.5] text-red-700"
        >
          <strong>The decision saved, but we could not email them.</strong>
          {/* The reason, not just the fact. An organisation waiting on an
              instruction nobody sent is the worst outcome this screen has,
              and it used to be indistinguishable from a delivered one. */}
          <span>
            {why
              ? `${why.charAt(0).toUpperCase()}${why.slice(1)}.`
              : "No reason came back."}{" "}
            They will not know until they open their dashboard, so tell them
            another way if it matters.
          </span>
        </div>
      ) : null}

      {/* Waiting is the work, so it is the default. The other tabs exist for
          looking something up after the fact, which the old queue could not
          do at all: it only ever returned the two unfinished states. */}
      <nav aria-label="Filter by status" className="flex flex-wrap gap-[10px]">
        {TABS.map((label) => {
          const active = label === tab;
          const count = all.filter((o) => TAB_MATCHES[label](o)).length;
          return (
            <Link
              key={label}
              href={
                label === "Waiting"
                  ? "/organisations"
                  : `/organisations?tab=${encodeURIComponent(label)}`
              }
              aria-current={active ? "page" : undefined}
              className={[
                TAB_PILL,
                active
                  ? "bg-ink font-semibold text-white"
                  : "shadow-hairline bg-surface font-semibold text-ink transition-[color,background-color,box-shadow] duration-150 ease-out hover:shadow-hairline-gold",
              ].join(" ")}
            >
              {label}
              <span className="pl-2 tabular-nums opacity-70">{count}</span>
            </Link>
          );
        })}
      </nav>

      <div className="flex flex-col gap-[14px]">
        {organisations.length === 0 ? (
          <p className="m-0 rounded-card shadow-hairline bg-surface p-6 text-[16px] leading-[1.6] text-ink-70">
            Nothing under {tab.toLowerCase()}.
          </p>
        ) : null}
        {organisations.map((organisation) => (
          <Link
            key={organisation.id}
            href={`/organisations/${organisation.id}`}
            /* Stacked below sm, side by side above it. Same reason as the
               listings queue: as one wrapping row, "Not finished signing up"
               beside a long organisation name dropped to its own line and
               went left-aligned, so the column of statuses only lined up for
               the rows that happened to be short. */
            className="flex flex-col gap-3 rounded-card shadow-hairline bg-surface p-6 no-underline transition-[color,background-color,box-shadow] duration-150 ease-out hover:shadow-hairline-gold sm:flex-row sm:items-start sm:justify-between sm:gap-4"
          >
            <div className="flex min-w-0 flex-col gap-1">
              <span className="font-display text-[20px] font-normal leading-[1.3] text-ink">
                {organisation.name}
              </span>
              <span className="text-[15px] text-ink-65">
                {[
                  organisation.place,
                  organisation.listingCount +
                    (organisation.listingCount === 1 ? " listing" : " listings"),
                  // Their profile is the account of who they serve and how
                  // far they reach. Deciding without it is deciding on a name
                  // and a registration number.
                  organisation.profileGaps === 0
                    ? "profile complete"
                    : organisation.profileGaps + " profile answers missing",
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 sm:flex-col sm:items-end">
              <span
                className={`whitespace-nowrap rounded-pill-sm px-[11px] py-[7px] text-[13px] font-bold ${
                  !organisation.requestedAt
                    ? "bg-closed text-ink-65"
                    : organisation.waitedDays >= 2 &&
                        organisation.status === "pending"
                      ? "bg-red-50 text-red-700"
                      : "bg-gold-200 text-gold-700"
                }`}
              >
                {organisation.requestedAt
                  ? (LABELS[organisation.status] ?? organisation.status)
                  : "Not finished signing up"}
              </span>
              <span className="whitespace-nowrap text-[14px] text-ink-60">
                {!organisation.requestedAt
                  ? ""
                  : organisation.waitedDays === 0
                    ? "Today"
                    : organisation.waitedDays +
                      (organisation.waitedDays === 1 ? " day" : " days")}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </Page>
  );
}

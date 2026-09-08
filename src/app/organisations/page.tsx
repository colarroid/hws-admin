import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { Page } from "@/components/ui/Page";
import { Button } from "@/components/ui/Button";
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
  searchParams: Promise<{
    notified?: string;
    tab?: string;
    why?: string;
    q?: string;
  }>;
}) {
  await requireAdmin();
  const { notified, tab: rawTab, why, q: rawQ } = await searchParams;
  const q = (rawQ ?? "").trim();
  const everything = await getOrganisationsToVerify();

  /*
   * Searched before the tabs are counted, not after.
   *
   * The counts on the tabs then describe the search rather than the whole
   * table, so "Verified 3" while looking for Glasgow means three verified
   * organisations in Glasgow. Counting the other way round shows a tab
   * reading 29 that opens onto two rows, which is the sort of thing that
   * makes somebody think the search is broken.
   *
   * Filtered here rather than in the query because this screen already loads
   * every organisation: the tabs need the whole set to count it, and at the
   * scale this will reach that is the cheaper of the two. If it ever stops
   * being, the listings queue next door has the paged version to copy.
   */
  const term = q.toLowerCase();
  const all = term
    ? everything.filter((o) =>
        [o.name, o.place].some((field) =>
          (field ?? "").toLowerCase().includes(term),
        ),
      )
    : everything;

  /*
   * Waiting first when there is anything waiting, and Verified when there is
   * not.
   *
   * Waiting is the work, so it opens on the work. But an empty queue is the
   * normal state most days, and landing on a blank screen reads as a tool
   * with nothing in it rather than a job already done. Verified is what
   * somebody wants next: the list they came to look something up in.
   *
   * Decided from the whole set rather than the search. Which tab opens is a
   * fact about the queue, and flipping somebody to Verified because their
   * search happened to match nobody waiting would be the search moving them
   * without being asked.
   */
  const waitingOverall = everything.filter((o) => TAB_MATCHES.Waiting(o)).length;
  const defaultTab: Tab = waitingOverall > 0 ? "Waiting" : "Verified";

  const tab: Tab = TABS.includes(rawTab as Tab) ? (rawTab as Tab) : defaultTab;
  const organisations = all.filter((o) => TAB_MATCHES[tab](o));

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
          {waitingOverall === 0 && !q
            ? "Nobody waiting, so this opens on everyone verified. Organisations appear under Waiting when they finish onboarding."
            : "Checked once, against a public register. An organisation that is not verified cannot post a listing or invite anyone."}
        </p>
      </div>

      {/* A plain GET form, so a search is a URL: shareable, bookmarkable, and
          still there after a back button. The tab rides along in a hidden
          field, so searching does not silently move somebody from Verified
          back to Waiting. */}
      <form
        role="search"
        action="/organisations"
        className="flex flex-wrap items-center gap-[10px]"
      >
        <input type="hidden" name="tab" value={tab} />
        <label htmlFor="q" className="sr-only">
          Search organisations by name or place
        </label>
        <div className="relative min-w-[240px] flex-1">
          <Search
            size={18}
            strokeWidth={2}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-60"
            aria-hidden="true"
          />
          <input
            id="q"
            name="q"
            type="search"
            defaultValue={q}
            placeholder="Organisation name or place"
            className="w-full rounded-control bg-surface py-[14px] pl-[46px] pr-4 text-[17px] text-ink shadow-hairline"
          />
        </div>
        <Button type="submit" variant="secondary" size="inline">
          Search
        </Button>
        {q ? (
          <Link
            href={`/organisations?tab=${encodeURIComponent(tab)}`}
            className="inline-flex min-h-[44px] items-center px-2 text-[15px] font-bold text-ink"
          >
            Clear
          </Link>
        ) : null}
      </form>

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

      {/* Waiting opens first when there is work in it, Verified when there
          is not. The other tabs exist for looking something up after the
          fact, which the old queue could not do at all: it only ever
          returned the two unfinished states. */}
      <nav aria-label="Filter by status" className="flex flex-wrap gap-[10px]">
        {TABS.map((label) => {
          const active = label === tab;
          const count = all.filter((o) => TAB_MATCHES[label](o)).length;
          return (
            <Link
              key={label}
              /* The tab is always named, never left implicit. It used to be
                 omitted for Waiting on the grounds that Waiting was the
                 default, and the default now depends on whether anything is
                 waiting: a bare link would mean different tabs on different
                 days.

                 The search rides along too, so moving between tabs keeps
                 what was typed. Losing it on every press turns one search
                 into four. */
              href={`/organisations?${new URLSearchParams(
                Object.entries({
                  tab: label,
                  ...(q ? { q } : {}),
                }) as [string, string][],
              )}`}
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
            {q
              ? `Nothing under ${tab.toLowerCase()} matches “${q}”.`
              : `Nothing under ${tab.toLowerCase()}.`}
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

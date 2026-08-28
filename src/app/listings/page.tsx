import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { Page } from "@/components/ui/Page";
import { Button } from "@/components/ui/Button";
import { requireAdmin } from "@/lib/data/admin";
import { getQueue, PER_PAGE } from "@/lib/data/moderation";

const DATE = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  hour: "2-digit",
  minute: "2-digit",
});

export const metadata: Metadata = { title: "Published listings" };

/** Keeps the search term while paging, so page 2 is page 2 of the search. */
function pageHref(q: string, page: number) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/listings?${query}` : "/listings";
}

/**
 * Everything organisations have published.
 *
 * This was a queue of listings waiting for approval. Trust moved to the
 * organisation: verification is now the gate, an unverified organisation
 * cannot post at all, and a verified one publishes directly. So this screen
 * moderates rather than approves, and anything already hidden sorts to the
 * top because it is the only state somebody chose.
 */
export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  await requireAdmin();

  const { q: rawQ, page: rawPage } = await searchParams;
  const q = (rawQ ?? "").trim();
  const { items, total, page, pageCount } = await getQueue({
    q,
    page: Number(rawPage) || 1,
  });

  const first = (page - 1) * PER_PAGE + 1;
  const last = first + items.length - 1;

  return (
    <Page width={820} top={56} gap={26}>
      <div className="flex flex-col gap-[10px]">
        <h1 className="m-0 font-display text-[32px] font-normal leading-[1.1] tracking-[-0.01em] sm:text-[42px]">
          Published listings
        </h1>
        <p className="m-0 max-w-[64ch] text-[17px] leading-[1.55] text-ink-70">
          Verified organisations publish without waiting. Moderation happens
          here, after the fact: open one to flag it, and it stops reaching women
          until it is sorted.
        </p>
      </div>

      {/* A plain GET form, so a search is a URL: shareable, bookmarkable, and
          still there after a back button. */}
      <form
        role="search"
        action="/listings"
        className="flex flex-wrap items-center gap-[10px]"
      >
        <label htmlFor="q" className="sr-only">
          Search listings
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
            placeholder="Listing name or organisation"
            className="w-full rounded-control bg-surface py-[14px] pl-[46px] pr-4 text-[17px] text-ink shadow-hairline"
          />
        </div>
        <Button type="submit" variant="secondary" size="inline">
          Search
        </Button>
        {q ? (
          <Link
            href="/listings"
            className="inline-flex min-h-[44px] items-center px-2 text-[15px] font-bold text-ink"
          >
            Clear
          </Link>
        ) : null}
      </form>

      <p className="m-0 text-[15px] text-ink-65">
        {total === 0
          ? q
            ? `Nothing matches “${q}”.`
            : "Nothing posted yet. Listings appear here as verified organisations publish them."
          : total <= PER_PAGE
            ? `${total} ${total === 1 ? "listing" : "listings"}${q ? ` matching “${q}”` : ""}`
            : `${first}–${last} of ${total}${q ? ` matching “${q}”` : ""}`}
      </p>

      <div className="flex flex-col gap-[14px]">
        {items.map((item) => {
          // Hidden is a decision somebody made, so it outranks the listing's
          // own state: a hidden listing is still `live` in the database, and a
          // green "Live" pill on something no woman can reach reads as a bug.
          const state = item.hiddenAt
            ? { className: "bg-red-50 text-red-700", label: "Flagged · hidden" }
            : item.status === "closed"
              ? { className: "bg-closed text-ink-65", label: "Closed" }
              : item.status === "live"
                ? { className: "bg-sage-200 text-green-700", label: "Live" }
                : { className: "bg-gold-200 text-gold-700", label: "In review" };

          return (
            <Link
              key={item.id}
              href={`/listings/${item.id}`}
              className="flex flex-wrap items-center justify-between gap-4 rounded-card shadow-hairline bg-surface p-6 no-underline transition-[color,background-color,box-shadow] duration-150 ease-out hover:shadow-hairline-gold"
            >
              <div className="flex flex-col gap-1">
                <span className="font-display text-[20px] font-normal leading-[1.3] text-ink">
                  {item.name}
                </span>
                <span className="text-[15px] text-ink-65">
                  {item.organisationName}
                </span>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span
                  className={`rounded-pill-sm px-[11px] py-[7px] text-[13px] font-bold ${state.className}`}
                >
                  {state.label}
                </span>
                <span className="text-[14px] text-ink-60">
                  {item.submittedAt ? DATE.format(new Date(item.submittedAt)) : ""}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {pageCount > 1 ? (
        <nav
          aria-label="Pages"
          className="flex flex-wrap items-center justify-between gap-4 border-t border-hairline-soft pt-5"
        >
          {/* Rendered as spans rather than disabled links at the ends: there is
              nothing to go to, and a link that goes nowhere is worse than none. */}
          {page > 1 ? (
            <Link
              href={pageHref(q, page - 1)}
              rel="prev"
              className="inline-flex min-h-[44px] items-center text-[15px] font-bold text-ink"
            >
              ← Newer
            </Link>
          ) : (
            <span className="text-[15px] text-ink-60">← Newer</span>
          )}

          <span className="text-[15px] text-ink-65">
            Page {page} of {pageCount}
          </span>

          {page < pageCount ? (
            <Link
              href={pageHref(q, page + 1)}
              rel="next"
              className="inline-flex min-h-[44px] items-center text-[15px] font-bold text-ink"
            >
              Older →
            </Link>
          ) : (
            <span className="text-[15px] text-ink-60">Older →</span>
          )}
        </nav>
      ) : null}
    </Page>
  );
}

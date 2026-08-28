import type { Metadata } from "next";
import Link from "next/link";
import { Page } from "@/components/ui/Page";
import { requireAdmin } from "@/lib/data/admin";
import { getQueue } from "@/lib/data/queue";

const DATE = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  hour: "2-digit",
  minute: "2-digit",
});

export const metadata: Metadata = { title: "Published listings" };

/**
 * Everything organisations have published.
 *
 * This was a queue of listings waiting for approval. Trust moved to the
 * organisation: verification is now the gate, an unverified organisation
 * cannot post at all, and a verified one publishes directly. So this screen
 * moderates rather than approves, and anything already hidden sorts to the
 * top because it is the only state somebody chose.
 */
export default async function QueuePage() {
  await requireAdmin();
  const queue = await getQueue();

  return (
    <Page width={820} top={56} gap={26}>
      <div className="flex flex-col gap-[10px]">
        <h1 className="m-0 font-display text-[32px] font-normal leading-[1.1] tracking-[-0.01em] sm:text-[42px]">
          Published listings
        </h1>
        <p className="m-0 text-[17px] leading-[1.55] text-ink-70">
          {queue.length === 0
            ? "Nothing posted yet. Listings appear here as verified organisations publish them."
            : "Verified organisations publish without waiting. Moderation happens here, after the fact: open one to hide it from women, with a reason they can see."}
        </p>
      </div>

      <div className="flex flex-col gap-[14px]">
        {queue.map((item) => {
          // Hidden is a decision somebody made, so it outranks the listing's
          // own state: a hidden listing is still `live` in the database, and a
          // green "Live" pill on something no woman can reach reads as a bug.
          const state = item.hiddenAt
            ? { className: "bg-red-50 text-red-700", label: "Hidden from women" }
            : item.status === "closed"
              ? { className: "bg-closed text-ink-65", label: "Closed" }
              : item.status === "live"
                ? { className: "bg-sage-200 text-green-700", label: "Live" }
                : { className: "bg-gold-200 text-gold-700", label: "In review" };

          return (
            <Link
              key={item.id}
              href={`/queue/${item.id}`}
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
    </Page>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, TriangleAlert } from "lucide-react";
import { Page } from "@/components/ui/Page";
import { ResultCard, type ResultCardData } from "@/components/ResultCard";
import { ModerationForm } from "@/components/admin/ModerationForm";
import { requireAdmin } from "@/lib/data/admin";
import { getReviewListing } from "@/lib/data/moderation";
import { COSTS, FORMATS, SOLUTION_KINDS, labelFor } from "@/lib/design/taxonomy";

const DATE = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long" });

export const metadata: Metadata = { title: "Listing" };

/**
 * One published listing, and the one decision left on it.
 *
 * Nothing is approved here. A verified organisation publishes directly, so
 * this page exists to answer a single question: is this still worth a woman's
 * time? The card at the top is the real woman-facing component rather than a
 * form full of fields, so that question is asked of what she actually reads.
 */
export default async function ReviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notified?: string }>;
}) {
  await requireAdmin();

  const { id } = await params;
  const { notified } = await searchParams;
  const listing = await getReviewListing(id);

  if (!listing) notFound();

  const card: ResultCardData = {
    name: listing.name,
    source: [listing.organisationName, listing.place].filter(Boolean).join(" · "),
    blurb: listing.blurb ?? "",
    tags: [
      labelFor(SOLUTION_KINDS, listing.kind),
      labelFor(COSTS, listing.cost),
      ...listing.formats.map((f) => labelFor(FORMATS, f)),
    ].filter(Boolean),
    deadline: listing.deadline
      ? `Closes ${DATE.format(new Date(listing.deadline))}`
      : null,
    whoFor: listing.who_for ?? "",
    whatToExpect: listing.what_to_expect ?? "",
    why: "written from her answers when this appears in her results.",
    verified: "Verified · last checked today",
  };

  const unverified = listing.organisationStatus !== "verified";

  return (
    <Page width={820} top={56} gap={26}>
      <Link
        href="/listings"
        className="inline-flex min-h-[44px] items-center gap-[6px] self-start text-[14px] font-bold text-ink no-underline"
      >
        <ArrowLeft size={16} strokeWidth={2} aria-hidden="true" />
        Published listings
      </Link>

      {/* An unverified organisation cannot create a listing, so this only
          appears where verification was withdrawn after the fact. Worth
          saying, because the card below still carries a verified stamp. */}
      {unverified ? (
        <div className="flex flex-wrap items-center gap-3 rounded-card border border-red-200 bg-red-50 px-[22px] py-5">
          <TriangleAlert size={20} strokeWidth={2} className="shrink-0 text-red-700" aria-hidden="true" />
          <span className="text-[16px] leading-[1.5] text-red-700">
            <strong>{listing.organisationName} is not verified.</strong>{" "}
            This listing is live under a verified stamp from an organisation
            that no longer has one.
          </span>
        </div>
      ) : null}

      <div className="flex flex-col gap-[10px]">
        <h1 className="m-0 font-display text-[30px] font-normal leading-[1.1] tracking-[-0.01em] sm:text-[38px]">
          How she will see it
        </h1>
        <p className="m-0 max-w-[62ch] text-[17px] leading-[1.55] text-ink-70">
          Exactly what a woman searching sees. Read it before deciding: if
          anything here would waste her time, hide it and say why.
        </p>
      </div>

      {notified === "failed" ? (
        <div className="rounded-card border border-red-200 bg-red-50 px-[22px] py-5 text-[16px] leading-[1.5] text-red-700">
          <strong>That saved, but we could not email {listing.organisationName}.</strong>{" "}
          They will see it on their own dashboard, so nothing is lost, but they
          will not know until they next sign in. Tell them another way if it
          matters.
        </div>
      ) : null}

      <ResultCard data={card} strongest />

      <ModerationForm listing={listing} />
    </Page>
  );
}

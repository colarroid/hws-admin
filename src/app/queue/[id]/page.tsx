import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, TriangleAlert } from "lucide-react";
import { Page } from "@/components/ui/Page";
import { ResultCard, type ResultCardData } from "@/components/ResultCard";
import { ReviewForm } from "@/components/admin/ReviewForm";
import { requireAdmin } from "@/lib/data/admin";
import { getReviewListing } from "@/lib/data/queue";
import { COSTS, FORMATS, SOLUTION_KINDS, labelFor } from "@/lib/design/taxonomy";

const DATE = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long" });

export const metadata: Metadata = { title: "Review listing" };

/**
 * Reviewing one listing.
 *
 * The card at the top is the real woman-facing component, so the reviewer
 * judges what she will actually read rather than a form full of fields. The
 * four checks below it are the ones the portal promises: eligibility clear,
 * dates real, link working, description matching what is actually run.
 */
export default async function ReviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  await requireAdmin();

  const { id } = await params;
  const { error } = await searchParams;
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
        href="/queue"
        className="inline-flex min-h-[44px] items-center gap-[6px] self-start text-[14px] font-bold text-ink no-underline"
      >
        <ArrowLeft size={16} strokeWidth={2} aria-hidden="true" />
        Review queue
      </Link>

      {/* Verification gates publishing, not drafting. An organisation can
          submit before it is verified, and this is where that stops. */}
      {unverified ? (
        <div className="flex flex-wrap items-center gap-3 rounded-card border border-red-200 bg-red-50 px-[22px] py-5">
          <TriangleAlert size={20} strokeWidth={2} className="shrink-0 text-red-700" aria-hidden="true" />
          <span className="text-[16px] leading-[1.5] text-red-700">
            <strong>{listing.organisationName} is not verified yet.</strong>{" "}
            Publishing this would put a verified stamp on a listing from an
            organisation nobody has checked.
          </span>
        </div>
      ) : null}

      <div className="flex flex-col gap-[10px]">
        <h1 className="m-0 font-display text-[30px] font-normal leading-[1.1] tracking-[-0.01em] sm:text-[38px]">
          How she will see it
        </h1>
        <p className="m-0 text-[17px] leading-[1.55] text-ink-70">
          Read the card first. If anything here would waste her time, send it
          back rather than fixing it silently.
        </p>
      </div>

      <ResultCard data={card} strongest />

      <ReviewForm
        listing={listing}
        blockedReason={unverified ? "organisation not verified" : null}
        noteError={error === "note"}
      />
    </Page>
  );
}

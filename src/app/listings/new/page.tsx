import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Page } from "@/components/ui/Page";
import { SolutionForm } from "@/components/admin/SolutionForm";
import { requireAdmin } from "@/lib/data/admin";
import { getSituations } from "@/lib/data/solutions";
import { getOrganisationOptions } from "@/lib/data/markets";

export const metadata: Metadata = { title: "Post a solution" };

/**
 * Posting on an organisation's behalf.
 *
 * The organisations that will never sign up still run things worth a woman's
 * afternoon, and a profile with nothing open under it is a dead end. This is
 * how those get onto the platform.
 */
export default async function NewListingPage() {
  await requireAdmin();

  const [situations, organisations] = await Promise.all([
    getSituations(),
    getOrganisationOptions(),
  ]);

  return (
    <Page width={820} top={56} gap={26}>
      <Link
        href="/listings"
        className="inline-flex min-h-[44px] items-center gap-[6px] self-start text-[14px] font-bold text-ink no-underline"
      >
        <ArrowLeft size={16} strokeWidth={2} aria-hidden="true" />
        Published listings
      </Link>

      <div className="flex flex-col gap-[10px]">
        <h1 className="m-0 font-display text-[32px] font-normal leading-[1.1] tracking-[-0.01em] sm:text-[42px]">
          Post a solution
        </h1>
        <p className="m-0 max-w-[64ch] text-[17px] leading-[1.55] text-ink-70">
          On behalf of an organisation that has not posted it themselves. It
          becomes an ordinary listing. A woman cannot tell who typed it, and it
          should not change what she gets. Your name goes on the record
          instead.
        </p>
      </div>

      <SolutionForm situations={situations} organisations={organisations} />
    </Page>
  );
}

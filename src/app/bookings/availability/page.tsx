import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Page } from "@/components/ui/Page";
import { AvailabilityEditor } from "@/components/admin/AvailabilityEditor";
import { BlocksEditor } from "@/components/admin/BlocksEditor";
import { getAvailability, getBlocks } from "@/lib/data/booking";

export const metadata: Metadata = { title: "When we are open" };

/**
 * Setting the calendar a woman chooses from.
 *
 * Two things, in the order they are thought about. The weekly pattern is set
 * once and rarely touched: "Tuesdays and Thursdays, ten to four". Closing a
 * date is the thing an admin comes back for, so it is the second half of the
 * same screen rather than somewhere else.
 *
 * Slots are never stored anywhere. What is on this page is the whole of the
 * calendar's definition, and a woman's screen is computed from it minus what
 * is already booked. Changing anything here changes what she sees on her next
 * page load, with nothing to regenerate.
 */
export default async function AvailabilityPage() {
  const [rules, blocks] = await Promise.all([getAvailability(), getBlocks()]);

  return (
    <Page width={760} top={56} gap={30}>
      <Link
        href="/bookings"
        className="inline-flex min-h-[44px] items-center gap-[6px] self-start text-[14px] font-bold text-ink no-underline"
      >
        <ArrowLeft size={16} strokeWidth={2} aria-hidden="true" />
        Bookings
      </Link>

      <div className="flex flex-col gap-2">
        <h1 className="m-0 font-display text-[32px] font-normal leading-[1.1] tracking-[-0.01em] sm:text-[42px]">
          When we are open
        </h1>
        <p className="m-0 max-w-[60ch] text-[17px] leading-[1.6] text-ink-70">
          This is the whole calendar. She sees these times, minus the days you
          close below, minus anything already booked. Nothing is held in
          advance and there is nothing to regenerate.
        </p>
      </div>

      <AvailabilityEditor rules={rules} />
      <BlocksEditor blocks={blocks} />

      {rules.length === 0 ? (
        <p className="m-0 rounded-card border border-red-200 bg-red-50 px-[22px] py-5 text-[16px] leading-[1.5] text-red-700">
          With no hours set, the booking page tells every woman there is
          nothing free in the next few weeks. Add at least one before the
          no-match screen is reachable.
        </p>
      ) : null}
    </Page>
  );
}

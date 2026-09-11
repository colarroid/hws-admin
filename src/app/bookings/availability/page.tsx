import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Page } from "@/components/ui/Page";
import { OpeningHoursEditor } from "@/components/admin/OpeningHoursEditor";
import { MonthEditor } from "@/components/admin/MonthEditor";
import { BlocksEditor } from "@/components/admin/BlocksEditor";
import { getBlocks, getOpeningHours, londonToday } from "@/lib/data/booking";

export const metadata: Metadata = { title: "When we are open" };

/**
 * Setting the calendar a woman chooses from.
 *
 * Three things, in the order they are thought about. The hours are the shape
 * of a day HWS is in, and are set once. The month says which days those are,
 * and starts with all of them: a day is open until somebody takes it off.
 * Closing an hour in the middle of an otherwise open day is the third and
 * rarest, so it is last.
 *
 * This replaced a weekly pattern — "Tuesdays and Thursdays, ten to four" —
 * which had it the other way round: nothing open until somebody opened it.
 * The new default is the safer one. Forget to touch this screen and the
 * calendar still offers times, which somebody may have to decline. Under the
 * old shape, and under any shape where days are opened by hand, forgetting
 * means telling every woman there is nothing free, correctly and silently.
 *
 * Whole days belong to the month grid and part-days to the blocks editor, and
 * they are deliberately not two ways to do one thing: the grid's squares are
 * whole-day blocks, and the list below is filtered to the part-day ones so
 * the same closure never appears in both.
 *
 * Slots are still never stored. What is on this page is the whole of the
 * calendar's definition, and her screen is computed from it minus what is
 * already booked. Changing anything here changes what she sees on her next
 * page load, with nothing to regenerate.
 */
export default async function AvailabilityPage() {
  const [hours, blocks] = await Promise.all([getOpeningHours(), getBlocks()]);
  const today = londonToday();

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
          Every day is open for the hours you set here. Take off the days you
          are away. She sees what is left, minus anything already booked.
          Nothing is held in advance and there is nothing to regenerate.
        </p>
      </div>

      {/* Above the editors, because it is the reason somebody opened this page
          and an answer underneath a month of squares is an answer nobody
          scrolls to. With no hours there is no calendar at all, whatever the
          grid looks like. */}
      {hours.length === 0 ? (
        <p className="m-0 rounded-card border border-red-200 bg-red-50 px-[22px] py-5 text-[16px] leading-[1.5] text-red-700">
          <strong className="font-semibold">No hours set.</strong> Every day is
          open in principle and empty in practice, so the booking page is
          telling every woman there is nothing free. Set the hours before the
          no-match screen is reachable.
        </p>
      ) : null}

      <OpeningHoursEditor hours={hours} />
      <MonthEditor hours={hours} blocks={blocks} today={today} />
      <BlocksEditor blocks={blocks.filter((b) => b.startMinute !== null)} />
    </Page>
  );
}

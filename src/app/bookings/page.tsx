import type { Metadata } from "next";
import Link from "next/link";
import { CalendarCog } from "lucide-react";
import { Page } from "@/components/ui/Page";
import { BookingRow } from "@/components/admin/BookingRow";
import { getBookings } from "@/lib/data/booking";

export const metadata: Metadata = { title: "Bookings" };

/**
 * The calls somebody has to make.
 *
 * Soonest first, and everything she told us on the row rather than behind a
 * click. Whoever takes the call should be able to read the whole of it in the
 * ten seconds before dialling, and a detail page would mean opening a tab per
 * conversation.
 *
 * Cancelled ones stay, greyed. A slot that reopened is a thing an admin may
 * need to explain later, and deleting the row deletes the explanation.
 */
export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ past?: string }>;
}) {
  const { past } = await searchParams;
  const includePast = past === "1";
  const bookings = await getBookings({ includePast });

  return (
    <Page width={820} top={56} gap={26}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="m-0 font-display text-[32px] font-normal leading-[1.1] tracking-[-0.01em] sm:text-[42px]">
            Bookings
          </h1>
          <p className="m-0 max-w-[58ch] text-[17px] leading-[1.6] text-ink-70">
            Calls booked from the screen a woman reaches when nothing matched.
            Everything she told us is here, so she does not have to say it
            again.
          </p>
        </div>

        <Link
          href="/bookings/availability"
          className="inline-flex min-h-[44px] items-center gap-2 rounded-control bg-surface px-5 py-3 text-[15px] font-bold text-ink no-underline shadow-hairline"
        >
          <CalendarCog size={17} strokeWidth={2} aria-hidden="true" />
          When we are open
        </Link>
      </div>

      <nav aria-label="Which bookings" className="flex flex-wrap gap-[10px]">
        {[
          { href: "/bookings", label: "Coming up", on: !includePast },
          { href: "/bookings?past=1", label: "Everything", on: includePast },
        ].map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={tab.on ? "true" : undefined}
            className={[
              "inline-flex min-h-[44px] items-center rounded-full px-[18px] py-[10px] text-[15px] font-semibold no-underline",
              tab.on
                ? "bg-ink text-white"
                : "bg-surface text-ink shadow-hairline transition-[box-shadow] duration-150 ease-out hover:shadow-hairline-gold",
            ].join(" ")}
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      {bookings.length === 0 ? (
        <p className="m-0 rounded-card bg-surface p-6 text-[16px] leading-[1.6] text-ink-70 shadow-hairline">
          {includePast
            ? "Nobody has booked a call yet."
            : "Nothing booked. If that stays true while the no-match screen is being reached, the times on offer are the thing to look at."}
        </p>
      ) : (
        <div className="flex flex-col gap-[14px]">
          {bookings.map((booking) => (
            <BookingRow key={booking.id} booking={booking} />
          ))}
        </div>
      )}
    </Page>
  );
}

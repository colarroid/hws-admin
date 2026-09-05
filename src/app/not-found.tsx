import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Building2, LogIn, Rows3 } from "lucide-react";
import { Page } from "@/components/ui/Page";
import { getAdmin } from "@/lib/data/admin";

export const metadata: Metadata = {
  title: "Not found",
  robots: { index: false, follow: false },
};

/**
 * The 404.
 *
 * Terser than the two public ones, because this is a staff tool and the
 * person reading it is doing a job rather than looking for help. It says the
 * likeliest cause and gets out of the way.
 *
 * The likeliest cause here is not a typo. It is a link to a listing or an
 * organisation that has since been deleted, usually from a note, a message
 * from a colleague or a browser history entry. Saying so is the difference
 * between "I mistyped" and "that record is gone", which are two different
 * next moves.
 */
export default async function NotFound() {
  // Must render even if the session read fails: this is already the screen
  // somebody is on because something went wrong.
  const admin = await getAdmin().catch(() => null);

  const ways = admin
    ? [
        {
          href: "/listings",
          icon: Rows3,
          title: "Listings",
          body: "Everything posted across the platform, searchable and filtered by status.",
        },
        {
          href: "/organisations",
          icon: Building2,
          title: "Organisations",
          body: "Everyone registered, including those still waiting to be verified.",
        },
      ]
    : [
        {
          href: "/sign-in",
          icon: LogIn,
          title: "Sign in",
          body: "This tool is for HWS staff. Sign in and try the link again.",
        },
      ];

  return (
    <Page width={720} top={72} gap={28}>
      <div className="flex flex-col gap-[10px]">
        <span className="eyebrow text-ink-60">404</span>
        <h1 className="m-0 font-display text-[30px] font-normal leading-[1.15] tracking-[-0.01em] sm:text-[42px] sm:leading-[1.1]">
          Not found
        </h1>
        <p className="m-0 max-w-[58ch] text-[18px] leading-[1.6] text-ink-70">
          Either the address is wrong, or the record it points at has been
          deleted since the link was made.
        </p>
      </div>

      <div className="flex flex-col gap-[14px]">
        {ways.map((way) => (
          <Link
            key={way.href}
            href={way.href}
            className="group flex items-start gap-4 rounded-card bg-surface p-6 no-underline shadow-hairline transition-[box-shadow,transform] duration-150 ease-out hover:-translate-y-[2px] hover:shadow-panel"
          >
            <way.icon
              size={22}
              strokeWidth={1.75}
              className="mt-[2px] shrink-0 text-gold-700"
              aria-hidden="true"
            />
            <span className="flex min-w-0 flex-1 flex-col gap-2">
              <span className="font-display text-[20px] font-normal leading-[1.25] text-ink">
                {way.title}
              </span>
              <span className="text-[16px] leading-[1.55] text-ink-70">
                {way.body}
              </span>
            </span>
            <ArrowRight
              size={18}
              strokeWidth={2}
              className="mt-2 shrink-0 text-gold-700 transition-transform duration-150 ease-out group-hover:translate-x-1"
              aria-hidden="true"
            />
          </Link>
        ))}
      </div>
    </Page>
  );
}

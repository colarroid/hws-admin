import type { Metadata } from "next";
import Image from "next/image";
import { Page } from "@/components/ui/Page";
import { SignInForm } from "@/components/admin/SignInForm";

export const metadata: Metadata = { title: "Sign in" };

/**
 * The only screen here that is reachable signed out, so it carries its own
 * identity: the header is not rendered until there is an admin, and there is
 * no navigation to show anyone who has not signed in yet.
 *
 * White rather than the cream ground. Nothing else sits on this screen, so
 * the page is the surface the form sits on rather than a card floating over
 * one, and a plain white sheet reads as more deliberate than a tinted one
 * with nothing on it.
 */
export default function SignInPage() {
  return (
    <div className="min-h-screen bg-surface">
      <Page width={460} top={80} gap={22}>
        <div className="flex flex-col gap-7">
          {/* Aligned to the text rather than centred, and given room, so the
              mark reads as the thing above the title and not as part of it. */}
          <Image
            src="/logo.svg"
            alt="HWS Pathgrid"
            width={116}
            height={42}
            priority
            className="shrink-0 self-start"
            // Served as authored. The image optimiser does not process SVG,
            // and there is nothing to gain from it on a 5KB vector.
            unoptimized
          />

          <div className="flex flex-col gap-[10px]">
            <h1 className="m-0 font-display text-[32px] font-normal leading-[1.1] tracking-[-0.01em] sm:text-[40px]">
              HWS admin
            </h1>
            <p className="m-0 text-[17px] leading-[1.55] text-ink-70">
              Sign in with your email address and password. Accounts are created
              by hand, not here.
            </p>
          </div>
        </div>

        <SignInForm />
      </Page>
    </div>
  );
}

import type { ReactNode } from "react";
import { Page } from "@/components/ui/Page";

/**
 * The wait, in the shape the woman-facing site uses.
 *
 * That site names the wait in words and blocks out what is coming in the
 * platform's own colours, and the same answer belongs here. A spinner could
 * mean anything, and "anything" reads as broken. A sentence saying what is
 * being fetched, and roughly how long, tells somebody whether to wait or to
 * go and do something else, which is the only question they actually have.
 *
 * The blocks are sage, gold and the off-white surface rather than grey. Grey
 * is the colour of a page that has failed to load; these are the colours of
 * the page that is arriving, so the wait looks like part of the site rather
 * than the absence of it.
 *
 * Nothing moves. A pulse or a shimmer would be the third thing on screen
 * asking to be looked at, and there is no information in it: the wait is
 * already named above and timed below.
 */

/** The three tones, cycled so a stack of blocks reads as one object. */
const TONES = ["bg-sage-200", "bg-gold-200", "bg-surface-subtle"] as const;

export function LoadingBlock({
  index = 0,
  height = 120,
  tone,
  className = "",
}: {
  /** Position in the stack. Decides the tone. */
  index?: number;
  height?: number;
  /**
   * Replaces the cycled tone outright rather than sitting beside it. Two
   * background utilities on one element is a cascade fight decided by the
   * order of the stylesheet, not by the order they are written here, so the
   * override has to take the place of the original.
   */
  tone?: string;
  className?: string;
}) {
  return (
    <div
      className={`rounded-card ${tone ?? TONES[index % TONES.length]} ${className}`}
      style={{ height }}
      aria-hidden="true"
    />
  );
}

/** The default arrangement: a stack, like a list of results. */
export function LoadingBlocks({
  count = 3,
  height = 120,
}: {
  count?: number;
  height?: number;
}) {
  return (
    <div className="flex flex-col gap-[14px]" aria-hidden="true">
      {Array.from({ length: count }).map((_, index) => (
        <LoadingBlock key={index} index={index} height={height} />
      ))}
    </div>
  );
}

/**
 * A whole waiting screen.
 *
 * `title` says what is being fetched and `note` says roughly how long. Both
 * are per screen, because "Loading" tells somebody nothing they could not
 * already see.
 *
 * The heading carries the live region and is visible, so there is no separate
 * announcement for a screen reader to trip over: what is read out is what is
 * on the page.
 */
export function LoadingScreen({
  title,
  note = "This usually takes a couple of seconds.",
  width = 780,
  top = 96,
  count = 3,
  height = 120,
  children,
}: {
  title: string;
  note?: string;
  width?: number;
  top?: number;
  count?: number;
  height?: number;
  /** Overrides the default stack when a screen lands in another shape. */
  children?: ReactNode;
}) {
  return (
    <Page width={width} top={top}>
      <h1
        aria-live="polite"
        className="m-0 font-display text-[30px] font-normal leading-[1.15] tracking-[-0.01em] sm:text-[44px] sm:leading-[1.1]"
      >
        {title}
      </h1>

      {children ?? <LoadingBlocks count={count} height={height} />}

      <p className="m-0 text-[17px] leading-[1.6] text-ink-70">{note}</p>
    </Page>
  );
}

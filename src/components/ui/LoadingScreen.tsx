import type { ReactNode } from "react";
import { Page } from "@/components/ui/Page";

/**
 * The blocks a page wears while it is being fetched.
 *
 * Two decisions, and they came from different places.
 *
 * The shapes follow the page that is coming: a heading where the heading
 * goes, a stack where the list goes, three across where three cards land.
 * That is what turns a wait into "your page is nearly here" rather than "your
 * page is gone".
 *
 * The colours come from the find flow, which had the right answer before any
 * of this existed: sage, gold and the off-white surface, cycled. Grey is the
 * colour of a page that has failed to load. These are the colours of the page
 * that is arriving, so the wait looks like part of the site rather than the
 * absence of it.
 *
 * No words and nothing moving. The blocks say what is coming on their own,
 * and a sentence or a pulse on top of them is a second thing to read in the
 * half a second before the real page replaces it. Screen readers get one
 * polite line naming what is loading, because a shape says nothing out loud.
 */

/** The three tones, cycled so a stack reads as one object. */
const TONES = ["bg-sage-200", "bg-gold-200", "bg-surface-subtle"] as const;

export function LoadingBlock({
  index = 0,
  height = 120,
  tone,
  radius = "rounded-card",
  className = "",
}: {
  /** Position in the stack. Decides the tone. */
  index?: number;
  height?: number;
  /**
   * Replaces the cycled tone outright rather than sitting beside it. Two
   * background utilities on one element is a cascade fight decided by the
   * order of the stylesheet, not the order they are written here, so an
   * override has to take the place of the original.
   */
  tone?: string;
  /**
   * Same reason as `tone`: a second radius utility beside the first is a
   * cascade fight, so a pill has to replace the card radius rather than sit
   * next to it.
   */
  radius?: string;
  className?: string;
}) {
  return (
    <div
      className={`${radius} ${tone ?? TONES[index % TONES.length]} ${className}`}
      style={{ height }}
      aria-hidden="true"
    />
  );
}

/** The default arrangement: a stack, like a list. */
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
 * Holds the wait to the height of the screen.
 *
 * The footer is a sibling of this in the layout, so it cannot be switched off
 * from here. Filling the viewport pushes it below the fold instead, which is
 * the same thing to look at and costs nothing: nobody scrolls a page that is
 * about to be replaced.
 */
export function LoadingFrame({
  label,
  children,
}: {
  /** What is loading, for a screen reader. Never shown. */
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-svh flex-col">
      <span role="status" aria-live="polite" className="sr-only">
        {label}
      </span>
      {children}
    </div>
  );
}

/**
 * A whole waiting page: a heading, a line under it, then the stack.
 *
 * The default for any screen whose shape is a title and a list, which is most
 * of them.
 */
export function LoadingPage({
  label,
  width = 780,
  top = 64,
  count = 3,
  height = 120,
}: {
  label: string;
  width?: number;
  top?: number;
  count?: number;
  height?: number;
}) {
  return (
    <LoadingFrame label={label}>
      <Page width={width} top={top} gap={26}>
        <div className="flex flex-col gap-4" aria-hidden="true">
          <LoadingBlock index={0} height={38} className="w-[58%]" />
          <LoadingBlock index={1} height={16} className="w-[78%]" />
        </div>

        <LoadingBlocks count={count} height={height} />
      </Page>
    </LoadingFrame>
  );
}

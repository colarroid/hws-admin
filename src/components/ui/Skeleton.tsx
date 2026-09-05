import { Page } from "@/components/ui/Page";

/**
 * The shapes a page wears while it is being fetched.
 *
 * Not a spinner. A spinner says something is happening; these say what is
 * coming, which is the difference between a wait that feels like progress and
 * one that feels like a fault. The queue screens here read the whole table
 * before they can show anything, so the wait is real and worth drawing.
 *
 * Everything here is hidden from screen readers and the wait is announced
 * once, in words, by the page that uses it. A reader working through fourteen
 * unlabelled boxes is worse served than one told "Loading" and left alone.
 */

/** One line of text that is not here yet. */
export function SkeletonLine({
  width = "100%",
  height = 16,
}: {
  width?: string;
  height?: number;
}) {
  return (
    <span
      className="skeleton block rounded-control"
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}

/** A heading that is not here yet. */
export function SkeletonHeading({ width = "60%" }: { width?: string }) {
  return (
    <span
      className="skeleton block rounded-control"
      style={{ width, height: 38 }}
      aria-hidden="true"
    />
  );
}

/** One row in a list. */
export function SkeletonCard({ lines = 2 }: { lines?: number }) {
  return (
    <div
      className="flex flex-col gap-3 rounded-card bg-surface p-6 shadow-hairline"
      aria-hidden="true"
    >
      <SkeletonLine width="52%" height={22} />
      {Array.from({ length: lines }).map((_, index) => (
        <SkeletonLine
          key={index}
          width={index === lines - 1 ? "64%" : "100%"}
        />
      ))}
      <SkeletonLine width="34%" height={13} />
    </div>
  );
}

/**
 * The whole-page wait, and the default for any route without one of its own.
 *
 * `label` is read out and is the one thing a screen reader gets, so it says
 * what is loading rather than that something is.
 */
export function SkeletonPage({
  label = "Loading",
  width = 780,
  cards = 3,
  lines = 2,
}: {
  label?: string;
  width?: number;
  cards?: number;
  lines?: number;
}) {
  return (
    <Page width={width} top={64} gap={26}>
      {/* The only thing here that is not decoration. Polite, so it waits for
          a gap rather than cutting across whatever she is being read. */}
      <span role="status" aria-live="polite" className="sr-only">
        {label}
      </span>

      <div className="flex flex-col gap-4" aria-hidden="true">
        <SkeletonHeading />
        <SkeletonLine width="80%" />
      </div>

      <div className="flex flex-col gap-[14px]" aria-hidden="true">
        {Array.from({ length: cards }).map((_, index) => (
          <SkeletonCard key={index} lines={lines} />
        ))}
      </div>
    </Page>
  );
}

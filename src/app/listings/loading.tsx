import { Page } from "@/components/ui/Page";
import { SkeletonLine } from "@/components/ui/Skeleton";

/**
 * The listings queue, waiting.
 *
 * The heaviest read in the tool: every listing on the platform, with its
 * organisation and status, filtered and paged. It is also the screen an admin
 * lands on from the front door, so it is the first thing anybody here sees.
 *
 * The search box and the filter chips are drawn at their real size above the
 * rows. They are the controls somebody reaches for first, and a row of them
 * appearing after the fact moves the list down under a cursor that was
 * already on its way to it.
 */
export default function Loading() {
  return (
    <Page width={820} top={56} gap={26}>
      <span role="status" aria-live="polite" className="sr-only">
        Loading the listings queue
      </span>

      <div aria-hidden="true" className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <SkeletonLine width="38%" height={42} />
          <SkeletonLine width="62%" />
        </div>

        <span className="skeleton block h-[52px] w-full rounded-full" />

        <div className="flex flex-wrap gap-[10px]">
          {[92, 78, 104, 86].map((width) => (
            <span
              key={width}
              className="skeleton block h-[40px] rounded-full"
              style={{ width }}
            />
          ))}
        </div>

        <div className="flex flex-col gap-[14px]">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="flex flex-wrap items-center justify-between gap-4 rounded-card bg-surface p-6 shadow-hairline"
            >
              <span className="flex min-w-0 flex-1 flex-col gap-2">
                <SkeletonLine width="46%" height={20} />
                <SkeletonLine width="62%" height={14} />
              </span>
              <span className="skeleton block h-[30px] w-[86px] rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </Page>
  );
}

import { Page } from "@/components/ui/Page";
import { SkeletonLine } from "@/components/ui/Skeleton";

/**
 * The organisations queue, waiting.
 *
 * Same shape as the listings queue, because it is the same job: a search, a
 * set of filters, and a stack of rows each ending in a status. Drawn out
 * rather than shared with that file, since the two screens are free to drift
 * and a skeleton that follows the wrong one is worse than none.
 */
export default function Loading() {
  return (
    <Page width={820} top={56} gap={26}>
      <span role="status" aria-live="polite" className="sr-only">
        Loading organisations
      </span>

      <div aria-hidden="true" className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <SkeletonLine width="34%" height={42} />
          <SkeletonLine width="58%" />
        </div>

        <span className="skeleton block h-[52px] w-full rounded-full" />

        <div className="flex flex-wrap gap-[10px]">
          {[84, 96, 72].map((width) => (
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
                <SkeletonLine width="42%" height={20} />
                <SkeletonLine width="56%" height={14} />
              </span>
              <span className="skeleton block h-[30px] w-[86px] rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </Page>
  );
}

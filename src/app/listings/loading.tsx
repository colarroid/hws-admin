import { Page } from "@/components/ui/Page";
import { LoadingBlock, LoadingFrame } from "@/components/ui/LoadingScreen";

/**
 * The listings queue, waiting.
 *
 * The heaviest read in the tool: every listing on the platform, with its
 * organisation and status, filtered and paged. It is also where an admin
 * lands from the front door, so it is the first thing anybody here sees.
 *
 * The search box and the filter chips are drawn at their real size above the
 * rows. They are the controls somebody reaches for first, and a row of them
 * appearing after the fact moves the list down under a cursor that was
 * already on its way to it.
 */
export default function Loading() {
  return (
    <LoadingFrame label="Loading the listings queue">
      <Page width={820} top={56} gap={26}>
        <div className="flex flex-col gap-6" aria-hidden="true">
          <div className="flex flex-col gap-3">
            <LoadingBlock index={0} height={42} className="w-[38%]" />
            <LoadingBlock index={1} height={16} className="w-[62%]" />
          </div>

          <LoadingBlock index={2} height={52} radius="rounded-full" />

          <div className="flex flex-wrap gap-[10px]">
            {["w-[92px]", "w-[78px]", "w-[104px]", "w-[86px]"].map(
              (width, index) => (
                <LoadingBlock
                  key={width}
                  index={index}
                  height={40}
                  radius="rounded-full"
                  className={width}
                />
              ),
            )}
          </div>

          <div className="flex flex-col gap-[14px]">
            {Array.from({ length: 5 }).map((_, index) => (
              <LoadingBlock key={index} index={index} height={104} />
            ))}
          </div>
        </div>
      </Page>
    </LoadingFrame>
  );
}

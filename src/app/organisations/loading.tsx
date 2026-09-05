import { Page } from "@/components/ui/Page";
import { LoadingBlock, LoadingFrame } from "@/components/ui/LoadingScreen";

/**
 * The organisations queue, waiting.
 *
 * Same shape as the listings queue, because it is the same job: a search, a
 * set of filters, and a stack of rows. Written out rather than shared with
 * that file, since the two screens are free to drift and a shape that follows
 * the wrong one is worse than none.
 */
export default function Loading() {
  return (
    <LoadingFrame label="Loading organisations">
      <Page width={820} top={56} gap={26}>
        <div className="flex flex-col gap-6" aria-hidden="true">
          <div className="flex flex-col gap-3">
            <LoadingBlock index={0} height={42} className="w-[34%]" />
            <LoadingBlock index={1} height={16} className="w-[58%]" />
          </div>

          <LoadingBlock index={2} height={52} radius="rounded-full" />

          <div className="flex flex-wrap gap-[10px]">
            {["w-[84px]", "w-[96px]", "w-[72px]"].map((width, index) => (
              <LoadingBlock
                key={width}
                index={index}
                height={40}
                radius="rounded-full"
                className={width}
              />
            ))}
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

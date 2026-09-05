import { SkeletonPage } from "@/components/ui/Skeleton";

/**
 * The wait, for every screen that does not name its own.
 *
 * At the root, so the nav stays put and only the middle of the screen is
 * waiting. Every screen here reads the admin record before it reads anything
 * else, so there is always at least one round trip before a page can render.
 *
 * Deliberately generic. A skeleton that guesses a shape and guesses wrong
 * makes the real screen look like it moved.
 */
export default function Loading() {
  return <SkeletonPage label="Loading" width={820} cards={3} />;
}

import { LoadingPage } from "@/components/ui/LoadingScreen";

/**
 * The wait, for every screen that does not name its own.
 *
 * At the root, so the nav stays put and only the middle of the screen is
 * waiting. Every screen here reads the admin record before it reads anything
 * else, so there is always at least one round trip before a page can render.
 */
export default function Loading() {
  return <LoadingPage label="Loading" width={820} count={3} />;
}

import { LoadingScreen } from "@/components/ui/LoadingScreen";

/**
 * The wait, for every screen that does not name its own.
 *
 * At the root, so the nav stays put and only the middle of the screen is
 * waiting. Every screen here reads the admin record before it reads anything
 * else, so there is always at least one round trip before a page can render.
 *
 * The wording is the vaguest in the tool, because it stands in for any
 * screen. Anywhere the wait can be named properly, it is named in that
 * route's own loading.tsx instead.
 */
export default function Loading() {
  return <LoadingScreen title="One moment…" width={820} count={2} />;
}

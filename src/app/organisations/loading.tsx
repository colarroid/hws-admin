import { LoadingScreen } from "@/components/ui/LoadingScreen";

/**
 * The organisations queue, waiting.
 *
 * Same job as the listings queue and the same shape, said in its own words so
 * an admin can tell at a glance which of the two they are waiting on.
 */
export default function Loading() {
  return (
    <LoadingScreen
      title="Loading organisations…"
      width={820}
      count={4}
      height={110}
    />
  );
}

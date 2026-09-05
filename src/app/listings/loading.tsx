import { LoadingScreen } from "@/components/ui/LoadingScreen";

/**
 * The listings queue, waiting.
 *
 * The heaviest read in the tool: every listing on the platform, with its
 * organisation and status, filtered and paged. It is also where an admin
 * lands from the front door, so it is the first thing anybody here sees, and
 * the note says what is being read rather than the usual line.
 */
export default function Loading() {
  return (
    <LoadingScreen
      title="Loading the queue…"
      note="Reading every listing on the platform. This usually takes a couple of seconds."
      width={820}
      count={4}
      height={110}
    />
  );
}

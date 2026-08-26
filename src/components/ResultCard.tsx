import { BadgeCheck, Bookmark } from "lucide-react";

export type ResultCardData = {
  name: string;
  /** Organisation name and place, as she reads it under the title. */
  source: string;
  blurb: string;
  /** Kind, cost and format, already turned into labels. */
  tags: string[];
  /** "Closes 26 September" or null when it runs all year. */
  deadline: string | null;
  whoFor: string;
  whatToExpect: string;
  /**
   * Written by the ranker from her answers, never by the organisation, since
   * only the ranker knows why something scored.
   */
  why: string;
  /** "Verified · last checked 4 August 2026", or the pending wording. */
  verified: string;
};

const MISSING = "Not filled in yet";

/**
 * The woman-facing result card.
 *
 * This is the real card, not a mock of it. The organisation preview screen
 * renders it so an organisation sees exactly what a woman sees, and the
 * woman-facing results screen renders the same component. The two must not
 * drift, which is why it lives on its own rather than inside either flow.
 *
 * Eleven pieces of information in a fixed order: name, source, description,
 * tags, who it is for, what to expect, deadline, why it matched, the action,
 * the verified stamp, and the data source.
 *
 * The action is always "Learn more". Never "Apply": applying happens on the
 * organisation's own site, and promising otherwise breaks the handover.
 */
export function ResultCard({
  data,
  saveSlot,
  actionSlot,
  /**
   * Draws the heavy border permanently. Used by the organisation preview,
   * where a single card stands alone and needs an edge.
   */
  strongest = false,
  /** Adds the hover and keyboard-focus edge. Results cards set this. */
  interactive = false,
  /** Labels this as the top-ranked result. Only ever the first card. */
  bestMatch = false,
  /** In preview, empty fields are named rather than collapsed. */
  showGaps = false,
}: {
  data: ResultCardData;
  /** Live Save control. Omitted, an inert copy is drawn for preview. */
  saveSlot?: React.ReactNode;
  /** Live "Learn more" link. Omitted, an inert copy is drawn for preview. */
  actionSlot?: React.ReactNode;
  strongest?: boolean;
  interactive?: boolean;
  bestMatch?: boolean;
  showGaps?: boolean;
}) {
  const fallback = (value: string) =>
    value.trim() ? value : showGaps ? MISSING : "";

  const dim = (value: string) =>
    showGaps && !value.trim() ? "text-ink-40 italic" : "";

  return (
    <article
      className={[
        "flex flex-col gap-[14px] rounded-card-lg bg-surface p-7",
        strongest ? "border-2 border-ink" : "border border-ring",
        // outline rather than a thicker border: it is drawn outside the box
        // model, so nothing reflows and the cards below do not jump as the
        // pointer crosses them. focus-within means tabbing to Save or Learn
        // more shows which card you are working inside.
        interactive
          ? [
              "outline-2 outline-transparent outline-offset-[-2px]",
              "transition-[outline-color] duration-150 ease-out",
              "hover:outline-ink focus-within:outline-ink",
            ].join(" ")
          : "",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-6">
        <div className="flex flex-col gap-[5px]">
          {bestMatch ? (
            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-gold-700">
              Best match
            </span>
          ) : null}
          <h2 className={`m-0 text-[23px] font-bold leading-[1.25] ${dim(data.name)}`}>
            {fallback(data.name)}
          </h2>
          <span className="text-[15px] text-ink-65">{data.source}</span>
        </div>

        {saveSlot ?? (
        /* Inert. This is a preview of her card, not her card. */
        <span
          aria-hidden="true"
          className="flex items-center gap-2 whitespace-nowrap rounded-control border border-ring bg-surface px-4 py-3 text-[15px] font-bold text-ink"
        >
          <Bookmark size={17} strokeWidth={2} className="text-gold-500" />
          <span>Save</span>
        </span>
        )}
      </div>

      <p className={`m-0 max-w-[62ch] text-[17px] leading-[1.6] ${dim(data.blurb)}`}>
        {fallback(data.blurb)}
      </p>

      <div className="flex flex-wrap gap-2">
        {data.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-tag bg-sage-200 px-[10px] py-[6px] text-[13px] font-semibold"
          >
            {tag}
          </span>
        ))}
        {data.deadline ? (
          <span className="rounded-tag bg-gold-200 px-[10px] py-[6px] text-[13px] font-semibold text-gold-700">
            {data.deadline}
          </span>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-4 border-t border-hairline-soft pt-[14px] sm:grid-cols-2 sm:gap-x-8">
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink-60">
            Who it&apos;s for
          </span>
          <span className={`text-[15px] leading-[1.5] ${dim(data.whoFor)}`}>
            {fallback(data.whoFor)}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink-60">
            What to expect
          </span>
          <span className={`text-[15px] leading-[1.5] ${dim(data.whatToExpect)}`}>
            {fallback(data.whatToExpect)}
          </span>
        </div>
      </div>

      <div className="rounded-control bg-gold-200 px-4 py-[14px] text-[15px] leading-[1.55] text-gold-700">
        <strong>Why this matched you:</strong> {data.why}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-5">
        {actionSlot ?? (
        <span
          aria-hidden="true"
          className="rounded-control bg-ink px-8 py-[15px] text-[17px] font-bold text-white"
        >
          Learn more
        </span>
        )}
        <span className="inline-flex items-center gap-[7px] text-[13px] text-green-700">
          <BadgeCheck size={14} strokeWidth={2} aria-hidden="true" />
          {data.verified}
        </span>
      </div>
    </article>
  );
}

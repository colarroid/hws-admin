import type { ListingStatus } from "@/lib/data/listings";

const STYLES: Record<ListingStatus, { className: string; label: string }> = {
  live: { className: "bg-sage-200 text-green-700", label: "Live" },
  in_review: { className: "bg-gold-200 text-gold-700", label: "In review" },
  changes_requested: {
    className: "bg-red-50 text-red-700",
    label: "Needs changes",
  },
  draft: { className: "bg-closed text-ink-65", label: "Draft" },
  closed: { className: "bg-closed text-ink-65", label: "Closed" },
};

/**
 * The status pill sits above the listing name rather than beside it. That is
 * the hierarchy point on both the dashboard and the woman-facing saved list:
 * status is read before the name.
 */
export function StatusPill({ status }: { status: ListingStatus }) {
  const { className, label } = STYLES[status];
  return (
    <span
      className={`self-start rounded-pill-sm px-[11px] py-[7px] text-[13px] font-bold ${className}`}
    >
      {label}
    </span>
  );
}

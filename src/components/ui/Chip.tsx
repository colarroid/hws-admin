"use client";

import { Check } from "lucide-react";

type ChipProps = {
  label: string;
  selected: boolean;
  onToggle: () => void;
  /** Selected single-select chips are radios; multi-select are toggles. */
  multi?: boolean;
  /** Woman-facing chips lead with a check when selected. */
  showCheck?: boolean;
};

/**
 * The one chip component, shared by organisation type, solution kind, cost,
 * format, situation tags and dashboard tabs.
 *
 * Single-select and multi-select share the visual; only the toggle behaviour
 * differs. State is conveyed by colour and weight, so aria-pressed carries it
 * for anyone not seeing the fill.
 */
export function Chip({
  label,
  selected,
  onToggle,
  multi = true,
  showCheck = false,
}: ChipProps) {
  return (
    <button
      type="button"
      role={multi ? undefined : "radio"}
      aria-pressed={multi ? selected : undefined}
      aria-checked={multi ? undefined : selected}
      onClick={onToggle}
      className={[
        "inline-flex items-center gap-2 min-h-[44px] rounded-full px-[18px] py-3",
        "text-[15px] cursor-pointer transition-[color,background-color,box-shadow] duration-150",
        selected
          ? "bg-ink text-white shadow-hairline-ink font-semibold"
          : "bg-surface text-ink shadow-hairline font-normal hover:shadow-hairline-gold",
      ].join(" ")}
    >
      {showCheck && selected ? (
        <Check size={16} strokeWidth={2} aria-hidden="true" />
      ) : null}
      <span>{label}</span>
    </button>
  );
}

type ChipGroupProps = {
  label: string;
  multi?: boolean;
  children: React.ReactNode;
};

/** Groups chips so the set has one accessible name rather than N loose buttons. */
export function ChipGroup({ label, multi = true, children }: ChipGroupProps) {
  return (
    <div
      role={multi ? "group" : "radiogroup"}
      aria-label={label}
      className="flex flex-wrap gap-[10px]"
    >
      {children}
    </div>
  );
}

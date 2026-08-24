"use client";

import { useId } from "react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

type HintTone = "muted" | "error" | "success";

const HINT_TONE: Record<HintTone, string> = {
  muted: "text-ink-60",
  error: "text-red-700",
  success: "text-green-700",
};

type FieldProps = {
  label: string;
  /** The primary field on a screen carries a 1.5px ink border. */
  emphasis?: boolean;
  hint?: ReactNode;
  hintTone?: HintTone;
  /** Shown beneath the field, in red, with the border turning red too. */
  error?: string;
} & Omit<ComponentPropsWithoutRef<"input">, "className">;

/**
 * A labelled input.
 *
 * The prototype used <span> for every field label with no association to its
 * input, which the handoff calls out as a defect to fix in the build. Every
 * field here gets a real <label for>, and hints and errors are wired through
 * aria-describedby so a screen reader hears them too.
 */
export function Field({
  label,
  emphasis = false,
  hint,
  hintTone = "muted",
  error,
  ...props
}: FieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;

  const border = error
    ? "border-[1.5px] border-red-700"
    : emphasis
      ? "border-[1.5px] border-ink"
      : "border border-ring";

  const describedBy =
    [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(" ") ||
    undefined;

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-[15px] font-semibold">
        {label}
      </label>
      <input
        id={id}
        aria-describedby={describedBy}
        aria-invalid={error ? true : undefined}
        className={`${border} rounded-control bg-surface text-ink text-[17px] p-4 min-h-[44px]`}
        {...props}
      />
      {/* Errors sit beneath the field with a message, never a bare red border. */}
      {error ? (
        <span id={errorId} className="text-[14px] leading-[1.5] text-red-700">
          {error}
        </span>
      ) : null}
      {hint ? (
        <span
          id={hintId}
          className={`text-[14px] leading-[1.5] ${HINT_TONE[hintTone]}`}
        >
          {hint}
        </span>
      ) : null}
    </div>
  );
}

type TextAreaProps = {
  label: string;
  emphasis?: boolean;
  hint?: ReactNode;
  hintTone?: HintTone;
  error?: string;
} & Omit<ComponentPropsWithoutRef<"textarea">, "className">;

export function TextAreaField({
  label,
  emphasis = false,
  hint,
  hintTone = "muted",
  error,
  ...props
}: TextAreaProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;

  const border = error
    ? "border-[1.5px] border-red-700"
    : emphasis
      ? "border-[1.5px] border-ink"
      : "border border-ring";

  const describedBy =
    [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(" ") ||
    undefined;

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-[15px] font-semibold">
        {label}
      </label>
      <textarea
        id={id}
        aria-describedby={describedBy}
        aria-invalid={error ? true : undefined}
        className={`${border} rounded-control bg-surface text-ink text-[17px] p-4 resize-y`}
        {...props}
      />
      {error ? (
        <span id={errorId} className="text-[14px] leading-[1.5] text-red-700">
          {error}
        </span>
      ) : null}
      {hint ? (
        <span
          id={hintId}
          className={`text-[14px] leading-[1.5] ${HINT_TONE[hintTone]}`}
        >
          {hint}
        </span>
      ) : null}
    </div>
  );
}

"use client";

import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

type HintTone = "muted" | "error" | "success";

const HINT_TONE: Record<HintTone, string> = {
  muted: "text-ink-60",
  error: "text-red-700",
  success: "text-green-700",
};

type FieldProps = {
  label: string;
  hint?: ReactNode;
  hintTone?: HintTone;
  /** Shown beneath the field, in red, with the ring turning red too. */
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
  hint,
  hintTone = "muted",
  error,
  ...props
}: FieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;

  // Only an error changes the resting edge. A field is never drawn as though
  // it were focused before she has touched it.
  const edge = error ? "shadow-hairline-red" : "shadow-hairline";

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
        className={`${edge} rounded-control bg-surface text-ink text-[17px] p-4 min-h-[44px]`}
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
  hint?: ReactNode;
  hintTone?: HintTone;
  error?: string;
} & Omit<ComponentPropsWithoutRef<"textarea">, "className">;

export function TextAreaField({
  label,
  hint,
  hintTone = "muted",
  error,
  ...props
}: TextAreaProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;

  // Only an error changes the resting edge. A field is never drawn as though
  // it were focused before she has touched it.
  const edge = error ? "shadow-hairline-red" : "shadow-hairline";

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
        className={`${edge} rounded-control bg-surface text-ink text-[17px] p-4 resize-y`}
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

type PasswordFieldProps = {
  label: string;
  hint?: ReactNode;
  hintTone?: HintTone;
  error?: string;
} & Omit<ComponentPropsWithoutRef<"input">, "className" | "type">;

/**
 * A password input with a visibility toggle.
 *
 * The toggle is a real button inside the field, keyboard reachable and 44px
 * like every other target. It carries aria-pressed and an accessible name
 * that changes with state, since the eye icon alone does not say which way
 * it is currently set.
 *
 * Toggling never moves focus and never clears the value, so revealing a
 * password mid-typing costs nothing.
 */
export function PasswordField({
  label,
  hint,
  hintTone = "muted",
  error,
  ...props
}: PasswordFieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const [visible, setVisible] = useState(false);

  // Only an error changes the resting edge. A field is never drawn as though
  // it were focused before she has touched it.
  const edge = error ? "shadow-hairline-red" : "shadow-hairline";

  const describedBy =
    [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(" ") ||
    undefined;

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-[15px] font-semibold">
        {label}
      </label>

      <div className="relative flex items-center">
        <input
          id={id}
          type={visible ? "text" : "password"}
          aria-describedby={describedBy}
          aria-invalid={error ? true : undefined}
          className={`${edge} w-full rounded-control bg-surface p-4 pr-14 text-[17px] text-ink min-h-[44px]`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-pressed={visible}
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute right-1 flex h-11 w-11 cursor-pointer items-center justify-center rounded-control border-0 bg-transparent text-ink-60 hover:text-ink"
        >
          {visible ? (
            <EyeOff size={20} strokeWidth={2} aria-hidden="true" />
          ) : (
            <Eye size={20} strokeWidth={2} aria-hidden="true" />
          )}
        </button>
      </div>

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

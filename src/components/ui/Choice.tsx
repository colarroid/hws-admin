"use client";

import { useId } from "react";
import type { ReactNode } from "react";

/**
 * Checkboxes and radios, grouped.
 *
 * The chip group elsewhere is the right control for four or five short tags
 * on a screen with little else on it. It is the wrong one here: this form
 * asks eleven audiences and five kinds of coverage, and a wall of pills gives
 * no signal about which questions take one answer and which take several.
 * A checkbox and a radio say that in their shape, before anything is read.
 *
 * Real inputs, in a real fieldset with a legend, so the group is announced as
 * a group and arrow keys move within a radio set. The visible box is the
 * input itself with `accent-color`, rather than a hidden input and a styled
 * span: it keeps the platform's own focus ring, its own high-contrast-mode
 * rendering, and it cannot drift out of step with the checked state.
 */

const ROW =
  "flex min-h-[44px] cursor-pointer items-start gap-3 rounded-control px-3 py-[10px] transition-colors duration-150 ease-out hover:bg-gold-200";

const INPUT =
  "mt-[3px] size-[18px] shrink-0 accent-[color:var(--color-ink)] cursor-pointer";

function Group({
  legend,
  hint,
  columns,
  children,
}: {
  legend: string;
  hint?: ReactNode;
  /** Two columns once there is enough to be worth scanning side by side. */
  columns: boolean;
  children: ReactNode;
}) {
  return (
    <fieldset className="m-0 flex min-w-0 flex-col gap-[10px] border-0 p-0">
      <legend className="p-0 text-[15px] font-semibold">{legend}</legend>
      {hint ? (
        <span className="text-[14px] leading-[1.5] text-ink-60">{hint}</span>
      ) : null}
      <div
        className={
          columns
            ? "-mx-3 grid grid-cols-1 gap-x-4 sm:grid-cols-2"
            : "-mx-3 flex flex-col"
        }
      >
        {children}
      </div>
    </fieldset>
  );
}

export function CheckboxGroup({
  legend,
  hint,
  name,
  options,
  selected,
  onChange,
  columns = false,
}: {
  legend: string;
  hint?: ReactNode;
  name: string;
  options: readonly { slug: string; label: string }[];
  selected: string[];
  onChange: (next: string[]) => void;
  columns?: boolean;
}) {
  const id = useId();

  return (
    <Group legend={legend} hint={hint} columns={columns}>
      {options.map((option) => (
        <label key={option.slug} htmlFor={`${id}-${option.slug}`} className={ROW}>
          <input
            id={`${id}-${option.slug}`}
            type="checkbox"
            name={name}
            value={option.slug}
            checked={selected.includes(option.slug)}
            onChange={(event) =>
              onChange(
                event.target.checked
                  ? [...selected, option.slug]
                  : selected.filter((slug) => slug !== option.slug),
              )
            }
            className={INPUT}
          />
          <span className="text-[16px] leading-[1.4]">{option.label}</span>
        </label>
      ))}
    </Group>
  );
}

export function RadioGroup({
  legend,
  hint,
  name,
  options,
  value,
  onChange,
  columns = false,
}: {
  legend: string;
  hint?: ReactNode;
  name: string;
  options: readonly { slug: string; label: string }[];
  value: string;
  onChange: (next: string) => void;
  columns?: boolean;
}) {
  const id = useId();

  return (
    <Group legend={legend} hint={hint} columns={columns}>
      {options.map((option) => (
        <label key={option.slug} htmlFor={`${id}-${option.slug}`} className={ROW}>
          <input
            id={`${id}-${option.slug}`}
            type="radio"
            name={name}
            value={option.slug}
            checked={value === option.slug}
            onChange={() => onChange(option.slug)}
            className={INPUT}
          />
          <span className="text-[16px] leading-[1.4]">{option.label}</span>
        </label>
      ))}
    </Group>
  );
}

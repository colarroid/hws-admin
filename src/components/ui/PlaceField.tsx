"use client";

import { useEffect, useId, useState } from "react";

type Match = { name: string; note: string; value: string };

/**
 * "Where you are based", with suggestions from the place table.
 *
 * Why suggestions rather than free text: this string is not decoration. When
 * a woman searches, her answer is substring-matched against the organisation's
 * place, and under "My area" or "Nearby areas" a listing that does not match
 * is dropped from her results entirely. A typo here does not look like a typo
 * to anyone. It quietly hides the organisation from the women closest to it.
 *
 * Why not a fixed list: the place table is seeded as "a starting set, not a
 * complete gazetteer". An organisation in a village that has not been seeded
 * yet still has to be able to finish onboarding, so anything typed is kept.
 * Suggestions are the strong default, not a gate.
 *
 * Picking a suggestion stores the canonical value, town and council area
 * both, which is what makes the council-area level work on her side.
 */
export function PlaceField({
  label,
  name,
  defaultValue = "",
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  placeholder?: string;
}) {
  const id = useId();
  const listId = `${id}-list`;
  const hintId = `${id}-hint`;

  const [value, setValue] = useState(defaultValue);
  const [matches, setMatches] = useState<Match[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  // Set when the current value came from the list, so the hint can say the
  // difference between "we know this place" and "we will keep what you typed".
  const [canonical, setCanonical] = useState(Boolean(defaultValue));
  const [searched, setSearched] = useState(false);

  const query = value.trim();
  const longEnough = query.length >= 2;

  useEffect(() => {
    if (!longEnough || canonical) return;

    let live = true;
    // After a typing pause rather than per keystroke, matching the woman-side
    // form and keeping this to one request per place rather than one per key.
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/places?q=${encodeURIComponent(query)}`,
        );
        if (!response.ok || !live) return;
        const found: Match[] = await response.json();
        if (!live) return;
        setMatches(found);
        setSearched(true);
        setOpen(found.length > 0);
        setActive(-1);
      } catch {
        // Offline or the route is down. Suggestions are an aid, not a gate,
        // so the field keeps working as a plain text input.
      }
    }, 250);

    return () => {
      live = false;
      clearTimeout(timer);
    };
  }, [query, longEnough, canonical]);

  const visible = open && !canonical ? matches : [];

  function choose(match: Match) {
    setValue(match.value);
    setCanonical(true);
    setOpen(false);
    setActive(-1);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!visible.length) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((n) => (n + 1) % visible.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((n) => (n <= 0 ? visible.length - 1 : n - 1));
    } else if (event.key === "Enter" && active >= 0) {
      // Only swallowed when a suggestion is highlighted, so Enter still
      // submits the form the rest of the time.
      event.preventDefault();
      choose(visible[active]);
    } else if (event.key === "Escape") {
      setOpen(false);
      setActive(-1);
    }
  }

  const unrecognised = searched && longEnough && !canonical && matches.length === 0;

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-[15px] font-semibold">
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          name={name}
          value={value}
          role="combobox"
          aria-expanded={visible.length > 0}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={
            active >= 0 ? `${listId}-${active}` : undefined
          }
          aria-describedby={unrecognised ? hintId : undefined}
          autoComplete="off"
          placeholder={placeholder}
          onChange={(e) => {
            setValue(e.target.value);
            // Typing again means the canonical value no longer describes what
            // is in the box, so suggestions come back.
            setCanonical(false);
          }}
          onKeyDown={onKeyDown}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          className="w-full rounded-control shadow-hairline bg-surface p-4 text-[17px] text-ink min-h-[44px]"
        />

        {visible.length > 0 ? (
          <ul
            id={listId}
            role="listbox"
            className="absolute left-0 right-0 top-full z-10 m-0 mt-1 flex list-none flex-col divide-y divide-hairline-soft rounded-control bg-surface p-0 shadow-card"
          >
            {visible.map((match, index) => (
              <li key={`${match.name}-${match.note}`}>
                <button
                  id={`${listId}-${index}`}
                  type="button"
                  role="option"
                  aria-selected={index === active}
                  // onMouseDown, because blur would close the list first.
                  onMouseDown={(e) => {
                    e.preventDefault();
                    choose(match);
                  }}
                  className={`flex min-h-[44px] w-full cursor-pointer items-center gap-2 border-0 px-4 py-3 text-left text-[16px] text-ink ${
                    index === active ? "bg-gold-200" : "bg-surface"
                  }`}
                >
                  <strong className="font-semibold">{match.name}</strong>
                  <span className="text-ink-60">· {match.note}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {/* Only when there is something to say. A standing instruction sat
          under one half of a two-column row and unbalanced it, and the
          suggestions teach the interaction better than a sentence about them
          does: they appear as she types. */}
      {unrecognised ? (
        <span id={hintId} className="text-[14px] leading-[1.5] text-ink-60">
          We don&apos;t know that place yet, so we&apos;ll keep what you typed.
        </span>
      ) : null}
    </div>
  );
}

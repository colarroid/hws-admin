/**
 * The header menu glyphs.
 *
 * The open icon is the supplied nav.svg. Both are filled rather than stroked
 * and share its viewBox and line weight, so the button does not change
 * character when it toggles. `fill-current` lets the button's own colour
 * drive them, which keeps the hover and focus states working.
 */

export function MenuIcon({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg
      className={`${className} fill-current`}
      viewBox="0 -960 960 960"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M143.08-379.43v-43.85h673.84v43.85H143.08Zm0-201.15v-43.85h673.84v43.85H143.08Z" />
    </svg>
  );
}

export function CloseIcon({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg
      className={`${className} fill-current`}
      viewBox="0 -960 960 960"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M256-227.69 227.69-256l224-224-224-224L256-732.31l224 224 224-224L732.31-704l-224 224 224 224L704-227.69l-224-224-224 224Z" />
    </svg>
  );
}

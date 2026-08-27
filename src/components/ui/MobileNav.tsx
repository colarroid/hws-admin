"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { MenuIcon, CloseIcon } from "@/components/ui/NavIcons";

/**
 * The header navigation below the desktop breakpoint.
 *
 * A disclosure rather than an overlay: the panel pushes the page down instead
 * of covering it, so nothing traps a screen reader behind it and there is no
 * scroll lock to get wrong. On the hardware this is built for, a panel that
 * appears is more reliable than one that animates.
 *
 * It closes on Escape, on any navigation, and returns focus to the button,
 * so a keyboard user is never left somewhere they cannot see.
 */
export function MobileNav({
  label,
  children,
}: {
  /** Names the navigation for anyone who cannot see the icon. */
  label: string;
  children: React.ReactNode;
}) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  // The panel remembers which page it was opened on, so navigating anywhere
  // closes it without an effect watching the route. Leaving it open over the
  // new page is disorienting, and on a phone it hides what she just asked for.
  const [openedOn, setOpenedOn] = useState<string | null>(null);
  const open = openedOn === pathname;

  const close = () => setOpenedOn(null);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      close();
      buttonRef.current?.focus();
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpenedOn(open ? null : pathname)}
        aria-expanded={open}
        aria-controls="mobile-nav"
        aria-label={open ? `Close ${label}` : `Open ${label}`}
        className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-control shadow-hairline bg-surface text-ink transition-[color,background-color,box-shadow] duration-150 ease-out hover:shadow-hairline-gold lg:hidden"
      >
        {open ? <CloseIcon /> : <MenuIcon />}
      </button>

      {/*
        Rendered only when open rather than hidden with CSS, so the links are
        not in the tab order while the panel is shut.
      */}
      {open ? (
        /*
          A sheet that floats clear of the header rather than a strip welded
          to its underside. Inset on both sides so the page shows past it, its
          own radius and shadow so it reads as a layer above rather than more
          header, and white against the cream ground so the two are not the
          same surface at different heights.
        */
        <nav
          id="mobile-nav"
          aria-label={label}
          className="panel-in absolute left-0 right-0 top-full z-30 px-4 pt-2 lg:hidden"
        >
          <div className="rounded-card bg-surface p-2 shadow-panel">{children}</div>
        </nav>
      ) : null}
    </>
  );
}

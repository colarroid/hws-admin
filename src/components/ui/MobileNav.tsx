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
        className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-control border border-ring bg-surface text-ink transition-colors duration-150 ease-out hover:border-gold-500 lg:hidden"
      >
        {open ? <CloseIcon /> : <MenuIcon />}
      </button>

      {/*
        Rendered only when open rather than hidden with CSS, so the links are
        not in the tab order while the panel is shut.
      */}
      {open ? (
        <nav
          id="mobile-nav"
          aria-label={label}
          className="absolute left-0 right-0 top-full flex flex-col gap-2 border-b border-hairline bg-ground px-5 pb-5 pt-1 shadow-card lg:hidden"
        >
          {children}
        </nav>
      ) : null}
    </>
  );
}

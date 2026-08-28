"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BadgeCheck,
  Building2,
  LogOut,
  Rows3,
  Tags,
} from "lucide-react";
import { signOut } from "@/app/actions";

/**
 * The admin's four places, written once.
 *
 * The rail and the phone panel show the same destinations, so they render
 * from one list. What changes between them is the ground they sit on: the
 * rail is near-black, the panel is the white sheet every other menu uses.
 */
const ITEMS = [
  { href: "/queue", label: "Listings", icon: Rows3 },
  { href: "/organisations", label: "Organisations", icon: BadgeCheck },
  { href: "/taxonomy/zones", label: "Access Zones", icon: Building2 },
  { href: "/taxonomy/situations", label: "Situations", icon: Tags },
] as const;

export function AdminNavList({ variant }: { variant: "rail" | "panel" }) {
  const pathname = usePathname();
  const rail = variant === "rail";

  const isActive = (href: string) => pathname.startsWith(href);

  const base =
    "inline-flex min-h-[44px] w-full items-center gap-3 rounded-control " +
    "px-3 py-[10px] text-[15px] no-underline " +
    "transition-[color,background-color] duration-150 ease-out";

  // On the dark rail the whole scale inverts: white at full strength is the
  // active state and everything else steps down from it, which is the same
  // shape as the light version rather than a different idea.
  const tone = (active: boolean) =>
    rail
      ? active
        ? "bg-white/12 font-semibold text-white"
        : "font-medium text-white/70 hover:bg-white/8 hover:text-white"
      : active
        ? "bg-gold-200 font-semibold text-ink"
        : "font-medium text-ink-70 hover:bg-gold-200/60 hover:text-ink";

  return (
    <div className={rail ? "flex flex-1 flex-col" : "flex flex-col"}>
      <nav aria-label="Admin" className="flex flex-col gap-1">
        {ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={[base, tone(active)].join(" ")}
            >
              <Icon
                size={18}
                strokeWidth={2}
                aria-hidden="true"
                className={
                  rail
                    ? active
                      ? "text-white"
                      : "text-white/60"
                    : active
                      ? "text-gold-700"
                      : "text-ink-60"
                }
              />
              <span className="flex-1">{label}</span>
            </Link>
          );
        })}
      </nav>

      <form
        action={signOut}
        className={
          rail
            ? "mt-auto border-t border-white/12 pt-3"
            : "mt-2 border-t border-hairline-soft pt-2"
        }
      >
        <button
          type="submit"
          className={[
            base,
            "cursor-pointer border-0 bg-transparent text-left",
            rail
              ? "font-medium text-white/70 hover:bg-white/8 hover:text-white"
              : "font-medium text-ink-70 hover:bg-gold-200/60 hover:text-ink",
          ].join(" ")}
        >
          <LogOut
            size={18}
            strokeWidth={2}
            aria-hidden="true"
            className={rail ? "text-white/60" : "text-ink-60"}
          />
          <span>Log out</span>
        </button>
      </form>
    </div>
  );
}

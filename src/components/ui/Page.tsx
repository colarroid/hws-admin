import type { ReactNode } from "react";

type PageProps = {
  /** Content max-width in px. The handoff fixes one per screen. */
  width: number;
  /** Top padding in px. Auth screens use 80, onboarding 56, forgot 72. */
  top?: number;
  gap?: number;
  children: ReactNode;
};

/**
 * The centred single column every screen sits in. On desktop it caps at the
 * given width; on mobile it simply narrows, since there is no separate
 * tablet design.
 */
export function Page({ width, top = 80, gap = 22, children }: PageProps) {
  return (
    <div
      className="mx-auto flex w-full flex-col px-5 pb-24 sm:px-10"
      style={{ maxWidth: width, paddingTop: top, gap }}
    >
      {children}
    </div>
  );
}

import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";

type Variant = "primary" | "secondary" | "text" | "destructive";

const VARIANTS: Record<Variant, string> = {
  // Ink fill, white text, 17px weight 700, 17px padding, radius 10px.
  primary: "bg-ink text-white border-0 font-bold",
  // White fill, ring border. Used for Save, Mark applied, Keep editing.
  secondary: "bg-surface text-ink border border-ring font-bold",
  // Gold 700, never gold 500: gold 500 fails AA at these sizes on cream.
  text: "bg-transparent text-gold-700 border-0 font-bold",
  destructive: "bg-surface text-red-700 border-[1.5px] border-red-700 font-bold",
};

const SIZES = {
  // The full-width block button that ends most screens.
  block: "w-full text-[17px] px-4 py-[17px] rounded-control",
  // Inline actions: Edit, Preview, Learn more.
  inline: "text-[15px] px-4 py-3 rounded-control",
  // Header pills and chips.
  pill: "text-[15px] px-[18px] py-[10px] rounded-full",
  // Text buttons sit inline and carry their own hit area via min-height.
  bare: "text-[15px] px-1 py-1 rounded-[4px]",
} as const;

type Common = {
  variant?: Variant;
  size?: keyof typeof SIZES;
};

/** 44px minimum target, applied to every variant including text buttons. */
const BASE =
  "inline-flex items-center justify-center gap-2 min-h-[44px] cursor-pointer " +
  "disabled:opacity-40 disabled:cursor-not-allowed";

export function Button({
  variant = "primary",
  size = "block",
  className = "",
  ...props
}: Common & ComponentPropsWithoutRef<"button">) {
  return (
    <button
      className={`${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    />
  );
}

export function ButtonLink({
  variant = "primary",
  size = "block",
  className = "",
  ...props
}: Common & ComponentPropsWithoutRef<typeof Link>) {
  return (
    <Link
      className={`${BASE} no-underline ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    />
  );
}

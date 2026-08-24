"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/Button";

export function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Just a moment…" : children}
    </Button>
  );
}

/**
 * Submission errors sit above the form and take focus, rather than flashing a
 * border. tabIndex plus role="alert" means a screen reader hears it and a
 * keyboard user lands on it.
 */
export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      tabIndex={-1}
      ref={(node) => node?.focus()}
      className="rounded-control border border-red-200 bg-red-50 px-4 py-3 text-[15px] leading-[1.5] text-red-700"
    >
      {message}
    </div>
  );
}

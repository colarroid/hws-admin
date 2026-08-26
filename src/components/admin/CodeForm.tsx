"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/Form";
import { verifyCode } from "@/app/actions";

const MIN_CODE = 6;
const MAX_CODE = 8;
const SETTLE_MS = 700;

/** Same field as the woman-facing one, and for the same reasons. */
export function CodeForm({ email }: { email: string }) {
  const [error, setError] = useState<string | undefined>();
  const [code, setCode] = useState("");
  const [pending, startVerify] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const settleRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function submit(formData: FormData) {
    startVerify(async () => {
      const result = await verifyCode(null, formData);
      if (result?.error) {
        setError(result.error);
        setCode("");
      }
    });
  }

  function onChange(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, MAX_CODE);
    setCode(digits);
    clearTimeout(settleRef.current);
    if (digits.length >= MIN_CODE && !pending) {
      settleRef.current = window.setTimeout(
        () => formRef.current?.requestSubmit(),
        SETTLE_MS,
      );
    }
  }

  return (
    <form ref={formRef} action={submit} className="flex flex-col gap-[22px]">
      <FormError message={error} />
      <input type="hidden" name="email" value={email} />
      <div className="flex flex-col gap-2">
        <label htmlFor="code" className="text-[15px] font-semibold">
          Your sign-in code
        </label>
        <input
          id="code"
          ref={inputRef}
          name="code"
          value={code}
          onChange={(e) => onChange(e.target.value)}
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={MAX_CODE}
          placeholder="000000"
          className="rounded-control border-[1.5px] border-ink bg-surface p-[18px] text-center text-[28px] font-semibold tracking-[0.4em] text-ink tabular-nums"
        />
      </div>
      <Button type="submit" disabled={pending || code.length < MIN_CODE}>
        {pending ? "Checking…" : "Sign in"}
      </Button>
    </form>
  );
}

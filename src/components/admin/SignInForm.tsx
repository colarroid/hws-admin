"use client";

import { useActionState } from "react";
import { Field } from "@/components/ui/Field";
import { FormError, SubmitButton } from "@/components/ui/Form";
import { sendCode, type FormState } from "@/app/actions";

export function SignInForm() {
  const [state, formAction] = useActionState<FormState, FormData>(sendCode, null);

  return (
    <form action={formAction} className="flex flex-col gap-[22px]">
      <FormError message={state?.error} />
      <Field
        label="Work email address"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="you@hws.org"
        required
      />
      <SubmitButton>Send me a code</SubmitButton>
    </form>
  );
}

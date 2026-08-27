"use client";

import { useActionState } from "react";
import { Field, PasswordField } from "@/components/ui/Field";
import { FormError, SubmitButton } from "@/components/ui/Form";
import { signIn, type FormState } from "@/app/actions";

export function SignInForm() {
  const [state, formAction] = useActionState<FormState, FormData>(signIn, null);

  return (
    <form action={formAction} className="flex flex-col gap-[22px]">
      <FormError message={state?.error} />
      <Field
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="you@hws.org"
        required
      />
      <PasswordField
        label="Password"
        name="password"
        autoComplete="current-password"
        required
      />
      <SubmitButton>Sign in</SubmitButton>
    </form>
  );
}

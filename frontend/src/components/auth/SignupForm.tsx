"use client";

import { useActionState } from "react";

import { signUp } from "@/lib/actions/auth";
import { ButtonLink } from "@/components/ui/Button";
import { FormError, Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { SubmitButton } from "@/components/ui/SubmitButton";

export function SignupForm() {
  const [state, action] = useActionState(signUp, {});

  return (
    <form action={action} className="mt-8 space-y-5">
      <FormError>{state?.error}</FormError>
      <Input
        label="Username"
        name="username"
        type="text"
        autoComplete="username"
        defaultValue={state?.values?.username}
        placeholder="yourname"
        minLength={3}
        required
      />
      <Input
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        defaultValue={state?.values?.email}
        placeholder="you@example.com"
        required
      />
      <PasswordInput
        label="Password"
        name="password"
        autoComplete="new-password"
        placeholder="Enter your password"
        minLength={8}
        required
      />
      <PasswordInput
        label="Confirm password"
        name="confirmPassword"
        autoComplete="new-password"
        placeholder="Re-enter your password"
        minLength={8}
        required
      />
      <SubmitButton fullWidth pendingLabel="Creating account...">
        Create account
      </SubmitButton>
      <p className="text-center text-sm text-ink-500">
        Already have an account?{" "}
        <ButtonLink
          href="/login"
          variant="ghost"
          size="sm"
          className="px-1.5 text-brand-700 underline decoration-brand-300 underline-offset-4 hover:bg-brand-50 hover:text-brand-800"
        >
          Sign in
        </ButtonLink>
      </p>
    </form>
  );
}
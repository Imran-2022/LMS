"use client";

import { useActionState } from "react";

import { signIn } from "@/lib/actions/auth";
import { ButtonLink } from "@/components/ui/Button";
import { FormError, Input } from "@/components/ui/Input";
import { SubmitButton } from "@/components/ui/SubmitButton";

export function AuthForm({ next }: { next?: string }) {
  const [state, action] = useActionState(signIn, {});

  return (
    <form action={action} className="mt-8 space-y-5">
      <FormError>{state?.error}</FormError>
      <Input
        label="Email or username"
        name="identifier"
        type="text"
        autoComplete="username"
        defaultValue={state?.values?.identifier}
        placeholder="you@example.com"
        required
      />
      <Input
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
      />
      {next ? <input type="hidden" name="next" value={next} /> : null}
      <SubmitButton fullWidth pendingLabel="Signing in...">
        Sign in
      </SubmitButton>
      <p className="text-center text-sm text-ink-500">
        New to CPS Academy?{" "}
        <ButtonLink href="/signup" variant="ghost" size="sm" className="px-1.5 text-brand-700">
          Create an account
        </ButtonLink>
      </p>
    </form>
  );
}
"use client";

import { useActionState, useEffect, useState } from "react";
import { ChevronDown, X } from "lucide-react";

import { signIn } from "@/lib/actions/auth";
import { Button, ButtonLink } from "@/components/ui/Button";
import { FormError, Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { SubmitButton } from "@/components/ui/SubmitButton";

const DEMO_ACCOUNTS = [
  { label: "Student Demo", identifier: "student@gmail.com" },
  { label: "Instructor Demo", identifier: "instructor@gmail.com" },
  { label: "Content Manager", identifier: "contentmanager@gmail.com" },
  { label: "Admin Demo", identifier: "admin@gmail.com" },
];

export function AuthForm({ next }: { next?: string }) {
  const [state, action] = useActionState(signIn, {});
  const [identifier, setIdentifier] = useState(state?.values?.identifier ?? "");
  const [password, setPassword] = useState("");
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);
  const [selectedDemo, setSelectedDemo] = useState<string | null>(null);

  useEffect(() => {
    if (state?.values?.identifier !== undefined) {
      setIdentifier(state.values.identifier);
    }
  }, [state?.values?.identifier]);

  function selectDemoAccount(account: (typeof DEMO_ACCOUNTS)[number]) {
    setIdentifier(account.identifier);
    setPassword(account.identifier);
    setSelectedDemo(account.identifier);
    setDemoMenuOpen(false);
  }

  function clearDemoAccount() {
    setIdentifier("");
    setPassword("");
    setSelectedDemo(null);
  }

  return (
    <>
      <div className="relative flex items-center justify-between gap-3">
        <h1 className="mt-3 text-3xl font-black tracking-tight text-ink-950">
          Sign in
        </h1>
        <div className="mt-3 flex shrink-0">
          <Button
            type="button"
            variant="danger"
            size="sm"
            className="max-w-[230px] truncate rounded-r-none"
            aria-expanded={demoMenuOpen}
            aria-haspopup="menu"
            onClick={() => setDemoMenuOpen((open) => !open)}
          >
            {selectedDemo
              ? DEMO_ACCOUNTS.find((account) => account.identifier === selectedDemo)?.label
              : "Use Demo Account"}
            <ChevronDown
              size={16}
              aria-hidden="true"
              className={demoMenuOpen ? "rotate-180 transition-transform" : "transition-transform"}
            />
          </Button>
          {selectedDemo ? (
            <button
              type="button"
              className="grid h-9 w-9 cursor-pointer place-items-center rounded-r border border-l-0 border-ink-200 bg-white text-ink-500 transition-colors hover:bg-danger-50 hover:text-danger-600"
              aria-label="Clear demo account"
              title="Clear demo account"
              onClick={clearDemoAccount}
            >
              <X size={16} aria-hidden="true" />
            </button>
          ) : null}
        </div>
        {demoMenuOpen ? (
          <div
            role="menu"
            aria-label="Demo accounts"
            className="absolute right-0 top-full z-10 mt-2 w-50 rounded border border-ink-200 bg-white p-1.5 shadow-lg"
          >
            {DEMO_ACCOUNTS.map((account) => (
              <button
                key={account.identifier}
                type="button"
                role="menuitem"
                className="block w-full cursor-pointer rounded px-3 py-2.5 text-left text-sm font-medium text-ink-700 transition-colors hover:bg-brand-50 hover:text-brand-700"
                onClick={() => selectDemoAccount(account)}
              >
                {account.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>
      <p className="mt-3 text-sm leading-6 text-ink-600">
        Continue your learning journey from where you left off.
      </p>
      <form action={action} className="mt-8 space-y-5">
      <FormError>{state?.error}</FormError>
      <Input
        label="Email or username"
        name="identifier"
        type="text"
        autoComplete="username"
        value={identifier}
        onChange={(event) => setIdentifier(event.target.value)}
        placeholder="you@example.com"
        autoFocus
        required
      />
      <PasswordInput
        label="Password"
        name="password"
        autoComplete="current-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        placeholder="Enter your password"
        required
      />
      {next ? <input type="hidden" name="next" value={next} /> : null}
      <SubmitButton fullWidth pendingLabel="Signing in...">
        Sign in
      </SubmitButton>
      <p className="text-center text-sm text-ink-500">
        New to CPS Academy?{" "}
        <ButtonLink
          href="/signup"
          variant="ghost"
          size="sm"
          className="px-1.5 text-brand-700 underline decoration-brand-300 underline-offset-4 hover:bg-brand-50 hover:text-brand-800"
        >
          Create an account
        </ButtonLink>
      </p>
      </form>
    </>
  );
}

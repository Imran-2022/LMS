"use client";

/**
 * SubmitButton — a submit button that knows when its own form is in flight.
 *
 * `useFormStatus` reads the pending state of the nearest parent `<form>`, which
 * means the button disables and relabels itself during a Server Action without the
 * page needing any state of its own. That matters here because most forms in this
 * app live in Server Components; the client boundary is one small button, not the
 * whole screen.
 *
 * Disabling on submit is not cosmetic: without it, an impatient double-click on
 * "Enroll" or "Submit quiz" fires the action twice.
 */
import { useFormStatus } from "react-dom";
import type { ComponentProps } from "react";

import { Button } from "./Button";

export function SubmitButton({
  children,
  pendingLabel,
  ...rest
}: { pendingLabel?: string } & ComponentProps<typeof Button>) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending || rest.disabled} {...rest}>
      {pending ? (
        <>
          <Spinner />
          {pendingLabel ?? "Working…"}
        </>
      ) : (
        children
      )}
    </Button>
  );
}

export function Spinner({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path
        d="M22 12a10 10 0 0 0-10-10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

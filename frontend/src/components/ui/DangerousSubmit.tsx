"use client";

/**
 * DangerousSubmit — a submit button that asks first.
 *
 * Delete actions in this app are real deletes (courses, lessons, users), so each one
 * gets a confirmation step. This deliberately uses the native `confirm()` rather than
 * a custom modal: a modal would need portal state, focus trapping and an escape
 * handler to be as safe as the browser's own dialog, and getting any of those subtly
 * wrong on a *delete* confirmation is worse than a plain-looking prompt.
 *
 * The guard is UX, not security — the Strapi policy still checks ownership on the
 * request, so cancelling here and deleting via curl are two different questions.
 */
import { useFormStatus } from "react-dom";
import type { ComponentProps, MouseEvent } from "react";

import { Button } from "./Button";
import { Spinner } from "./SubmitButton";

export function DangerousSubmit({
  children,
  confirm: message,
  pendingLabel,
  ...rest
}: { confirm: string; pendingLabel?: string } & ComponentProps<typeof Button>) {
  const { pending } = useFormStatus();

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    if (!window.confirm(message)) event.preventDefault();
  }

  return (
    <Button
      type="submit"
      variant="danger"
      onClick={handleClick}
      disabled={pending || rest.disabled}
      {...rest}
    >
      {pending ? (
        <>
          <Spinner />
          {pendingLabel ?? "Deleting…"}
        </>
      ) : (
        children
      )}
    </Button>
  );
}

"use client";

/**
 * DangerousSubmit — a submit button that asks first.
 *
 * Delete actions in this app are real deletes, so each one gets a confirmation step.
 *
 * The guard is UX, not security — the Strapi policy still checks ownership on the
 * request, so cancelling here and deleting via curl are two different questions.
 */
import { useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import type { ComponentProps } from "react";

import { Button } from "./Button";
import { ConfirmDialog } from "./ConfirmDialog";
import { Spinner } from "./SubmitButton";

export function DangerousSubmit({
  children,
  confirm: message,
  pendingLabel,
  ...rest
}: { confirm: string; pendingLabel?: string } & ComponentProps<typeof Button>) {
  const { pending } = useFormStatus();
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement | null>(null);

  return (
    <>
      <Button
        type="submit"
        variant="danger"
        onClick={(event) => {
          event.preventDefault();
          formRef.current = event.currentTarget.form;
          setOpen(true);
        }}
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
      <ConfirmDialog
        open={open}
        options={{ title: "Confirm deletion", body: message, confirmLabel: "Delete", tone: "danger" }}
        onCancel={() => setOpen(false)}
        onConfirm={() => {
          setOpen(false);
          formRef.current?.requestSubmit();
        }}
      />
    </>
  );
}

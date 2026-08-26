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
import { AlertTriangle } from "lucide-react";
import type { ComponentProps } from "react";

import { Button } from "./Button";
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
      {open ? (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-ink-950/45 p-4 backdrop-blur-sm" role="presentation">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
          className="w-full max-w-md rounded border border-ink-200 bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.2)]"
        >
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-danger-50 text-danger-600">
              <AlertTriangle size={20} />
            </span>
            <div>
              <h2 id="delete-dialog-title" className="text-lg font-bold text-ink-900">
                Confirm deletion
              </h2>
              <p className="mt-2 text-sm leading-6 text-ink-600">{message}</p>
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <Button type="button" variant="secondary" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={() => {
                setOpen(false);
                formRef.current?.requestSubmit();
              }}
            >
              Delete
            </Button>
          </div>
        </div>
        </div>
      ) : null}
    </>
  );
}

"use client";

/**
 * The footer every overlay form shares: inline error on the left, Cancel and Submit on
 * the right, and — where it applies — the destructive action for the record being edited.
 *
 * Why the error lives here rather than at the top of the form body: the body scrolls. A
 * red box above field one is off-screen when the submit button that produced it is at the
 * bottom of a long quiz, and the user sees nothing happen. In the footer it is always
 * next to the button they just pressed. `role="alert"` gets it announced.
 *
 * `pending` is passed in rather than read from `useFormStatus`, because the caller has it
 * already: `useActionState` returns pending as its third value, and that is true for the
 * whole action including the revalidation, where `useFormStatus` is scoped to the form
 * element and has caught people out when the button moved.
 */
import { AlertCircle, Trash2 } from "lucide-react";
import { useTransition, type ReactNode } from "react";

import { Button } from "./Button";
import { useConfirm, type ConfirmOptions } from "./ConfirmDialog";
import { Spinner } from "./SubmitButton";

export type DestructiveAction = {
  label: string;
  /** Shown before anything happens. Spell out the consequence, not "Are you sure?". */
  confirm: ConfirmOptions;
  run: () => Promise<void> | void;
};

export function DialogFormActions({
  error,
  pending,
  submitLabel = "Save",
  pendingLabel = "Saving…",
  cancelLabel = "Cancel",
  onCancel,
  destructive,
  extra,
}: {
  error?: string;
  pending: boolean;
  submitLabel?: string;
  pendingLabel?: string;
  cancelLabel?: string;
  onCancel: () => void;
  destructive?: DestructiveAction;
  /** Anything else that belongs on the left, e.g. a "last saved" note. */
  extra?: ReactNode;
}) {
  return (
    <>
      <div className="mr-auto flex min-w-0 flex-1 items-center gap-3">
        {destructive ? (
          <DestructiveButton action={destructive} disabled={pending} />
        ) : null}
        {error ? (
          <p
            role="alert"
            className="flex min-w-0 items-start gap-1.5 text-[12.5px] font-semibold text-danger-600"
          >
            <AlertCircle className="mt-px h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="min-w-0">{error}</span>
          </p>
        ) : (
          extra
        )}
      </div>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={onCancel}
        disabled={pending}
      >
        {cancelLabel}
      </Button>
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? (
          <>
            <Spinner />
            {pendingLabel}
          </>
        ) : (
          submitLabel
        )}
      </Button>
    </>
  );
}

/**
 * `type="button"` is load-bearing: this sits inside the form element, and the default
 * `submit` type would make "Delete" save the record instead.
 */
function DestructiveButton({
  action,
  disabled,
}: {
  action: DestructiveAction;
  disabled: boolean;
}) {
  const confirm = useConfirm();
  const [running, startTransition] = useTransition();

  async function onClick() {
    if (!(await confirm({ tone: "danger", ...action.confirm }))) return;
    // A transition, so the row disappearing and the list revalidating are one update
    // rather than a flash of the deleted record still on screen.
    startTransition(async () => {
      await action.run();
    });
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onClick}
      disabled={disabled || running}
      className="text-danger-600 hover:bg-danger-50 hover:text-danger-700"
    >
      {running ? <Spinner /> : <Trash2 className="h-4 w-4" aria-hidden="true" />}
      {action.label}
    </Button>
  );
}

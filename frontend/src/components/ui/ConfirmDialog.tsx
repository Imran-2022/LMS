"use client";

/**
 * Confirmation — one component, two ways to reach it.
 *
 * `<ConfirmDialog>` is the declarative form, for a confirm that belongs to a specific
 * piece of markup — `DangerousSubmit` uses it to guard a form submit.
 *
 * `useConfirm()` is the imperative form: `if (!(await confirm({...}))) return;`. Row
 * action menus need this one, because the thing being confirmed is chosen at click time
 * and rendering a dialog per row would mean N dialogs mounted per table.
 *
 * Both funnel into the same `Dialog`, so a confirm raised from inside an edit drawer
 * stacks above it and Escape closes only the confirm.
 */
import { AlertTriangle, HelpCircle } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

import { Button } from "./Button";
import { Dialog } from "./Dialog";

export type ConfirmTone = "danger" | "default";

export type ConfirmOptions = {
  title: string;
  /** The consequence, spelled out. "Are you sure?" tells the user nothing. */
  body?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: ConfirmTone;
};

function ToneIcon({ tone }: { tone: ConfirmTone }) {
  if (tone === "danger") {
    return (
      <span className="grid h-10 w-10 place-items-center rounded-full bg-danger-50 text-danger-600">
        <AlertTriangle className="h-5 w-5" />
      </span>
    );
  }
  return (
    <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-50 text-brand-600">
      <HelpCircle className="h-5 w-5" />
    </span>
  );
}

export function ConfirmDialog({
  open,
  options,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  options: ConfirmOptions;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const {
    title,
    body,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    tone = "danger",
  } = options;

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      title={title}
      size="sm"
      icon={<ToneIcon tone={tone} />}
      footer={
        <>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onCancel}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={tone === "danger" ? "danger" : "primary"}
            size="sm"
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="text-[13.5px] leading-relaxed text-ink-600">
        {body ?? "This cannot be undone."}
      </div>
    </Dialog>
  );
}

/* --------------------------------------------------------------- imperative API */

type Request = { options: ConfirmOptions; resolve: (value: boolean) => void };

const ConfirmContext = createContext<
  ((options: ConfirmOptions) => Promise<boolean>) | null
>(null);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [request, setRequest] = useState<Request | null>(null);

  const confirm = useCallback(
    (options: ConfirmOptions) =>
      new Promise<boolean>((resolve) => setRequest({ options, resolve })),
    [],
  );

  function settle(value: boolean) {
    request?.resolve(value);
    setRequest(null);
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {request ? (
        <ConfirmDialog
          open
          options={request.options}
          onCancel={() => settle(false)}
          onConfirm={() => settle(true)}
        />
      ) : null}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const confirm = useContext(ConfirmContext);
  if (!confirm) {
    throw new Error("useConfirm must be used inside <ConfirmProvider>.");
  }
  return confirm;
}

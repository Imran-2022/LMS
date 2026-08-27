"use client";

import { useEffect, useState, type ReactNode } from "react";

import { useConfirm } from "./ConfirmDialog";
import { Dialog, type DialogPlacement, type DialogSize } from "./Dialog";

export function FormDialog<T>({
  open,
  onClose,
  title,
  description,
  placement = "right",
  size = "lg",
  recordId = null,
  load,
  render,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: ReactNode;
  placement?: DialogPlacement;
  size?: DialogSize;
  recordId?: number | null;
  load?: (id: number) => Promise<T | null>;
  render: (record: T | undefined) => ReactNode;
}) {
  const confirm = useConfirm();
  const [record, setRecord] = useState<T | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!open || !load || recordId === null) {
      setRecord(undefined);
      setError(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    load(recordId)
      .then((value) => {
        if (cancelled) return;
        if (value === null) setError("That record could not be opened.");
        else setRecord(value);
      })
      .catch(() => {
        if (!cancelled) setError("Could not load this record. Please retry.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, load, recordId]);

  async function close() {
    if (dirty && !(await confirm({
      title: "Discard unsaved changes?",
      body: "Your changes have not been saved and will be lost.",
      confirmLabel: "Discard changes",
      tone: "danger",
    }))) return;
    setDirty(false);
    onClose();
  }

  const body = loading ? (
    <div className="space-y-4" aria-label="Loading form">
      <div className="h-10 animate-pulse rounded bg-ink-100" />
      <div className="h-24 animate-pulse rounded bg-ink-100" />
      <div className="h-10 animate-pulse rounded bg-ink-100" />
    </div>
  ) : error ? (
    <div className="space-y-4 rounded border border-danger-200 bg-danger-50 p-4 text-sm text-danger-700">
      <p>{error}</p>
      <button type="button" className="font-semibold underline" onClick={() => setError(null)}>
        Retry
      </button>
    </div>
  ) : (
    <div onChange={() => setDirty(true)}>{render(record)}</div>
  );

  return (
    <Dialog
      open={open}
      onClose={close}
      title={title}
      description={description}
      placement={placement}
      size={size}
      dismissable={!loading}
    >
      {body}
    </Dialog>
  );
}

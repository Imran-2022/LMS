"use client";

/**
 * Toast — transient confirmation, replacing the flash strip.
 *
 * The app used to report every outcome by redirecting with `?ok=course-updated` and
 * rendering a banner from `searchParams`. That worked, but it forced a navigation for
 * something as small as "saved", which is the reason every form used to be its own page.
 * Now an action returns its message, the form raises a toast, and the list refreshes
 * underneath — no navigation, and the user keeps their scroll position and their place
 * in the table.
 *
 * Accessibility details that matter more than the styling:
 *
 * - The live region is rendered *empty and always present*, not created on demand. A
 *   region that appears at the same moment as its content is frequently not announced
 *   at all, because the screen reader never observed it as empty first.
 * - Success and info are `aria-live="polite"` (wait for a pause); failures are
 *   `role="alert"`, which is assertive, because "couldn't save that" should interrupt.
 * - Auto-dismiss pauses on hover and on keyboard focus, so a long message is readable
 *   and the close button cannot vanish from under the pointer.
 */
import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { cx } from "@/lib/format";
import type { FlashTone } from "@/lib/flash";
import { IconButton } from "./IconButton";

export type ToastTone = FlashTone;

type Toast = { id: number; tone: ToastTone; text: string };

type ToastContextValue = {
  toast: (text: string, tone?: ToastTone) => void;
  /** `toast(message, "success")` / `toast(error, "danger")` in one call from a result. */
  toastResult: (result: {
    ok: boolean;
    message?: string;
    error?: string;
  }) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

/** How long a toast stays up. Long enough to read two lines, short enough not to nag. */
const LIFETIME = 4800;
/** Beyond three the stack becomes a wall; the oldest drops off. */
const MAX_VISIBLE = 3;

const TONES: Record<ToastTone, { box: string; icon: ReactNode }> = {
  success: {
    box: "border-success-500/25 bg-white text-ink-800 [&_svg]:text-success-600",
    icon: <CheckCircle2 className="h-4.5 w-4.5" />,
  },
  danger: {
    box: "border-danger-500/30 bg-white text-ink-800 [&_svg]:text-danger-600",
    icon: <AlertTriangle className="h-4.5 w-4.5" />,
  },
  info: {
    box: "border-brand-500/25 bg-white text-ink-800 [&_svg]:text-brand-600",
    icon: <Info className="h-4.5 w-4.5" />,
  },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const sequence = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((entry) => entry.id !== id));
  }, []);

  const toast = useCallback((text: string, tone: ToastTone = "success") => {
    if (!text) return;
    const id = ++sequence.current;
    setToasts((current) => [...current, { id, tone, text }].slice(-MAX_VISIBLE));
  }, []);

  const toastResult = useCallback(
    (result: { ok: boolean; message?: string; error?: string }) => {
      if (result.ok) toast(result.message ?? "Saved.", "success");
      else toast(result.error ?? "That didn't work. Please try again.", "danger");
    },
    [toast],
  );

  const value = useMemo(() => ({ toast, toastResult }), [toast, toastResult]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Two regions, because politeness is a property of the region, not the message. */}
      <div
        className="pointer-events-none fixed bottom-0 right-0 z-[300] flex w-full max-w-[420px] flex-col items-end gap-2.5 p-4 sm:p-6"
        aria-live="polite"
        aria-atomic="false"
      >
        {toasts
          .filter((entry) => entry.tone !== "danger")
          .map((entry) => (
            <ToastCard key={entry.id} toast={entry} onDismiss={dismiss} />
          ))}
      </div>
      <div
        className="pointer-events-none fixed bottom-0 right-0 z-[300] flex w-full max-w-[420px] flex-col items-end gap-2.5 p-4 sm:p-6"
        role="alert"
      >
        {toasts
          .filter((entry) => entry.tone === "danger")
          .map((entry) => (
            <ToastCard key={entry.id} toast={entry} onDismiss={dismiss} />
          ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastCard({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: number) => void;
}) {
  const [paused, setPaused] = useState(false);
  const tone = TONES[toast.tone];

  useEffect(() => {
    if (paused) return;
    const timer = setTimeout(() => onDismiss(toast.id), LIFETIME);
    return () => clearTimeout(timer);
  }, [paused, toast.id, onDismiss]);

  return (
    <div
      className={cx(
        "pointer-events-auto flex w-full animate-toast items-start gap-3 rounded border px-4 py-3.5 shadow-[0_18px_45px_rgba(15,23,42,0.16)] motion-reduce:animate-none",
        tone.box,
      )}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <span className="mt-px shrink-0">{tone.icon}</span>
      <p className="min-w-0 flex-1 text-[13.5px] font-medium leading-relaxed">
        {toast.text}
      </p>
      <IconButton
        label="Dismiss"
        size="sm"
        onClick={() => onDismiss(toast.id)}
        className="-mr-1.5 -mt-1"
      >
        <X className="h-4 w-4" />
      </IconButton>
    </div>
  );
}

/**
 * Raise a toast from anywhere under the provider.
 *
 * Throws rather than no-oping when the provider is missing: a silently swallowed toast
 * is a confirmation the user never sees, and that is worse than a crash in development.
 */
export function useToast(): ToastContextValue {
  const value = useContext(ToastContext);
  if (!value) {
    throw new Error("useToast must be used inside <ToastProvider>.");
  }
  return value;
}

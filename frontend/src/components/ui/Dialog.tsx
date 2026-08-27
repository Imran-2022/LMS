"use client";

/**
 * Dialog — the one overlay primitive the whole app builds on.
 *
 * There are two placements and they are the same component on purpose:
 *
 *   `center` — the shared **modal**. Confirmations, short forms, the role picker.
 *   `right`  — the shared **side popup**. Long authoring forms, where a drawer keeps
 *              the list you came from visible behind it and gives the form full height
 *              instead of a scrolling box in the middle of the screen.
 *
 * Splitting them would mean two copies of the parts that are genuinely hard: the focus
 * trap, the scroll lock, the stacking, and getting Escape to close only the topmost
 * layer. All four are here once.
 *
 * Notes on the parts that are easy to get wrong:
 *
 * - **Stacking.** A delete confirmation opens on top of an edit drawer, so a module-level
 *   stack tracks open dialogs. Escape pops the top one only, and each level renders ten
 *   z-index steps above its parent. Without the stack, one Escape closes both and the
 *   user loses the form they were halfway through.
 *
 * - **Scroll lock is refcounted.** Two nested dialogs both lock the body; a naive
 *   implementation would have the inner one restore `overflow` on close while the outer
 *   one is still open, letting the page scroll behind a modal.
 *
 * - **Focus is trapped and then restored.** Tab cycles inside the panel, and on close
 *   focus goes back to whatever opened the dialog — otherwise a keyboard user is dumped
 *   at the top of the document and has to tab all the way back to the row they were on.
 *
 * - **No `<dialog>` element.** `showModal()` gives the trap and the backdrop for free,
 *   but its top-layer rendering ignores the transform-based animations used here and its
 *   backdrop cannot be styled with Tailwind utilities. The hand-built version is more
 *   code and fewer surprises.
 */
import { X } from "lucide-react";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentProps,
  type MouseEvent as ReactMouseEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

import { cx } from "@/lib/format";
import { IconButton } from "./IconButton";

export type DialogPlacement = "center" | "right";
export type DialogSize = "sm" | "md" | "lg" | "xl";

const CENTER_SIZES: Record<DialogSize, string> = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

const DRAWER_SIZES: Record<DialogSize, string> = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-lg",
  lg: "sm:max-w-2xl",
  xl: "sm:max-w-3xl",
};

const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  'input:not([disabled]):not([type="hidden"])',
  "select:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

/* ---------------------------------------------------------------- open stack */

let sequence = 0;
const stack: number[] = [];

function pushLayer(id: number): number {
  stack.push(id);
  return stack.length;
}

function popLayer(id: number) {
  const index = stack.indexOf(id);
  if (index !== -1) stack.splice(index, 1);
}

function isTopLayer(id: number): boolean {
  return stack[stack.length - 1] === id;
}

/* ----------------------------------------------------------- body scroll lock */

let locks = 0;
let restoreOverflow = "";
let restorePaddingRight = "";

function lockScroll() {
  if (locks === 0) {
    const body = document.body;
    restoreOverflow = body.style.overflow;
    restorePaddingRight = body.style.paddingRight;
    // Compensate for the scrollbar the lock removes, or the whole page shifts sideways
    // by ~11px the moment a dialog opens.
    const gap = window.innerWidth - document.documentElement.clientWidth;
    body.style.overflow = "hidden";
    if (gap > 0) body.style.paddingRight = `${gap}px`;
  }
  locks += 1;
}

function unlockScroll() {
  locks = Math.max(0, locks - 1);
  if (locks === 0) {
    document.body.style.overflow = restoreOverflow;
    document.body.style.paddingRight = restorePaddingRight;
  }
}

/* -------------------------------------------------------------------- Dialog */

export type DialogProps = {
  open: boolean;
  /** Called for Escape, the backdrop and the close button — after any guard passes. */
  onClose: () => void;
  title: string;
  description?: ReactNode;
  children: ReactNode;
  /** Sticky action row, pinned below the scrolling body. */
  footer?: ReactNode;
  /**
   * Wrap the body *and* the footer in a `<form>` with these props.
   *
   * This exists because the panel is portalled to `document.body`. HTML form
   * association follows the DOM, not the React tree, so the usual trick of putting the
   * submit button outside the form and pointing at it with `form="course-form"` does
   * not survive the portal — the button ends up associated with nothing and clicking
   * it does exactly nothing. Wrapping here keeps the footer's submit button a real
   * descendant of the form, which is also what makes `useFormStatus` work inside it.
   */
  form?: ComponentProps<"form">;
  placement?: DialogPlacement;
  size?: DialogSize;
  /** Extra content in the header, right of the title (a status badge, a count). */
  headerAside?: ReactNode;
  /** Small icon chip left of the title. Used by the confirmation variants. */
  icon?: ReactNode;
  /**
   * Set false while something irreversible is in flight, so Escape and a stray backdrop
   * click cannot orphan a half-finished action. The close button hides too.
   */
  dismissable?: boolean;
  className?: string;
};

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  form,
  placement = "center",
  size = "md",
  headerAside,
  icon,
  dismissable = true,
  className,
}: DialogProps) {
  const headingId = useId();
  const descriptionId = useId();
  const panelRef = useRef<HTMLDivElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const returnFocusTo = useRef<HTMLElement | null>(null);
  const layerId = useRef<number | null>(null);

  const [mounted, setMounted] = useState(false);
  const [layer, setLayer] = useState(1);

  // `createPortal` needs a real `document`, which does not exist during the server
  // render. Mounting in an effect means the dialog is client-only, which is correct:
  // there is nothing to server-render for a closed overlay.
  useEffect(() => setMounted(true), []);

  /* Register in the stack, lock scrolling, and remember where focus came from. */
  useEffect(() => {
    if (!open || !mounted) return;

    const id = ++sequence;
    layerId.current = id;
    setLayer(pushLayer(id));
    lockScroll();
    returnFocusTo.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    return () => {
      popLayer(id);
      layerId.current = null;
      unlockScroll();
      // A dialog that closes because its parent unmounted has nothing sensible to
      // focus, so guard on the node still being in the document.
      const target = returnFocusTo.current;
      if (target && document.contains(target)) target.focus();
      returnFocusTo.current = null;
    };
  }, [open, mounted]);

  /* Move focus into the panel once it exists. */
  useEffect(() => {
    if (!open || !mounted) return;
    const panel = panelRef.current;
    if (!panel) return;

    // Prefer the first real control, skipping the close button — landing on "X" as the
    // first thing a screen reader announces is a poor introduction to a form.
    const nodes = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
    const preferred = nodes.find((node) => node !== closeRef.current) ?? panel;
    preferred.focus();
  }, [open, mounted]);

  /* Escape, at the document level so it works even if focus slipped out of the panel. */
  useEffect(() => {
    if (!open || !mounted) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      const id = layerId.current;
      if (id === null || !isTopLayer(id)) return;
      event.stopPropagation();
      if (dismissable) onClose();
    }

    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [open, mounted, dismissable, onClose]);

  const trapTab = useCallback((event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab") return;
    const panel = panelRef.current;
    if (!panel) return;

    const nodes = Array.from(
      panel.querySelectorAll<HTMLElement>(FOCUSABLE),
    ).filter((node) => node.offsetParent !== null || node === document.activeElement);
    if (nodes.length === 0) {
      event.preventDefault();
      return;
    }

    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    const active = document.activeElement;

    if (event.shiftKey && (active === first || active === panel)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }, []);

  if (!open || !mounted) return null;

  const drawer = placement === "right";

  function onBackdropMouseDown(event: ReactMouseEvent<HTMLDivElement>) {
    // Only a press that both starts and ends on the backdrop closes. Without the
    // target check, selecting text inside the panel and releasing over the backdrop
    // would throw the form away.
    if (event.target !== event.currentTarget) return;
    if (dismissable) onClose();
  }

  const content = (
    <>
      <div className="scroll-slim min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
        {children}
      </div>

      {footer ? (
        <footer className="flex shrink-0 flex-wrap items-center justify-end gap-3 border-t border-ink-200/70 bg-ink-50/60 px-5 py-4 sm:px-6">
          {footer}
        </footer>
      ) : null}
    </>
  );

  return createPortal(
    <div className="fixed inset-0" style={{ zIndex: 90 + layer * 10 }}>
      <div
        className="absolute inset-0 animate-fade bg-ink-950/50 backdrop-blur-[2px] motion-reduce:animate-none"
        aria-hidden="true"
      />
      <div
        className={cx(
          "absolute inset-0 flex",
          drawer ? "justify-end" : "items-center justify-center p-4 sm:p-6",
        )}
        onMouseDown={onBackdropMouseDown}
      >
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={headingId}
          aria-describedby={description ? descriptionId : undefined}
          tabIndex={-1}
          onKeyDown={trapTab}
          className={cx(
            "flex flex-col overflow-hidden bg-white shadow-[0_24px_70px_rgba(15,23,42,0.22)] outline-none",
            drawer
              ? cx(
                  "h-dvh w-full animate-drawer border-l border-ink-200",
                  DRAWER_SIZES[size],
                )
              : cx(
                  "max-h-[calc(100dvh-2rem)] w-full animate-rise rounded border border-ink-200",
                  CENTER_SIZES[size],
                ),
            "motion-reduce:animate-none",
            className,
          )}
        >
          <header
            className={cx(
              "flex shrink-0 items-start gap-3 border-b border-ink-200/70 px-5 py-4 sm:px-6",
              drawer && "bg-ink-50/50",
            )}
          >
            {icon ? <span className="shrink-0">{icon}</span> : null}
            <div className="min-w-0 flex-1">
              <h2
                id={headingId}
                className="text-[17px] font-bold leading-tight tracking-tight text-ink-900"
              >
                {title}
              </h2>
              {description ? (
                <p
                  id={descriptionId}
                  className="mt-1 text-[13px] leading-relaxed text-ink-500"
                >
                  {description}
                </p>
              ) : null}
            </div>
            {headerAside}
            {dismissable ? (
              <IconButton
                ref={closeRef}
                label="Close"
                onClick={onClose}
                className="-mr-1.5 -mt-0.5"
              >
                <X className="h-4.5 w-4.5" />
              </IconButton>
            ) : null}
          </header>

          {form ? (
            <form
              {...form}
              className={cx("flex min-h-0 flex-1 flex-col", form.className)}
            >
              {content}
            </form>
          ) : (
            content
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

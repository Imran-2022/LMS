"use client";

/**
 * ActionMenu — the row-level "…" menu.
 *
 * This generalises what `UserActionsMenu` was doing by hand for one table. The reason it
 * needs to exist at all is the table: an absolutely-positioned dropdown inside a cell is
 * clipped by the table's `overflow-x-auto` wrapper, so the last row's menu gets cut off
 * or forces the table to scroll. Portalling to `document.body` and positioning from the
 * trigger's `getBoundingClientRect()` is the way out of that.
 *
 * What the original was missing, and this has:
 *
 * - **Menu semantics.** `role="menu"` / `role="menuitem"` with `aria-haspopup` on the
 *   trigger, so the control is announced as a menu rather than as an unlabelled button
 *   next to some buttons.
 * - **Arrow-key navigation.** Up/Down/Home/End move between items. A menu you can only
 *   reach by tabbing through every item is not a menu.
 * - **Measured flip-up.** The original hard-coded `menuHeight = 92`, which was right for
 *   exactly two items; the real height is read after mount, so a five-item menu on the
 *   last row still flips above the trigger instead of off the bottom of the window.
 * - **Closes on scroll.** A `position: fixed` menu does not move with its row, so
 *   scrolling with one open would leave it pointing at a different record.
 *
 * Navigations are real `<a>` elements (`href`), not buttons that call `router.push`, so
 * "Open workspace" can be middle-clicked or copied like any other link.
 */
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

import { cx } from "@/lib/format";
import { IconButton } from "./IconButton";

export type ActionMenuItem = {
  label: string;
  icon?: ReactNode;
  /** Renders the item as a link. Mutually exclusive with `onSelect`. */
  href?: string;
  onSelect?: () => void;
  tone?: "default" | "danger";
  disabled?: boolean;
  /** Draw a divider above this item — used to separate destructive actions. */
  separated?: boolean;
};

/** One menu open at a time, across every instance on the page. */
const OPEN_EVENT = "lms:action-menu-open";

export function ActionMenu({
  label,
  items,
  align = "right",
  className,
}: {
  /** The accessible name, e.g. `Actions for "Intro to TypeScript"`. Required. */
  label: string;
  items: ActionMenuItem[];
  align?: "left" | "right";
  className?: string;
}) {
  const instanceId = useId();
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [box, setBox] = useState<{ top: number; left?: number; right?: number }>(
    { top: 0 },
  );

  const close = useCallback((restoreFocus = false) => {
    setOpen(false);
    if (restoreFocus) triggerRef.current?.focus();
  }, []);

  /* Another menu opening, Escape, or a scroll all close this one. */
  useEffect(() => {
    function onOtherOpen(event: Event) {
      if ((event as CustomEvent<string>).detail !== instanceId) setOpen(false);
    }
    window.addEventListener(OPEN_EVENT, onOtherOpen);
    return () => window.removeEventListener(OPEN_EVENT, onOtherOpen);
  }, [instanceId]);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (!(event.target instanceof Node)) return;
      if (triggerRef.current?.contains(event.target)) return;
      if (menuRef.current?.contains(event.target)) return;
      setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.stopPropagation();
        close(true);
      }
    }
    // Capture, so a scroll inside the table's own scroller counts too.
    function onScroll() {
      setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown, true);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown, true);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
    };
  }, [open, close]);

  /*
   * Position against the trigger using the menu's real height, then focus the first item.
   * A layout effect, so the correction lands before paint and the menu never appears in
   * the wrong place first.
   */
  useLayoutEffect(() => {
    if (!open) return;
    const trigger = triggerRef.current;
    const menu = menuRef.current;
    if (!trigger || !menu) return;

    const bounds = trigger.getBoundingClientRect();
    const height = menu.offsetHeight;
    const below = bounds.bottom + 6;
    const flip = below + height > window.innerHeight - 8;

    setBox({
      top: flip ? Math.max(8, bounds.top - height - 6) : below,
      ...(align === "right"
        ? { right: Math.max(8, window.innerWidth - bounds.right) }
        : { left: Math.max(8, bounds.left) }),
    });

    menu.querySelector<HTMLElement>('[role="menuitem"]:not([disabled])')?.focus();
  }, [open, align]);

  function toggle() {
    if (open) {
      setOpen(false);
      return;
    }
    const bounds = triggerRef.current?.getBoundingClientRect();
    // A first guess so the very first paint is close; the layout effect refines it.
    if (bounds) {
      setBox({
        top: bounds.bottom + 6,
        ...(align === "right"
          ? { right: Math.max(8, window.innerWidth - bounds.right) }
          : { left: Math.max(8, bounds.left) }),
      });
    }
    window.dispatchEvent(new CustomEvent(OPEN_EVENT, { detail: instanceId }));
    setOpen(true);
  }

  function onMenuKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    const menu = menuRef.current;
    if (!menu) return;

    if (event.key === "Tab") {
      // Tabbing out of a menu closes it rather than walking into the page behind.
      event.preventDefault();
      close(true);
      return;
    }

    const keys = ["ArrowDown", "ArrowUp", "Home", "End"];
    if (!keys.includes(event.key)) return;
    event.preventDefault();

    const nodes = Array.from(
      menu.querySelectorAll<HTMLElement>('[role="menuitem"]:not([disabled])'),
    );
    if (nodes.length === 0) return;

    if (event.key === "Home") {
      nodes[0].focus();
      return;
    }
    if (event.key === "End") {
      nodes[nodes.length - 1].focus();
      return;
    }

    const step = event.key === "ArrowDown" ? 1 : -1;
    const current = nodes.indexOf(document.activeElement as HTMLElement);
    const next =
      current === -1
        ? step > 0
          ? 0
          : nodes.length - 1
        : (current + step + nodes.length) % nodes.length;
    nodes[next].focus();
  }

  function select(item: ActionMenuItem) {
    if (item.disabled) return;
    // Focus goes back to the trigger *before* the handler runs, so a dialog opened from
    // here records the trigger as its return target — the menu item is about to unmount.
    triggerRef.current?.focus();
    setOpen(false);
    item.onSelect?.();
  }

  return (
    <>
      <IconButton
        ref={triggerRef}
        label={label}
        onClick={toggle}
        aria-haspopup="menu"
        aria-expanded={open}
        className={className}
      >
        <MoreHorizontal className="h-4.5 w-4.5" />
      </IconButton>

      {open
        ? createPortal(
            <div
              ref={menuRef}
              role="menu"
              aria-label={label}
              onKeyDown={onMenuKeyDown}
              style={box}
              className="fixed z-[200] min-w-52 animate-rise overflow-hidden rounded border border-ink-200 bg-white p-1 shadow-[0_18px_45px_rgba(15,23,42,0.18)] motion-reduce:animate-none"
            >
              {items.map((item) =>
                item.href && !item.disabled ? (
                  <Link
                    key={item.label}
                    role="menuitem"
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cx(ITEM, TONES[item.tone ?? "default"], item.separated && DIVIDER)}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                ) : (
                  <button
                    key={item.label}
                    role="menuitem"
                    type="button"
                    disabled={item.disabled}
                    onClick={() => select(item)}
                    className={cx(ITEM, TONES[item.tone ?? "default"], item.separated && DIVIDER)}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                ),
              )}
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

const ITEM =
  "flex w-full cursor-pointer items-center gap-2.5 rounded px-3 py-2 text-left text-[13px] font-medium transition-colors " +
  "focus-visible:outline-none disabled:pointer-events-none disabled:opacity-45 [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0";

const TONES: Record<"default" | "danger", string> = {
  default: "text-ink-700 hover:bg-brand-50 hover:text-brand-700 focus-visible:bg-brand-50 focus-visible:text-brand-700",
  danger:
    "text-danger-600 hover:bg-danger-50 hover:text-danger-700 focus-visible:bg-danger-50 focus-visible:text-danger-700",
};

const DIVIDER = "mt-1 border-t border-ink-100 pt-2.5";

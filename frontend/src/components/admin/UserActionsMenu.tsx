"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MoreHorizontal } from "lucide-react";
import { removeUser, updateUserStatus } from "@/lib/actions/admin";
import { DangerousSubmit } from "@/components/ui/DangerousSubmit";

export function UserActionsMenu({
  userId,
  userName,
  blocked,
  onStatusChange,
  onDeleted,
}: {
  userId: number;
  userName: string;
  blocked: boolean;
  onStatusChange?: (blocked: boolean) => void;
  onDeleted?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, right: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const closeOtherMenus = (event: Event) => {
      if ((event as CustomEvent<number>).detail !== userId) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("lms:user-actions-open", closeOtherMenus);
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      window.removeEventListener("lms:user-actions-open", closeOtherMenus);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [userId]);

  useEffect(() => {
    if (!open) return;
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (
        !(event.target instanceof Node) ||
        (!buttonRef.current?.contains(event.target) &&
          !menuRef.current?.contains(event.target))
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, [open]);

  function toggleMenu() {
    if (!buttonRef.current) return;
    if (open) {
      setOpen(false);
      return;
    }

    const bounds = buttonRef.current.getBoundingClientRect();
    const menuHeight = 92;
    setPosition({
      top:
        bounds.bottom + 4 + menuHeight > window.innerHeight
          ? Math.max(8, bounds.top - menuHeight - 4)
          : bounds.bottom + 4,
      right: Math.max(8, window.innerWidth - bounds.right),
    });
    window.dispatchEvent(
      new CustomEvent("lms:user-actions-open", { detail: userId }),
    );
    setOpen(true);
  }

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleMenu}
        className="grid h-9 w-9 place-items-center rounded text-ink-500 hover:bg-brand-50 hover:text-brand-700"
        aria-label={`Actions for ${userName}`}
        title="User actions"
        aria-expanded={open}
      >
        <MoreHorizontal size={19} aria-hidden="true" />
      </button>
      {open
        ? createPortal(
            <div
              ref={menuRef}
              className="fixed z-[80] min-w-36 rounded border border-ink-200 bg-white p-1 shadow-lg"
              style={position}
              role="menu"
            >
              <form
                action={async () => {
                  const result = await updateUserStatus(String(userId), !blocked);
                  if (result.ok) {
                    onStatusChange?.(!blocked);
                    setOpen(false);
                  }
                }}
              >
                <input type="hidden" name="userId" value={userId} />
                <input
                  type="hidden"
                  name="blocked"
                  value={String(!blocked)}
                />
                <button
                  type="submit"
                  className="w-full rounded px-3 py-2 text-left text-sm text-ink-700 hover:bg-ink-50"
                >
                  {blocked ? "Unblock" : "Block"}
                </button>
              </form>
              <form
                action={async () => {
                  const result = await removeUser(String(userId));
                  if (result.ok) {
                    onDeleted?.();
                    setOpen(false);
                  }
                }}
              >
                <input type="hidden" name="userId" value={userId} />
                <DangerousSubmit
                  variant="ghost"
                  size="sm"
                  confirm={`Delete "${userName}"?`}
                  pendingLabel="Deleting..."
                  className="w-full justify-start rounded px-3 py-2 text-danger-600 hover:bg-danger-50 hover:text-danger-700"
                >
                  Delete
                </DangerousSubmit>
              </form>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
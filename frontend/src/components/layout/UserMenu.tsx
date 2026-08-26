"use client";

/**
 * The avatar + role chip in the top-right, with a dropdown.
 *
 * A client component because a dropdown needs local open/closed state and an
 * outside-click listener. Everything it displays is passed in from the server; it
 * fetches nothing and decides nothing about permissions.
 *
 * The sign-out control is a real `<form>` posting to a Server Action rather than an
 * `onClick`. That means it clears the httpOnly cookie server-side (the only place that
 * can) and it still works if the JS bundle has not loaded yet.
 */
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, LayoutDashboard, LogOut } from "lucide-react";

import { signOut } from "@/lib/actions/auth";
import { Avatar } from "@/components/ui/Avatar";
import { RoleBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cx } from "@/lib/format";
import { homePathFor } from "@/lib/roles";
import type { RoleType } from "@/lib/types";

export function UserMenu({
  name,
  email,
  avatarUrl,
  role,
}: {
  name: string;
  email: string;
  avatarUrl: string | null;
  role: RoleType | null;
}) {
  const [open, setOpen] = useState(false);
  const wrapper = useRef<HTMLDivElement>(null);

  // Close on an outside click or Escape. Without these the menu stays open while the
  // user clicks elsewhere, which reads as broken.
  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (!wrapper.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="relative" ref={wrapper}>
      <Button
        type="button"
        onClick={() => setOpen((value) => !value)}
        variant="secondary"
        size="sm"
        aria-expanded={open}
        aria-haspopup="menu"
        className="h-auto rounded-full py-1 pl-1 pr-2.5"
      >
        <Avatar name={name} src={avatarUrl} size="sm" />
        <span className="hidden text-left sm:block">
          <span className="block max-w-[140px] truncate text-[13px] font-semibold leading-tight text-ink-800">
            {name}
          </span>
        </span>
        <ChevronDown
          size={15}
          className={cx("text-ink-400 transition-transform", open && "rotate-180")}
        />
      </Button>

      {open ? (
        <div
          role="menu"
          className="animate-rise absolute right-0 top-[calc(100%+8px)] z-50 w-64 overflow-hidden rounded border border-ink-200/80 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.14)]"
        >
          <div className="border-b border-ink-100 p-4">
            <div className="flex items-center gap-3">
              <Avatar name={name} src={avatarUrl} size="md" />
              <div className="min-w-0">
                <p className="truncate text-[14px] font-semibold text-ink-900">{name}</p>
                <p className="truncate text-[12px] text-ink-500">{email}</p>
              </div>
            </div>
            <div className="mt-3">
              <RoleBadge role={role} />
            </div>
          </div>

          <div className="p-2">
            <Link
              href={homePathFor(role)}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded px-3 py-2.5 text-[13.5px] font-medium text-ink-700 transition-colors hover:bg-ink-100"
            >
              <LayoutDashboard size={16} className="text-ink-400" />
              My dashboard
            </Link>

            <form action={signOut}>
              <Button
                type="submit"
                variant="ghost"
                size="md"
                className="w-full justify-start px-3 py-2.5 text-left text-[13.5px] text-danger-600 hover:bg-danger-50 hover:text-danger-600"
              >
                <LogOut size={16} />
                Sign out
              </Button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}

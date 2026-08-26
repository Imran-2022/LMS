"use client";

/**
 * Dashboard sidebar.
 *
 * Client-side only because it needs `usePathname()` to mark the current page. The
 * links themselves come from `navFor(role)` — the sidebar does not decide who sees
 * what, it renders a list it is handed.
 *
 * On mobile it becomes a slide-over: the same markup, translated off-canvas, toggled
 * by the hamburger in the topbar. One nav, not a duplicate mobile menu that then
 * drifts out of sync with the desktop one.
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import {
  Award,
  BookOpen,
  Compass,
  Layers,
  Library,
  PenLine,
  PieChart,
  Users,
  X,
} from "lucide-react";

import { Brand } from "./Brand";
import { cx } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { isActive, navFor, type NavIcon } from "@/lib/nav";
import type { RoleType } from "@/lib/types";

const ICONS: Record<NavIcon, typeof BookOpen> = {
  library: Library,
  compass: Compass,
  book: BookOpen,
  award: Award,
  users: Users,
  pen: PenLine,
  layers: Layers,
  chart: PieChart,
};

export function Sidebar({
  role,
  open,
  onClose,
  collapsed,
}: {
  role: RoleType | null;
  open: boolean;
  onClose: () => void;
  collapsed: boolean;
}) {
  const pathname = usePathname();
  const groups = navFor(role);

  // Navigating should dismiss the mobile drawer. Without this, tapping a link on a
  // phone loads the new page behind a panel that is still covering it.
  useEffect(() => {
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally keyed on
    // the pathname alone: re-running when `onClose` changes identity would close the
    // drawer the instant it opened.
  }, [pathname]);

  return (
    <>
      {/* Scrim. Mobile only — on desktop the sidebar is always in the layout flow. */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className={cx(
          "fixed inset-0 z-40 bg-ink-900/40 backdrop-blur-sm transition-opacity lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      <aside
        className={cx(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-ink-200/70 bg-white transition-[width,transform] duration-500 ease-in-out lg:translate-x-0",
          collapsed ? "lg:w-[76px]" : "w-[264px]",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div
          className={cx(
            "flex h-16 shrink-0 items-center px-5",
            collapsed ? "lg:justify-center" : "justify-between",
          )}
        >
          <Brand collapsed={collapsed} />
          <Button
            type="button"
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0 lg:hidden"
            aria-label="Close navigation"
          >
            <X size={18} />
          </Button>
        </div>

        <nav className="scroll-slim flex-1 overflow-y-auto px-3 pb-6">
          {groups.map((group) => (
            <div key={group.heading} className="mb-6">
              <p
                className={cx(
                  "mb-2 px-3 text-[10.5px] font-bold uppercase tracking-[0.12em] text-ink-400",
                  collapsed && "lg:sr-only",
                )}
              >
                {group.heading}
              </p>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = ICONS[item.icon];
                  const active = isActive(item, pathname);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        title={collapsed ? item.label : undefined}
                        className={cx(
                          "group flex items-center gap-3 rounded px-3 py-2.5 text-[13.5px] font-medium transition-all",
                          collapsed && "lg:justify-center lg:px-0",
                          active
                            ? "bg-brand-50 text-brand-700 shadow-[inset_2px_0_0_var(--color-brand-500)]"
                            : "text-ink-600 hover:bg-ink-100 hover:text-ink-900",
                        )}
                      >
                        <Icon
                          size={17}
                          className={cx(
                            "shrink-0 transition-colors",
                            active
                              ? "text-brand-500"
                              : "text-ink-400 group-hover:text-ink-600",
                          )}
                        />
                        <span
                          className={cx(
                            "overflow-hidden whitespace-nowrap transition-[max-width,opacity] duration-500 ease-in-out",
                            collapsed
                              ? "lg:max-w-0 lg:opacity-0"
                              : "lg:max-w-[160px] lg:opacity-100",
                          )}
                        >
                          {item.label}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}

"use client";

/**
 * The dashboard shell: sidebar, topbar, content column.
 * not one level up in the layout.
 */
import { useState } from "react";
import { Menu } from "lucide-react";
import { useRouter } from "next/navigation";

import { Sidebar } from "./Sidebar";
import { UserMenu } from "./UserMenu";
import { Brand } from "./Brand";
import { Button } from "@/components/ui/Button";
import { cx } from "@/lib/format";
import { setSidebarPreference } from "@/lib/actions/sidebar";
import { SIDEBAR_COOKIE } from "@/lib/sidebar-preference";
import type { RoleType } from "@/lib/types";
import type { ReactNode } from "react";

export function AppShell({
  name,
  email,
  avatarUrl,
  role,
  sidebarCollapsed: initialSidebarCollapsed,
  children,
}: {
  name: string;
  email: string;
  avatarUrl: string | null;
  role: RoleType | null;
  sidebarCollapsed: boolean;
  children: ReactNode;
}) {
  const router = useRouter();
  const [navOpen, setNavOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(initialSidebarCollapsed);

  function toggleSidebar() {
    const nextValue = !sidebarCollapsed;
    setSidebarCollapsed(nextValue);
    void setSidebarPreference(nextValue).then(() => router.refresh());
  }

  return (
    <div className="min-h-dvh">
      <Sidebar
        role={role}
        open={navOpen}
        onClose={() => setNavOpen(false)}
        collapsed={sidebarCollapsed}
      />

      {/* Offset by the sidebar width on desktop; full width below it. */}
      <div className={cx("transition-[padding] duration-500 ease-in-out", sidebarCollapsed ? "lg:pl-[76px]" : "lg:pl-[264px]")}>
        <header className={cx("fixed inset-x-0 top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-ink-200/70 bg-white/90 px-4 backdrop-blur-md transition-[left] duration-500 ease-in-out sm:px-6", sidebarCollapsed ? "lg:left-[76px]" : "lg:left-[264px]")}>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              onClick={() => setNavOpen(true)}
              variant="secondary"
              size="sm"
              className="h-10 w-10 p-0 lg:hidden"
              aria-label="Open navigation"
            >
              <Menu size={18} />
            </Button>
            <Button
              type="button"
              onClick={toggleSidebar}
              variant="secondary"
              size="sm"
              className="hidden h-10 w-10 p-0 lg:inline-flex"
              aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <Menu size={20} strokeWidth={2} aria-hidden="true" />
            </Button>
            <span className="lg:hidden">
              <Brand compact />
            </span>
          </div>

          <UserMenu name={name} email={email} avatarUrl={avatarUrl} role={role} />
        </header>

        <main className="mx-auto w-full max-w-[1180px] px-4 pb-8 pt-24 sm:px-6 sm:pb-10 sm:pt-24">{children}</main>
      </div>
    </div>
  );
}

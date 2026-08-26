"use client";

/**
 * The dashboard shell: sidebar, topbar, content column.
 *
 * A client component, but only because the mobile drawer's open/closed state has to
 * live somewhere. The pages it wraps stay Server Components — `children` arrives
 * already-rendered from the server, so making the shell interactive does not drag the
 * whole dashboard into the client bundle. That is the reason the state sits here and
 * not one level up in the layout.
 */
import { useState } from "react";
import { Menu } from "lucide-react";

import { Sidebar } from "./Sidebar";
import { UserMenu } from "./UserMenu";
import { Brand } from "./Brand";
import { Button } from "@/components/ui/Button";
import type { RoleType } from "@/lib/types";
import type { ReactNode } from "react";

export function AppShell({
  name,
  email,
  avatarUrl,
  role,
  children,
}: {
  name: string;
  email: string;
  avatarUrl: string | null;
  role: RoleType | null;
  children: ReactNode;
}) {
  const [navOpen, setNavOpen] = useState(false);

  return (
    <div className="min-h-dvh">
      <Sidebar role={role} open={navOpen} onClose={() => setNavOpen(false)} />

      {/* Offset by the sidebar width on desktop; full width below it. */}
      <div className="lg:pl-[264px]">
        <header className="fixed inset-x-0 top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-ink-200/70 bg-white/90 px-4 backdrop-blur-md sm:px-6 lg:left-[264px]">
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

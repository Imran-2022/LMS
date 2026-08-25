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
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-ink-200/70 bg-white/85 px-4 backdrop-blur-md sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setNavOpen(true)}
              className="grid h-10 w-10 place-items-center rounded-xl border border-ink-200 text-ink-600 transition-colors hover:border-brand-300 hover:text-brand-600 lg:hidden"
              aria-label="Open navigation"
            >
              <Menu size={18} />
            </button>
            <span className="lg:hidden">
              <Brand compact />
            </span>
          </div>

          <UserMenu name={name} email={email} avatarUrl={avatarUrl} role={role} />
        </header>

        <main className="mx-auto w-full max-w-[1180px] px-4 py-8 sm:px-6 sm:py-10">{children}</main>
      </div>
    </div>
  );
}

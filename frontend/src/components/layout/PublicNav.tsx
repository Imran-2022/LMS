/**
 * The public header, for the catalogue, blog and landing page.
 *
 * A Server Component: it reads the session on the server, so the right-hand side
 * renders as either "Sign in / Get started" or the user's own menu on the very first
 * paint. Doing it client-side would mean a visible flip from signed-out to signed-in
 * on every page load.
 */
import { getSession } from "@/lib/api";
import { roleOf } from "@/lib/roles";

import { Brand } from "./Brand";
import { PublicNavLinks } from "./PublicNavLinks";
import { UserMenu } from "./UserMenu";
import { ButtonLink } from "@/components/ui/Button";

export async function PublicNav() {
  const user = await getSession();

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 border-b border-ink-200/70 bg-white/90 backdrop-blur-md">
        <div className="relative mx-auto flex h-16 w-full max-w-[1180px] items-center justify-between gap-4 px-4 sm:px-6">
          <Brand />
          <div className="absolute left-1/2 hidden -translate-x-1/2 sm:block">
            <PublicNavLinks />
          </div>

          <div className="flex items-center gap-2.5">
            {user ? (
              <UserMenu
                name={user.fullName ?? user.username}
                email={user.email}
                avatarUrl={user.avatarUrl}
                role={roleOf(user)}
              />
            ) : (
              <>
                <ButtonLink href="/login" variant="ghost" size="sm">
                  Sign in
                </ButtonLink>
                <ButtonLink href="/signup" size="sm">
                  Get started
                </ButtonLink>
              </>
            )}
          </div>
        </div>
      </header>
      <div className="h-16" aria-hidden="true" />
    </>
  );
}

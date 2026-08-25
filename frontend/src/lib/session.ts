/**
 * Session cookies, and the guards pages use to establish who is asking.
 *
 * Two cookies are set at sign-in:
 *
 *   `lms_token` — the Strapi JWT. httpOnly, so client JavaScript cannot read it.
 *   `lms_role`  — the role *type* string, readable by the edge middleware.
 *
 * The second one needs justifying, because a role in a cookie looks like something
 * a user could tamper with. They can: it is not httpOnly-signed and it is not
 * trusted anywhere that matters. It exists purely so `middleware.ts` can redirect a
 * student away from `/admin` without an API round-trip on every navigation — the
 * edge runtime cannot call `getSession()`. Editing that cookie to say "admin" gets
 * you as far as the `/admin` layout, which then calls `requireRole()` on the server,
 * which reads the role from `GET /api/me` (i.e. from the database, via the JWT) and
 * redirects you straight back out. And the API itself would 403 regardless.
 *
 * So: `lms_role` is a routing hint, `lms_token` is the credential, and the
 * authority on what a role may do is the Strapi policy layer.
 */
import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { SESSION_COOKIE, getSession } from "./api";
import { canAuthorCourses, canManageBlog, isAdmin, roleOf } from "./roles";
import type { RoleType, SessionUser } from "./types";

export const ROLE_COOKIE = "lms_role";

/** One week, matching Strapi's default JWT lifetime so both expire together. */
const MAX_AGE = 60 * 60 * 24 * 7;

export async function startSession(token: string, role: RoleType | null) {
  const store = await cookies();
  const shared = {
    path: "/",
    maxAge: MAX_AGE,
    sameSite: "lax" as const,
    // Plain HTTP locally, HTTPS in production. A `secure` cookie is simply not
    // stored by the browser over http://localhost, which breaks local dev.
    secure: process.env.NODE_ENV === "production",
  };

  store.set(SESSION_COOKIE, token, { ...shared, httpOnly: true });
  store.set(ROLE_COOKIE, role ?? "student", { ...shared, httpOnly: false });
}

export async function endSession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  store.delete(ROLE_COOKIE);
}

/**
 * The signed-in user, or a redirect to the login page.
 *
 * `next` carries the path the user was trying to reach so they land back there
 * after signing in, rather than on a generic dashboard.
 */
export async function requireUser(next?: string): Promise<SessionUser> {
  const user = await getSession();
  if (!user) {
    redirect(next ? `/login?next=${encodeURIComponent(next)}` : "/login");
  }
  return user;
}

/**
 * Require one of `allowed`, else bounce to a screen the user can actually use.
 *
 * This is the server-side counterpart to the middleware redirect, and unlike the
 * middleware it reads the role from the API rather than from a cookie. Every
 * role-gated layout calls it — the middleware is the fast path, this is the check.
 */
export async function requireRole(
  allowed: RoleType[],
  next?: string,
): Promise<SessionUser> {
  const user = await requireUser(next);
  const role = roleOf(user);

  if (!role || !allowed.includes(role)) {
    // Deliberately not a 403 page. Being sent somewhere useful is friendlier than
    // a dead end, and the API has already refused whatever they were reaching for.
    // `err=denied` is the code `<Flash>` renders as an explanation strip.
    redirect("/courses?err=denied");
  }

  return user;
}

/** Guard for `/admin/*`. */
export function requireAdmin(next?: string) {
  return requireRole(["admin"], next);
}

/** Guard for `/manage/*` — the three roles with any authoring rights. */
export function requireAuthor(next?: string) {
  return requireRole(["admin", "content_manager", "instructor"], next);
}

/** Guard for `/manage/blog` — Admin and Content Manager only. */
export function requireBlogManager(next?: string) {
  return requireRole(["admin", "content_manager"], next);
}

/** Guard for `/my-courses/*`. Students only: nobody else has enrollments. */
export function requireStudent(next?: string) {
  return requireRole(["student"], next);
}

/** Re-exported so components can ask "who is this?" without importing the client. */
export { getSession, canAuthorCourses, canManageBlog, isAdmin, roleOf };

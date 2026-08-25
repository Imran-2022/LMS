/**
 * Edge middleware — the cheap first pass on route access.
 *
 * This exists to avoid a pointless round-trip: sending a signed-out visitor to
 * `/my-courses` only for the page to fetch `/api/me`, get a 401, and redirect them to
 * `/login` anyway. Middleware catches that from the cookies alone, before any React
 * renders.
 *
 * What it is *not* is the access check. It reads `lms_role`, which is a plain
 * non-httpOnly cookie the user can edit. Setting it to "admin" gets you as far as the
 * `/admin` layout, which calls `requireAdmin()` on the server, which reads the real
 * role from `GET /api/me` and bounces you back out — and the Strapi policies would
 * 403 the underlying requests regardless. Three layers, and this is the least
 * trusted of them by design; it is here for speed, not safety.
 *
 * `lms_token` is httpOnly so middleware can see whether a token exists but cannot
 * read the role out of it. Decoding a JWT here would mean trusting an unverified
 * payload at the edge, which buys nothing the server check does not already do.
 */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const TOKEN_COOKIE = "lms_token";
const ROLE_COOKIE = "lms_role";

/** Route prefixes that require a session, with the roles allowed past each one. */
const GUARDS: { prefix: string; roles: string[] }[] = [
  { prefix: "/admin", roles: ["admin"] },
  { prefix: "/manage", roles: ["admin", "content_manager", "instructor"] },
  { prefix: "/my-courses", roles: ["student"] },
];

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const token = request.cookies.get(TOKEN_COOKIE)?.value;
  const role = request.cookies.get(ROLE_COOKIE)?.value ?? null;

  // Someone with a session has no reason to see the login form; send them to the
  // screen their role actually starts on.
  if (token && (pathname === "/login" || pathname === "/signup")) {
    return NextResponse.redirect(new URL(homeFor(role), request.url));
  }

  const guard = GUARDS.find(
    (candidate) => pathname === candidate.prefix || pathname.startsWith(`${candidate.prefix}/`),
  );
  if (!guard) return NextResponse.next();

  if (!token) {
    // Remember where they were headed so login can return them there.
    const login = new URL("/login", request.url);
    login.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(login);
  }

  // A token but the wrong role: hand them to their own dashboard rather than the
  // login page, which would be confusing when they are already signed in.
  if (role && !guard.roles.includes(role)) {
    const home = new URL(homeFor(role), request.url);
    home.searchParams.set("err", "denied");
    return NextResponse.redirect(home);
  }

  return NextResponse.next();
}

function homeFor(role: string | null): string {
  switch (role) {
    case "admin":
      return "/admin";
    case "content_manager":
    case "instructor":
      return "/manage/courses";
    case "student":
      return "/my-courses";
    default:
      return "/courses";
  }
}

export const config = {
  /**
   * Skip static assets and Next's internals. Without this the middleware would run
   * for every image and chunk request, which is wasted work on the edge.
   */
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp|ico)$).*)"],
};

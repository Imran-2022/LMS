import { NextRequest, NextResponse } from "next/server";
export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const protectedPath = ["/my-courses", "/manage", "/admin"].some((prefix) =>
    path.startsWith(prefix),
  );
  if (protectedPath && !request.cookies.has("strapi_jwt"))
    return NextResponse.redirect(new URL("/login", request.url));
  const role = request.cookies.get("user_role")?.value;
  if (path.startsWith("/admin") && role && role !== "admin")
    return NextResponse.redirect(new URL("/courses", request.url));
  if (
    path.startsWith("/manage") &&
    role &&
    !["admin", "content_manager", "instructor"].includes(role)
  )
    return NextResponse.redirect(new URL("/courses", request.url));
  return NextResponse.next();
}
export const config = {
  matcher: ["/my-courses/:path*", "/manage/:path*", "/admin/:path*"],
};

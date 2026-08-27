"use client";

/**
 * Turn a `?ok=` / `?err=` flash code into a toast, then remove it from the URL.
 *
 * Most actions now return their result and the form toasts it directly, but a handful
 * still redirect because a redirect is the right outcome: signing in, signing out, being
 * bounced by `requireRole`, deleting the course whose page you were standing on. Those
 * carry their message as a code in the query string, and this is what renders it.
 *
 * Two details:
 *
 * - **The parameter is stripped afterwards** with `router.replace(..., { scroll: false })`.
 *   Without that, `?ok=course-deleted` stays in the address bar, gets bookmarked, and
 *   re-announces itself on every refresh. `scroll: false` because replacing the URL should
 *   not jump a reader back to the top of a long page.
 * - **A signature guards against double-firing.** In development, Strict Mode runs effects
 *   twice, and the toast is a side effect that would visibly duplicate.
 *
 * Rendered inside `<Suspense>` in the root layout: `useSearchParams()` opts a route into
 * client rendering otherwise, which would cost every static marketing page its prerender.
 */
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

import { flashMessage } from "@/lib/flash";
import { useToast } from "./Toast";

export function FlashToasts() {
  const params = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const shown = useRef<string | null>(null);

  const ok = params.get("ok");
  const err = params.get("err");

  useEffect(() => {
    const code = err ?? ok;
    if (!code) {
      // Reset, so the *same* action twice in a row still announces itself the second time.
      shown.current = null;
      return;
    }

    const signature = `${pathname}|${err ? "err" : "ok"}|${code}`;
    if (shown.current === signature) return;
    shown.current = signature;

    const message = flashMessage(code, Boolean(err));
    if (message) toast(message.text, message.tone);

    const next = new URLSearchParams(params.toString());
    next.delete("ok");
    next.delete("err");
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [ok, err, pathname, params, router, toast]);

  return null;
}

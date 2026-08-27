/**
 * Shared plumbing for the Server Actions.
 *
 * Note what is *not* at the top of this file: `"use server"`. Next.js requires every
 * export of a `"use server"` module to be an async function, because each one becomes
 * a callable HTTP endpoint. These are synchronous helpers meant to be called *by*
 * actions, not by the browser, so the directive would be a build error — and marking
 * them as actions would needlessly expose `redirect()` as a public endpoint.
 * `import "server-only"` gives the protection that is actually wanted here: importing
 * this from a client component fails at build time.
 *
 * Two things every action needs and should not each reinvent:
 *
 * 1. `parse*` helpers, because `FormData` values are `string | File | null` and a form
 *    field that should be a number arrives as a string — or as nothing at all when the
 *    input was disabled or renamed. Coercing in one place stops `NaN` reaching the API.
 *
 * 2. The two ways an action can end:
 *
 *    - `done()` / `fail()` — revalidate and *return* a result. This is what form-bound
 *      actions use, because the form is inside an overlay: it needs to hear "saved" so it
 *      can close itself and toast, with the list refreshing underneath. An action that
 *      only ever redirected could not say that, which is precisely why every create and
 *      edit screen used to be its own route.
 *
 *    - `finish()` — revalidate and redirect. Still correct where the destination genuinely
 *      changes: signing in, signing out, being turned away by `requireRole`, or deleting
 *      the record whose page you are standing on. It carries its message as a `?ok=` code
 *      because a redirect discards any return value.
 *
 *    Order matters in both: the revalidation must be queued before `redirect()` throws, or
 *    the next render serves the stale cache. Getting that backwards is the classic "I
 *    saved it but the list still shows the old title" bug.
 */
import "server-only";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type { FormState } from "@/lib/form";

/**
 * Re-exported so an action can keep importing everything it needs from one module.
 *
 * The type itself lives in `@/lib/form`, which has no `server-only` guard, because the
 * client components that read the returned state need it too and importing it from here
 * would fail the build.
 */
export type { FormState };

export function str(form: FormData, key: string): string {
  const value = form.get(key);
  return typeof value === "string" ? value.trim() : "";
}

/** Empty string → null, so clearing an optional field actually clears it. */
export function optionalStr(form: FormData, key: string): string | null {
  const value = str(form, key);
  return value === "" ? null : value;
}

export function num(form: FormData, key: string, fallback = 0): number {
  const value = Number(str(form, key));
  return Number.isFinite(value) ? value : fallback;
}

/**
 * A number that may legitimately be absent.
 *
 * Distinct from `num()` because "no answer selected" and "selected option 0" are
 * different things in a quiz, and collapsing them would silently mark question 1 as
 * answered with the first option for anyone who skipped it.
 */
export function optionalNum(form: FormData, key: string): number | null {
  const raw = str(form, key);
  if (raw === "") return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

/** Unchecked checkboxes are absent from FormData entirely — absence means false. */
export function bool(form: FormData, key: string): boolean {
  const value = form.get(key);
  return value === "on" || value === "true" || value === "1";
}

/**
 * Accept a redirect target from a form, but only a local one.
 *
 * `next=https://evil.example` in a query string is a textbook open redirect: the link
 * looks like it belongs to this site, and the site itself does the forwarding. Anything
 * that is not a single-slash-prefixed local path is discarded in favour of `fallback`.
 */
export function safePath(
  raw: FormDataEntryValue | null,
  fallback: string,
): string {
  if (typeof raw !== "string" || raw === "") return fallback;
  if (!raw.startsWith("/") || raw.startsWith("//")) return fallback;
  return raw;
}

/**
 * Revalidate the affected paths, then send the user somewhere with a flash code.
 *
 * `redirect()` works by throwing, so nothing after it runs — hence every
 * `revalidatePath` call happens first.
 */
export function finish(
  paths: string[],
  destination: string,
  code: string,
  failed = false,
): never {
  refresh(paths);
  const separator = destination.includes("?") ? "&" : "?";
  redirect(`${destination}${separator}${failed ? "err" : "ok"}=${code}`);
}

/**
 * Succeed: revalidate, and hand the message back to the form that submitted.
 *
 * The caller stays where it is. The overlay closes itself, raises the message as a toast,
 * and the revalidated list re-renders underneath with the change already in it — which is
 * what makes editing feel like editing rather than like navigating.
 *
 * `id` is returned for the one case that needs it: after creating a course, the workspace
 * for the new course is where the author is going next, and only the action knows its id.
 */
export function done(
  paths: string[],
  message: string,
  id?: number,
): FormState {
  refresh(paths);
  return { ok: true, message, ...(id === undefined ? {} : { id }) };
}

/** Fail: no revalidation (nothing changed), just the reason, rendered next to the form. */
export function fail(error: string): FormState {
  return { ok: false, error };
}

/** Refresh in place without navigating — used by the progress toggles. */
export function refresh(paths: string[]) {
  for (const path of paths) revalidatePath(path);
}

/**
 * Every path that can show a course's shape or a student's standing in it.
 *
 * Collected here because six different actions invalidate the same overlapping set,
 * and a missing entry shows up as a stale number on a dashboard nobody thought to
 * check — the hardest kind of caching bug to notice.
 */
export function coursePaths(courseId: string | number): string[] {
  return [
    "/courses",
    `/courses/${courseId}`,
    "/my-courses",
    `/my-courses/${courseId}`,
    "/manage/courses",
    `/manage/courses/${courseId}`,
    "/admin/courses",
    "/admin",
  ];
}

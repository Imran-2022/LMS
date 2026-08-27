"use server";

/**
 * Admin actions: role assignment, blocking, deletion.
 *
 * These are the sharpest endpoints in the app, so it is worth naming the three
 * protections that are *not* in this file, because they are the ones that count:
 *
 *   1. The routes sit behind `global::is-admin`. A Content Manager calling them gets
 *      403 regardless of what the UI showed them.
 *   2. Only the four application roles can be assigned. Nobody can be moved into
 *      Strapi's `public` role, which would leave an account that exists but cannot act.
 *   3. An admin cannot demote, block or delete *themselves*. Locking the last admin out
 *      of the panel is not recoverable without database access, so the API refuses —
 *      and refusing there rather than here means it holds for `curl` too.
 *
 * The UI mirrors all three (own-row controls are disabled), but as a courtesy, not as
 * the enforcement.
 */
import { apiFetch } from "@/lib/api";
import { requireAdmin } from "@/lib/session";

import { finish, str } from "./shared";

const ROLES = new Set(["admin", "content_manager", "instructor", "student"]);

/** Everything an admin mutation can change the look of. */
const ADMIN_PATHS = ["/admin", "/admin/users", "/admin/courses", "/admin/blog"];

/**
 * Assign a role.
 *
 * Sent as the role *type* string rather than the numeric id. The API accepts either,
 * and the string is the stable identifier: role ids are assigned by Strapi when the
 * roles are created, so they differ between the local database and Railway. Hard-coding
 * `5` for instructor would work locally and silently target the wrong role in
 * production.
 */
export async function setUserRole(form: FormData) {
  await requireAdmin();
  const userId = str(form, "userId");
  const role = str(form, "role");

  if (!userId || !ROLES.has(role)) return;

  const result = await updateUserRole(userId, role);

  finish(
    ADMIN_PATHS,
    "/admin/users",
    result.ok ? "role-updated" : "role-failed",
    !result.ok,
  );
}

export async function updateUserRole(userId: string, role: string) {
  await requireAdmin();
  if (!userId || !ROLES.has(role)) return { ok: false as const };
  const result = await apiFetch(`/api/admin/users/${userId}/role`, {
    method: "PUT",
    body: { role },
  });
  return { ok: result.ok, error: result.ok ? undefined : result.error };
}

/**
 * Block or unblock an account.
 *
 * Blocking is the preferred moderation tool here: Strapi's auth strategy rejects a
 * blocked user's existing JWT on the next request, so access ends immediately, but the
 * account's enrollments, progress and quiz history survive if they are reinstated.
 * Deleting is the irreversible option and is offered separately.
 */
export async function setUserStatus(form: FormData) {
  await requireAdmin();
  const userId = str(form, "userId");
  const blocked = str(form, "blocked") === "true";
  if (!userId) return;

  const result = await updateUserStatus(userId, blocked);

  finish(
    ADMIN_PATHS,
    "/admin/users",
    result.ok ? (blocked ? "user-blocked" : "user-unblocked") : "status-failed",
    !result.ok,
  );
}

export async function updateUserStatus(userId: string, blocked: boolean) {
  await requireAdmin();
  if (!userId) return { ok: false as const };
  const result = await apiFetch(`/api/admin/users/${userId}/status`, {
    method: "PUT",
    body: { blocked },
  });
  return { ok: result.ok, error: result.ok ? undefined : result.error };
}

/**
 * Delete an account.
 *
 * The API removes the rows that only make sense alongside the person — enrollments,
 * lesson progress, quiz attempts — but deliberately *keeps* any courses and blog posts
 * they authored, leaving them ownerless for an admin to reassign. Deleting a course
 * because its instructor left would take every enrolled student's progress with it,
 * which is a much bigger loss than an unattributed course.
 */
export async function deleteUser(form: FormData) {
  await requireAdmin();
  const userId = str(form, "userId");
  if (!userId) return;

  const result = await removeUser(userId);

  finish(
    ADMIN_PATHS,
    "/admin/users",
    result.ok ? "user-deleted" : "delete-failed",
    !result.ok,
  );
}

export async function removeUser(userId: string) {
  await requireAdmin();
  if (!userId) return { ok: false as const };
  const result = await apiFetch(`/api/admin/users/${userId}`, {
    method: "DELETE",
  });
  return { ok: result.ok, error: result.ok ? undefined : result.error };
}

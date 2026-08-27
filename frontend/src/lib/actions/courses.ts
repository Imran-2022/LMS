"use server";

/**
 * Course authoring actions.
 *
 * These deliberately do *no* permission checking of their own beyond requiring a
 * session. It would be easy to add `if (!canEditCourse(...)) return error` here and it
 * would look reassuring, but it would be a second copy of a rule that already exists
 * in `global::owns-course-or-privileged`, and two copies of an authorisation rule is
 * how they drift. The action forwards the request with the user's JWT; if the user may
 * not do it, Strapi returns 403 and that message is what the form shows.
 *
 * What they *do* own is input handling: coercing form fields to the right types and
 * refusing obviously-empty submissions before spending a round-trip.
 */
import { apiFetch } from "@/lib/api";
import { requireAuthor } from "@/lib/session";
import type { ApiItem, Course } from "@/lib/types";

import { bool, coursePaths, finish, num, optionalStr, str } from "./shared";
import type { FormState } from "./shared";

const LEVELS = new Set(["beginner", "intermediate", "advanced"]);

/** Build the payload both create and update send, from one shared form shape. */
function coursePayload(form: FormData) {
  const level = str(form, "level");
  const owner = str(form, "owner");
  return {
    title: str(form, "title"),
    slug: optionalStr(form, "slug"),
    summary: optionalStr(form, "summary"),
    description: optionalStr(form, "description"),
    coverImageUrl: optionalStr(form, "coverImageUrl"),
    category: optionalStr(form, "category"),
    // Guard the enum rather than forwarding whatever arrived: a hand-crafted POST
    // with `level=<script>` should be normalised here, not stored and echoed back.
    level: LEVELS.has(level) ? level : "beginner",
    durationMinutes: Math.max(0, num(form, "durationMinutes")),
    status: bool(form, "publishNow") ? "published" : "draft",
    ...(owner ? { owner: Number(owner) } : {}),
  };
}

export async function createCourse(
  _prev: FormState,
  form: FormData,
): Promise<FormState> {
  await requireAuthor();
  const payload = coursePayload(form);

  if (!payload.title) return { error: "Give the course a title." };

  const result = await apiFetch<ApiItem<Course>>("/api/courses", {
    method: "POST",
    body: payload,
  });

  if (!result.ok) return { error: result.error };

  // Straight into the editor for the new course, because the next thing anyone does
  // after creating a course is add its first lesson.
  finish(
    ["/manage/courses", "/courses"],
    `/manage/courses/${result.data.data.id}`,
    "course-created",
  );
}

export async function updateCourse(
  _prev: FormState,
  form: FormData,
): Promise<FormState> {
  await requireAuthor();
  const id = str(form, "courseId");
  const payload = coursePayload(form);

  if (!id) return { error: "Missing course reference." };
  if (!payload.title) return { error: "Give the course a title." };

  const result = await apiFetch<ApiItem<Course>>(`/api/courses/${id}`, {
    method: "PUT",
    body: payload,
  });

  if (!result.ok) return { error: result.error };

  finish(coursePaths(id), `/manage/courses/${id}`, "course-updated");
}

/**
 * Publish / unpublish from the course list.
 *
 * A separate action from `updateCourse` so the list can have a one-click toggle
 * without rendering the whole edit form. It sends only `status`; the backend handles
 * stamping and clearing `publishedAt`.
 */
export async function setCourseStatus(form: FormData) {
  await requireAuthor();
  const id = str(form, "courseId");
  const status = str(form, "status") === "published" ? "published" : "draft";
  if (!id) return;

  const result = await apiFetch(`/api/courses/${id}`, {
    method: "PUT",
    body: { status },
  });

  finish(
    coursePaths(id),
    "/manage/courses",
    result.ok
      ? status === "published"
        ? "published"
        : "unpublished"
      : "forbidden",
    !result.ok,
  );
}

/**
 * Delete a course.
 *
 * The backend cascades to lessons, quizzes, enrollments, progress rows and attempts —
 * see the `delete` handler in `backend/src/api/course/controllers/course.ts`. Doing
 * that cleanup server-side is what keeps the admin statistics honest, and it is why
 * this action is a single call rather than a sequence the client orchestrates.
 */
export async function deleteCourse(form: FormData) {
  await requireAuthor();
  const id = str(form, "courseId");
  if (!id) return;

  const result = await apiFetch(`/api/courses/${id}`, { method: "DELETE" });

  finish(
    coursePaths(id),
    "/manage/courses",
    result.ok ? "course-deleted" : "forbidden",
    !result.ok,
  );
}

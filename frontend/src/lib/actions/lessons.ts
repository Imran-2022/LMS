"use server";

/**
 * Lesson authoring actions.
 *
 * Every one of these forwards to a route guarded by `global::owns-course-or-privileged`,
 * which resolves the course from the request and refuses instructors who do not own it.
 * These actions therefore worry about *form shape*, not about permission — the same
 * split as `courses.ts`, for the same reason.
 */
import { apiFetch, fetchItem } from "@/lib/api";
import { requireAuthor } from "@/lib/session";
import type { ApiItem, LessonDetail } from "@/lib/types";

import { coursePaths, done, fail, finish, num, optionalStr, refresh, str } from "./shared";
import type { FormState } from "./shared";

export async function loadLesson(id: number): Promise<LessonDetail | null> {
  await requireAuthor();
  return fetchItem(`/api/lessons/${id}`);
}

function lessonPayload(form: FormData) {
  return {
    title: str(form, "title"),
    summary: optionalStr(form, "summary"),
    content: optionalStr(form, "content"),
    videoUrl: optionalStr(form, "videoUrl"),
    durationMinutes: Math.max(0, num(form, "durationMinutes")),
  };
}

export async function createLesson(
  _prev: FormState,
  form: FormData,
): Promise<FormState> {
  await requireAuthor();
  const courseId = str(form, "courseId");
  const payload = lessonPayload(form);

  if (!courseId) return fail("Missing course reference.");
  if (!payload.title) return fail("Give the lesson a title.");

  // `order` is deliberately not sent. The controller assigns `count + 1`, which is the
  // only place that can count without a race — two authors adding a lesson at the same
  // moment would both read "3 lessons" here and both claim position 4.
  const result = await apiFetch<ApiItem<LessonDetail>>("/api/lessons", {
    method: "POST",
    body: { ...payload, course: courseId },
  });

  if (!result.ok) return fail(result.error);

  return done(coursePaths(courseId), "Lesson added.");
}

export async function updateLesson(
  _prev: FormState,
  form: FormData,
): Promise<FormState> {
  await requireAuthor();
  const courseId = str(form, "courseId");
  const lessonId = str(form, "lessonId");
  const payload = lessonPayload(form);

  if (!lessonId) return fail("Missing lesson reference.");
  if (!payload.title) return fail("Give the lesson a title.");

  const result = await apiFetch(`/api/lessons/${lessonId}`, {
    method: "PUT",
    body: payload,
  });
  if (!result.ok) return fail(result.error);

  return done([...coursePaths(courseId), `/my-courses/${courseId}/lessons/${lessonId}`], "Lesson saved.");
}

/**
 * Delete a lesson.
 *
 * The backend also clears the `lesson_progress` rows that pointed at it, which matters
 * more than it sounds: progress is `completed / total`, so a deleted lesson that left
 * its progress rows behind could put a student above 100%.
 */
export async function deleteLesson(form: FormData) {
  await requireAuthor();
  const courseId = str(form, "courseId");
  const lessonId = str(form, "lessonId");
  if (!lessonId) return;

  const result = await apiFetch(`/api/lessons/${lessonId}`, {
    method: "DELETE",
  });

  finish(
    coursePaths(courseId),
    `/manage/courses/${courseId}`,
    result.ok ? "lesson-deleted" : "forbidden",
    !result.ok,
  );
}

/**
 * Move one lesson up or down.
 *
 * The API takes the complete desired ordering rather than "swap these two", so the
 * reordering happens here and the result is sent as one list. That is what makes the
 * write atomic: a swap expressed as two `PUT`s can leave two lessons sharing a
 * position if the second one fails.
 *
 * `lessonIds` is the field name the controller reads first (`payload.lessonIds ?? payload.order`).
 */
export async function moveLesson(form: FormData) {
  await requireAuthor();
  const courseId = str(form, "courseId");
  const lessonId = Number(str(form, "lessonId"));
  const direction = str(form, "direction") === "up" ? -1 : 1;
  // The rail renders in display order, so the current ordering is already known on the
  // page — sending it back avoids a read here just to compute the new arrangement.
  const current = str(form, "lessonIds")
    .split(",")
    .map((value) => Number(value.trim()))
    .filter((value) => Number.isInteger(value) && value > 0);

  if (!courseId || !lessonId || current.length < 2) return;

  const index = current.indexOf(lessonId);
  const target = index + direction;
  if (index === -1 || target < 0 || target >= current.length) return; // Already at the end.

  const reordered = [...current];
  [reordered[index], reordered[target]] = [reordered[target], reordered[index]];

  const result = await apiFetch("/api/lessons/reorder", {
    method: "PUT",
    body: { course: courseId, lessonIds: reordered },
  });

  if (!result.ok) {
    finish(
      coursePaths(courseId),
      `/manage/courses/${courseId}`,
      "reorder-failed",
      true,
    );
  }

  // No redirect: the author is mid-edit on this page and a full navigation would lose
  // their scroll position halfway down a long lesson list.
  refresh(coursePaths(courseId));
}

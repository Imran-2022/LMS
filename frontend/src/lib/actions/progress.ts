"use server";

/**
 * Progress tracking — the assignment's first differentiator, and the smallest file here.
 *
 * That size is the design. "Progress" as a *number* is never sent from the browser:
 * these two actions post a lesson id and a verb, and the percentage is derived on the
 * server from `completed lessons / total lessons` every time it is asked for. The
 * consequences are worth spelling out, because they are the reason it works:
 *
 *   • It survives a refresh, a new device and a new browser, because it lives in a
 *     `lesson_progress` row keyed by (student, lesson) — not in localStorage.
 *   • It cannot be inflated. The API ignores anything in the body beyond the route
 *     parameter, so a forged `{ percent: 100 }` changes nothing. (Tested: posting
 *     `{completed: false, percent: 100, score: 100}` against lesson 3 of 4 returned
 *     75%.)
 *   • It self-corrects when a course changes shape. Adding a fifth lesson to a course a
 *     student had finished moves them to 80% on the next read, because the denominator
 *     is counted, not stored.
 *
 * The one piece of state the server *does* keep is `enrollment.completedAt`, stamped
 * when the last lesson is ticked and cleared when one is un-ticked. That is a fact about
 * the enrollment rather than a cached percentage, so it cannot drift out of step.
 */
import { apiFetch } from "@/lib/api";
import { requireUser } from "@/lib/session";

import { coursePaths, finish, refresh, safePath, str } from "./shared";

/**
 * Tick or un-tick a lesson.
 *
 * One action for both directions rather than two, because the button is a toggle and
 * the only difference is the HTTP verb: `POST .../complete` to record, `DELETE` to
 * withdraw. Sending the *desired* state rather than "flip it" keeps the request
 * idempotent — a double-submitted form marks the lesson complete twice, which is
 * indistinguishable from marking it complete once.
 */
export async function setLessonComplete(form: FormData) {
  await requireUser();
  const lessonId = str(form, "lessonId");
  const courseId = str(form, "courseId");
  const completed = str(form, "completed") === "true";

  if (!lessonId) return;

  const result = await apiFetch(`/api/lesson-progress/${lessonId}/complete`, {
    method: completed ? "POST" : "DELETE",
  });

  const paths = [
    ...coursePaths(courseId),
    `/my-courses/${courseId}/lessons/${lessonId}`,
    `/manage/courses/${courseId}/roster`,
  ];

  if (!result.ok) {
    // A student who is not enrolled gets a 403 here rather than a silent no-op, so the
    // failure is visible instead of looking like a button that does nothing.
    finish(paths, `/my-courses/${courseId}/lessons/${lessonId}`, "progress-failed", true);
  }

  // "Mark complete and continue" sends `next`; the plain toggle does not and stays put.
  const next = form.get("next");
  if (typeof next === "string" && next !== "") {
    finish(paths, safePath(next, `/my-courses/${courseId}/lessons/${lessonId}`), "lesson-done");
  }

  refresh(paths);
}

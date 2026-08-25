"use server";

/**
 * Enrolling and unenrolling.
 *
 * Only Students may enrol — the route sits behind `global::is-student`, so an admin
 * clicking the button would get a 403. That is not an oversight: the assignment's
 * permission matrix gives "Enroll in a course" to Students alone, and staff accounts
 * appearing in course rosters would corrupt the completion statistics the admin
 * dashboard reports.
 */
import { apiFetch } from "@/lib/api";
import { requireUser } from "@/lib/session";

import { coursePaths, finish, safePath, str } from "./shared";

/**
 * Enrol the signed-in student in a course.
 *
 * The action takes only a course reference. There is no `student` field to forge: the
 * controller reads the student from the JWT, so the worst a crafted POST can do is
 * enrol *yourself* somewhere, which is what the button does anyway.
 *
 * Re-enrolling is safe — the controller returns the existing row rather than creating a
 * duplicate — so a double-click cannot produce two enrollments and two roster entries.
 */
export async function enroll(form: FormData) {
  await requireUser();
  const courseId = str(form, "courseId");
  if (!courseId) return;

  const result = await apiFetch("/api/enrollments", {
    method: "POST",
    body: { course: courseId },
  });

  // Straight into the course workspace on success: enrolling is only ever a step
  // towards starting lesson one.
  const destination = safePath(form.get("next"), `/my-courses/${courseId}`);

  finish(
    coursePaths(courseId),
    result.ok ? destination : `/courses/${courseId}`,
    result.ok ? "enrolled" : "enroll-failed",
    !result.ok,
  );
}

/**
 * Leave a course.
 *
 * Takes the *enrollment* id rather than the course id, because that is the row being
 * removed. The controller deletes the student's lesson-progress rows for that course
 * along with it, so re-enrolling later starts from 0% rather than inheriting a
 * half-finished record the student can no longer see.
 */
export async function unenroll(form: FormData) {
  await requireUser();
  const enrollmentId = str(form, "enrollmentId");
  const courseId = str(form, "courseId");
  if (!enrollmentId) return;

  const result = await apiFetch(`/api/enrollments/${enrollmentId}`, { method: "DELETE" });

  finish(
    coursePaths(courseId),
    "/my-courses",
    result.ok ? "unenrolled" : "forbidden",
    !result.ok,
  );
}

/**
 * Progress calculation — the single source of truth for "how far through a course
 * is this student".
 *
 * Both `POST /api/lesson-progress/:lessonId/complete` and
 * `GET /api/courses/:id/progress` call `computeCourseProgress`, so the number the
 * student sees after ticking a lesson is produced by exactly the same code as the
 * number on their dashboard. There is no second implementation to drift.
 *
 * The percentage is never sent from the browser — the client only ever says
 * "lesson X is done", and the server derives the rest.
 */
import { LESSON_PROGRESS_UID, LESSON_UID } from "./authorization";

export type CourseProgress = {
  completed: number;
  total: number;
  percent: number;
  completedLessonIds: number[];
};

/**
 * Counts a student's completed lessons against the course's total lesson count.
 *
 * Two separate counts rather than one join, because the denominator has to be
 * "lessons that exist right now". If an instructor deletes a lesson the student
 * already finished, the percentage must go back down — deriving `total` live from
 * the lesson table is what makes that automatic.
 */
export async function computeCourseProgress(
  strapi: any,
  studentId: number,
  courseId: number,
): Promise<CourseProgress> {
  const [total, completedRows] = await Promise.all([
    strapi.db.query(LESSON_UID).count({ where: { course: courseId } }),
    strapi.db.query(LESSON_PROGRESS_UID).findMany({
      where: { student: studentId, course: courseId, completed: true },
      populate: ["lesson"],
    }),
  ]);

  // A progress row whose lesson was deleted must not count towards completion,
  // otherwise a student could show 4/3 lessons done.
  const completedLessonIds: number[] = completedRows
    .map((row: any) => row.lesson?.id)
    .filter((id: number | undefined): id is number => typeof id === "number");

  const completed = completedLessonIds.length;

  return {
    completed,
    total,
    // Guard the divide: a course with no lessons yet is 0%, not NaN.
    percent: total > 0 ? Math.round((completed / total) * 100) : 0,
    completedLessonIds,
  };
}

/**
 * Batch version used by list screens ("My Courses", the instructor roster) so a
 * page showing 12 courses does not fire 24 sequential queries.
 */
export async function computeProgressForCourses(
  strapi: any,
  studentId: number,
  courseIds: number[],
): Promise<Record<number, CourseProgress>> {
  if (courseIds.length === 0) return {};

  const results = await Promise.all(
    courseIds.map((courseId) =>
      computeCourseProgress(strapi, studentId, courseId),
    ),
  );

  return courseIds.reduce<Record<number, CourseProgress>>(
    (acc, courseId, index) => {
      acc[courseId] = results[index];
      return acc;
    },
    {},
  );
}

/**
 * Lesson progress controller — the progress-tracking differentiator.
 *
 * The design in one sentence: **the database stores facts, the server computes the
 * number.** A row in `lesson_progresses` records "student 4 finished lesson 11".
 * The percentage is never written anywhere; it is recomputed from those rows by
 * `computeCourseProgress` every time it is asked for.
 *
 * That is what makes it survive a refresh, and it is why the percentage cannot
 * drift out of sync with reality: there is nothing to drift. Delete a lesson and
 * every student's percentage corrects itself on the next read.
 *
 * The client never sends a percentage — only "this lesson is done". If it tried,
 * the value would be ignored, because nothing here reads one.
 *
 * The helpers below sit at module level rather than on the controller object because
 * Strapi types a controller as a map of `(ctx, next)` handlers; a method taking
 * anything else stops the whole file type-checking.
 */
import { factories } from "@strapi/strapi";
import { errors } from "@strapi/utils";

import {
  ENROLLMENT_UID,
  LESSON_PROGRESS_UID,
  LESSON_UID,
  findEnrollment,
  requireUser,
} from "../../../utils/authorization";
import { computeCourseProgress } from "../../../utils/progress";
import { isStudent } from "../../../utils/roles";

const { ForbiddenError, NotFoundError } = errors;

/**
 * Shared guard for both write endpoints.
 *
 * Only a student can hold progress — an instructor "completing" a lesson would
 * create a progress row for a user who is not enrolled and pollute the roster.
 * And the student must actually be enrolled: otherwise anyone could farm
 * completions on courses they never joined.
 */
async function resolveContext(strapi: any, ctx: any) {
  const user = requireUser(ctx.state.user);

  if (!isStudent(user)) {
    throw new ForbiddenError("Only students have course progress.");
  }

  const key = String(ctx.params.lessonId);
  const where = /^\d+$/.test(key)
    ? { $or: [{ id: Number(key) }, { documentId: key }] }
    : { documentId: key };

  const lesson = await strapi.db
    .query(LESSON_UID)
    .findOne({ where, populate: ["course"] });
  if (!lesson || !lesson.course) throw new NotFoundError("Lesson not found.");

  const enrollment = await findEnrollment(strapi, user.id, lesson.course.id);
  if (!enrollment) {
    throw new ForbiddenError("Enroll in this course before tracking progress.");
  }

  return { user, lesson, course: lesson.course, enrollment };
}

/**
 * Creates or flips the single (student, lesson) row.
 *
 * Deliberately an upsert rather than a blind insert: marking the same lesson
 * complete twice must not produce two rows, because `computeCourseProgress`
 * counts rows. The extra delete loop is belt-and-braces for a race where two
 * requests both saw "no row" — it collapses any duplicates back to one.
 */
async function upsertProgress(
  strapi: any,
  studentId: number,
  lesson: any,
  courseId: number,
  completed: boolean,
) {
  const existing = await strapi.db.query(LESSON_PROGRESS_UID).findMany({
    where: { student: studentId, lesson: lesson.id },
    orderBy: [{ id: "asc" }],
  });

  const completedAt = completed ? new Date() : null;

  if (existing.length === 0) {
    return strapi.documents(LESSON_PROGRESS_UID).create({
      data: {
        student: studentId,
        lesson: lesson.id,
        course: courseId,
        completed,
        completedAt,
      },
    });
  }

  const [keep, ...duplicates] = existing;

  for (const duplicate of duplicates) {
    await strapi
      .documents(LESSON_PROGRESS_UID)
      .delete({ documentId: duplicate.documentId });
  }

  return strapi.documents(LESSON_PROGRESS_UID).update({
    documentId: keep.documentId,
    data: {
      completed,
      // Keep the original timestamp when re-completing, so "finished on" is the
      // first time they got there.
      completedAt: completed ? (keep.completedAt ?? completedAt) : null,
      course: courseId,
    },
  });
}

/**
 * Keeps `enrollment.completedAt` in step with the derived percentage.
 *
 * This is a cache, not a source of truth — if it were ever wrong, the percentage
 * would still be right, because that comes from the progress rows.
 */
async function syncEnrollmentCompletion(
  strapi: any,
  studentId: number,
  courseId: number,
  percent: number,
) {
  const enrollment = await strapi.db.query(ENROLLMENT_UID).findOne({
    where: { student: studentId, course: courseId },
  });

  if (!enrollment) return;

  if (percent === 100 && !enrollment.completedAt) {
    await strapi.documents(ENROLLMENT_UID).update({
      documentId: enrollment.documentId,
      data: { completedAt: new Date() },
    });
  } else if (percent < 100 && enrollment.completedAt) {
    await strapi.documents(ENROLLMENT_UID).update({
      documentId: enrollment.documentId,
      data: { completedAt: null },
    });
  }
}

export default factories.createCoreController(
  LESSON_PROGRESS_UID,
  ({ strapi }) => ({
    /**
     * POST /api/lesson-progress/:lessonId/complete
     *
     * Marks one lesson done for the calling student and returns the recalculated
     * course progress in the same response — so the UI updates from server truth
     * rather than optimistically guessing.
     */
    async complete(ctx) {
      const { lesson, course, user } = await resolveContext(strapi, ctx);

      const row = await upsertProgress(
        strapi,
        user.id,
        lesson,
        course.id,
        true,
      );

      // Recompute *after* the write, from the table, not from a counter we bumped.
      const progress = await computeCourseProgress(strapi, user.id, course.id);

      // Reaching 100% is worth recording on the enrollment so "completed courses"
      // does not have to recount every lesson for every course on the dashboard.
      await syncEnrollmentCompletion(
        strapi,
        user.id,
        course.id,
        progress.percent,
      );

      ctx.body = {
        data: {
          lessonId: lesson.id,
          completed: true,
          completedAt: row.completedAt,
          progress,
        },
      };
    },

    /**
     * DELETE /api/lesson-progress/:lessonId/complete
     *
     * Un-ticks a lesson. Included because a progress feature that can only ever count
     * upwards is not really tracking anything — and it is the quickest way to
     * demonstrate that the percentage is derived rather than stored.
     */
    async uncomplete(ctx) {
      const { lesson, course, user } = await resolveContext(strapi, ctx);

      await upsertProgress(strapi, user.id, lesson, course.id, false);

      const progress = await computeCourseProgress(strapi, user.id, course.id);
      await syncEnrollmentCompletion(
        strapi,
        user.id,
        course.id,
        progress.percent,
      );

      ctx.body = {
        data: {
          lessonId: lesson.id,
          completed: false,
          completedAt: null,
          progress,
        },
      };
    },

    /**
     * GET /api/lesson-progress/mine?courseId=123
     *
     * The set of lessons the caller has finished. Used to render tick marks in the
     * lesson rail without asking for each lesson individually.
     */
    async mine(ctx) {
      const user = requireUser(ctx.state.user);
      const where: Record<string, any> = { student: user.id, completed: true };

      if (ctx.query.courseId) {
        where.course = Number(ctx.query.courseId);
      }

      const rows = await strapi.db.query(LESSON_PROGRESS_UID).findMany({
        where,
        populate: ["lesson", "course"],
      });

      ctx.body = {
        data: rows
          .filter((row: any) => row.lesson)
          .map((row: any) => ({
            lessonId: row.lesson.id,
            courseId: row.course?.id ?? null,
            completedAt: row.completedAt,
          })),
      };
    },
  }),
);

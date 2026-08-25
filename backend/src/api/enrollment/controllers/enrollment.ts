/**
 * Enrollment controller.
 *
 * "Enroll in a course — Student only" is the one row of the matrix where every
 * staff role is ❌, so `global::is-student` guards the write routes and rejects
 * admins too. That is deliberate, not an oversight: an admin who wants the student
 * experience signs in as a student.
 *
 * The two rules worth pointing at:
 *   - `student` is always `ctx.state.user.id`. The body cannot name someone else,
 *     so nobody can enroll a third party (or un-enroll them).
 *   - Enrolling twice is idempotent, not an error. A double-click on "Enroll"
 *     should not create two rows and halve every future progress percentage.
 */
import { factories } from '@strapi/strapi';
import { errors } from '@strapi/utils';

import {
  ENROLLMENT_UID,
  LESSON_PROGRESS_UID,
  QUIZ_ATTEMPT_UID,
  findCourse,
  findEnrollment,
  requireUser,
} from '../../../utils/authorization';
import { computeCourseProgress } from '../../../utils/progress';
import { enrollmentSummary } from '../../../utils/serialize';
import { isPrivileged } from '../../../utils/roles';

const { ForbiddenError, NotFoundError, ValidationError } = errors;

function readBody(ctx: any) {
  const body = ctx.request?.body ?? {};
  return body.data ?? body;
}

export default factories.createCoreController(ENROLLMENT_UID, ({ strapi }) => ({
  /**
   * GET /api/enrollments/mine
   *
   * The "My Courses" screen. Each row carries its live progress percentage, so the
   * dashboard needs exactly one request rather than one per course.
   */
  async mine(ctx) {
    const user = requireUser(ctx.state.user);

    const enrollments = await strapi.db.query(ENROLLMENT_UID).findMany({
      where: { student: user.id },
      populate: { course: { populate: ['owner'] } },
      orderBy: [{ createdAt: 'desc' }],
    });

    const rows = await Promise.all(
      enrollments
        // An enrollment whose course was deleted is dead weight; skip rather than
        // rendering a broken card.
        .filter((enrollment: any) => Boolean(enrollment.course))
        .map(async (enrollment: any) => {
          const progress = await computeCourseProgress(strapi, user.id, enrollment.course.id);
          return enrollmentSummary(enrollment, { progress });
        })
    );

    ctx.body = {
      data: rows,
      meta: {
        total: rows.length,
        completed: rows.filter((row: any) => row.progress.percent === 100).length,
        inProgress: rows.filter((row: any) => row.progress.percent > 0 && row.progress.percent < 100).length,
      },
    };
  },

  /**
   * GET /api/enrollments
   *
   * Staff-only listing used by the admin panel. Students use `/enrollments/mine`;
   * letting them call this would leak the whole platform's enrollment table.
   */
  async find(ctx) {
    const user = requireUser(ctx.state.user);

    if (!isPrivileged(user)) {
      throw new ForbiddenError('Only administrators and content managers can list all enrollments.');
    }

    const courseKey = ctx.query.courseId as string | undefined;
    const where: Record<string, any> = {};

    if (courseKey) {
      const course = await findCourse(strapi, courseKey);
      if (!course) throw new NotFoundError('Course not found.');
      where.course = course.id;
    }

    const enrollments = await strapi.db.query(ENROLLMENT_UID).findMany({
      where,
      populate: { course: { populate: ['owner'] }, student: true },
      orderBy: [{ createdAt: 'desc' }],
      limit: 200,
    });

    ctx.body = {
      data: enrollments.map((enrollment: any) => enrollmentSummary(enrollment)),
      meta: { total: enrollments.length },
    };
  },

  /**
   * POST /api/enrollments
   *
   * Body: `{ course: <id | documentId | slug> }`.
   *
   * Three checks before a row is written: the course must exist, it must be
   * published (you cannot enroll in something an author is still drafting), and the
   * student must not already be enrolled.
   */
  async create(ctx) {
    const user = requireUser(ctx.state.user);
    const payload = readBody(ctx);

    const courseRef = payload.course ?? payload.courseId;
    const courseKey = courseRef?.id ?? courseRef?.documentId ?? courseRef;

    if (!courseKey) throw new ValidationError('A `course` reference is required.');

    const course = await findCourse(strapi, courseKey);
    if (!course) throw new NotFoundError('Course not found.');

    if (course.status !== 'published') {
      throw new ForbiddenError('This course is not open for enrollment yet.');
    }

    const existing = await findEnrollment(strapi, user.id, course.id);
    if (existing) {
      // Idempotent: hand back the row they already have instead of 409-ing, so a
      // double submit is harmless.
      const progress = await computeCourseProgress(strapi, user.id, course.id);
      ctx.body = { data: enrollmentSummary({ ...existing, course, student: user }, { progress, alreadyEnrolled: true }) };
      return;
    }

    const created = await strapi.documents(ENROLLMENT_UID).create({
      data: {
        student: user.id,
        course: course.id,
        enrolledAt: new Date(),
      },
      populate: { course: { populate: ['owner'] }, student: true },
    });

    ctx.status = 201;
    ctx.body = {
      data: enrollmentSummary(created, {
        progress: { completed: 0, total: 0, percent: 0, completedLessonIds: [] },
      }),
    };
  },

  /**
   * DELETE /api/enrollments/:id
   *
   * Un-enrolling. A student may drop their own course; staff may remove anyone's
   * enrollment. The student's progress rows and quiz attempts go with it — leaving
   * them behind would mean re-enrolling later silently restores an old percentage.
   */
  async delete(ctx) {
    const user = requireUser(ctx.state.user);
    const key = String(ctx.params.id);
    const where = /^\d+$/.test(key) ? { $or: [{ id: Number(key) }, { documentId: key }] } : { documentId: key };

    const enrollment = await strapi.db.query(ENROLLMENT_UID).findOne({
      where,
      populate: ['student', 'course'],
    });

    if (!enrollment) throw new NotFoundError('Enrollment not found.');

    const ownsIt = Number(enrollment.student?.id) === Number(user.id);
    if (!ownsIt && !isPrivileged(user)) {
      throw new ForbiddenError('You can only cancel your own enrollment.');
    }

    if (enrollment.student && enrollment.course) {
      await strapi.db.query(LESSON_PROGRESS_UID).deleteMany({
        where: { student: enrollment.student.id, course: enrollment.course.id },
      });
      await strapi.db.query(QUIZ_ATTEMPT_UID).deleteMany({
        where: { student: enrollment.student.id, course: enrollment.course.id },
      });
    }

    await strapi.documents(ENROLLMENT_UID).delete({ documentId: enrollment.documentId });

    ctx.body = { data: { id: enrollment.id, deleted: true } };
  },
}));

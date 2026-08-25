/**
 * Course controller.
 *
 * Written by hand rather than left as a stock core controller, because three of
 * the brief's rules cannot be expressed through Strapi's default CRUD:
 *
 *   1. Draft courses must be invisible to students but visible to their author.
 *   2. `owner` must come from the JWT — if the client could send it, an instructor
 *      could create a course "owned" by someone else and then edit it forever.
 *   3. Deleting a course has to clean up the enrollment / progress / attempt rows
 *      that hang off it, otherwise the admin dashboard counts drift.
 */
import { factories } from '@strapi/strapi';
import { errors } from '@strapi/utils';

import {
  COURSE_UID,
  ENROLLMENT_UID,
  LESSON_PROGRESS_UID,
  LESSON_UID,
  QUIZ_ATTEMPT_UID,
  QUIZ_UID,
  assertProgressReadAccess,
  canWriteCourse,
  findCourse,
  findEnrollment,
  requireUser,
} from '../../../utils/authorization';
import { computeCourseProgress } from '../../../utils/progress';
import { authorSummary, courseCard, courseDetail, lessonSummary } from '../../../utils/serialize';
import { isInstructor, isPrivileged, isStudent, type AuthUser } from '../../../utils/roles';

const { ForbiddenError, NotFoundError, ValidationError } = errors;

/** Fields a client is allowed to set. Anything else in the body is ignored. */
const WRITABLE_FIELDS = [
  'title',
  'slug',
  'summary',
  'description',
  'coverImageUrl',
  'category',
  'level',
  'durationMinutes',
  'status',
] as const;

function pickWritable(payload: Record<string, any> = {}) {
  return WRITABLE_FIELDS.reduce<Record<string, any>>((acc, field) => {
    if (payload[field] !== undefined) acc[field] = payload[field];
    return acc;
  }, {});
}

/** Strapi REST bodies are `{ data: {...} }`; curl during a demo often is not. */
function readBody(ctx: any) {
  const body = ctx.request?.body ?? {};
  return body.data ?? body;
}

/**
 * Who is allowed to *see* which courses.
 *
 * Anonymous visitors and students see the published catalogue. An instructor also
 * sees their own drafts (they need to be able to find what they are still writing).
 * Admin and Content Manager see everything.
 */
function visibilityFilter(user?: AuthUser | null) {
  if (isPrivileged(user)) return {};

  if (isInstructor(user) && user) {
    return { $or: [{ status: 'published' }, { owner: user.id }] };
  }

  return { status: 'published' };
}

/**
 * Adds lesson/quiz/enrollment counts to a list of courses.
 *
 * Counted rather than populated: `populate: ['lessons']` just to call `.length`
 * would pull every lesson body out of the database to render a catalogue card.
 *
 * A module-level function rather than a method on the controller because Strapi
 * types a controller object as a map of `(ctx, next)` handlers — a method with any
 * other signature makes the whole object fail to type-check.
 */
async function attachCounts(strapi: any, courses: any[]) {
  return Promise.all(
    courses.map(async (course) => {
      const [lessonCount, quizCount, enrollmentCount] = await Promise.all([
        strapi.db.query(LESSON_UID).count({ where: { course: course.id } }),
        strapi.db.query(QUIZ_UID).count({ where: { course: course.id } }),
        strapi.db.query(ENROLLMENT_UID).count({ where: { course: course.id } }),
      ]);
      return {
        ...course,
        __lessonCount: lessonCount,
        __quizCount: quizCount,
        __enrollmentCount: enrollmentCount,
      };
    })
  );
}

export default factories.createCoreController(COURSE_UID, ({ strapi }) => ({
  /**
   * GET /api/courses
   *
   * The public catalogue. Filters are read from an allow-list rather than passed
   * through to the ORM, so a crafted query string cannot reach columns the caller
   * should not be filtering on (e.g. probing which drafts exist).
   */
  async find(ctx) {
    const user = ctx.state.user as AuthUser | undefined;
    const { q, category, level, status } = ctx.query as Record<string, string | undefined>;

    const filters: Record<string, any> = { ...visibilityFilter(user) };

    if (q) {
      filters.$and = [
        {
          $or: [
            { title: { $containsi: q } },
            { summary: { $containsi: q } },
            { category: { $containsi: q } },
          ],
        },
      ];
    }
    if (category) filters.category = category;
    if (level) filters.level = level;

    // Only staff may narrow by status; for everyone else the visibility filter
    // above has already decided what they can see.
    if (status && isPrivileged(user)) filters.status = status;

    const courses = await strapi.db.query(COURSE_UID).findMany({
      where: filters,
      populate: ['owner'],
      orderBy: [{ createdAt: 'desc' }],
      limit: 100,
    });

    const withCounts = await attachCounts(strapi, courses);

    // If a student is browsing, tell the UI which cards they already own so it can
    // show "Continue" instead of "Enroll" without a second round-trip.
    let enrolledCourseIds: number[] = [];
    if (isStudent(user) && user) {
      const enrollments = await strapi.db.query(ENROLLMENT_UID).findMany({
        where: { student: user.id },
        populate: ['course'],
      });
      enrolledCourseIds = enrollments.map((e: any) => e.course?.id).filter(Boolean);
    }

    ctx.body = {
      data: withCounts.map((course) =>
        courseCard(course, {
          lessonCount: course.__lessonCount,
          quizCount: course.__quizCount,
          enrollmentCount: course.__enrollmentCount,
          isEnrolled: enrolledCourseIds.includes(course.id),
        })
      ),
      meta: { total: withCounts.length },
    };
  },

  /**
   * GET /api/courses/mine
   *
   * The authoring dashboard. An instructor gets their own courses; Admin and
   * Content Manager get every course, because the matrix lets them edit any of them.
   *
   * Registered *before* `/courses/:id` in the router — otherwise Koa would match
   * "mine" as an id.
   */
  async mine(ctx) {
    const user = requireUser(ctx.state.user);

    const where = isPrivileged(user) ? {} : { owner: user.id };

    const courses = await strapi.db.query(COURSE_UID).findMany({
      where,
      populate: ['owner'],
      orderBy: [{ updatedAt: 'desc' }],
    });

    const withCounts = await attachCounts(strapi, courses);

    ctx.body = {
      data: withCounts.map((course) =>
        courseCard(course, {
          lessonCount: course.__lessonCount,
          quizCount: course.__quizCount,
          enrollmentCount: course.__enrollmentCount,
          canEdit: canWriteCourse(user, course),
        })
      ),
      meta: { total: withCounts.length },
    };
  },

  /**
   * GET /api/courses/:id
   *
   * Accepts a numeric id, a Strapi documentId, or a slug. Returns the lesson list
   * as *summaries only* — titles and durations, never `content`. The body of a
   * lesson is served exclusively by the lesson controller, behind an enrollment
   * check.
   */
  async findOne(ctx) {
    const user = ctx.state.user as AuthUser | undefined;
    const key = String(ctx.params.id);

    const where: Record<string, any> = /^\d+$/.test(key)
      ? { $or: [{ id: Number(key) }, { documentId: key }, { slug: key }] }
      : { $or: [{ documentId: key }, { slug: key }] };

    const course = await strapi.db.query(COURSE_UID).findOne({
      where,
      populate: ['owner'],
    });

    if (!course) throw new NotFoundError('Course not found.');

    // A draft is only visible to someone who could edit it.
    if (course.status !== 'published' && !canWriteCourse(user as AuthUser, course)) {
      throw new NotFoundError('Course not found.');
    }

    const [lessons, quizzes, enrollmentCount] = await Promise.all([
      strapi.db.query(LESSON_UID).findMany({
        where: { course: course.id },
        orderBy: [{ order: 'asc' }, { id: 'asc' }],
      }),
      strapi.db.query(QUIZ_UID).findMany({
        where: { course: course.id },
        populate: ['questions'],
      }),
      strapi.db.query(ENROLLMENT_UID).count({ where: { course: course.id } }),
    ]);

    // Personalise: is the caller enrolled, and how far along are they?
    let isEnrolled = false;
    let progress = null;
    if (user && isStudent(user)) {
      const enrollment = await findEnrollment(strapi, user.id, course.id);
      isEnrolled = Boolean(enrollment);
      if (isEnrolled) {
        progress = await computeCourseProgress(strapi, user.id, course.id);
      }
    }

    ctx.body = {
      data: {
        ...courseDetail(course, {
          lessonCount: lessons.length,
          quizCount: quizzes.length,
          enrollmentCount,
          canEdit: canWriteCourse(user as AuthUser, course),
          isEnrolled,
          progress,
        }),
        lessons: lessons.map((lesson: any) => lessonSummary(lesson)),
        quizzes: quizzes.map((quiz: any) => ({
          id: quiz.id,
          documentId: quiz.documentId,
          title: quiz.title,
          description: quiz.description ?? null,
          passingScore: quiz.passingScore ?? 70,
          questionCount: quiz.questions?.length ?? 0,
        })),
      },
    };
  },

  /**
   * POST /api/courses
   *
   * Guarded by `global::can-author-courses` (Admin, Content Manager, Instructor).
   *
   * `owner` is assigned here from `ctx.state.user`, never from the body. Staff may
   * hand a course to a specific instructor; an instructor always ends up owning
   * what they create.
   */
  async create(ctx) {
    const user = requireUser(ctx.state.user);
    const payload = readBody(ctx);
    const data = pickWritable(payload);

    if (!data.title || !String(data.title).trim()) {
      throw new ValidationError('A course title is required.');
    }

    let ownerId = user.id;
    if (isPrivileged(user) && payload.owner) {
      const requested = payload.owner?.id ?? payload.owner;
      const target = await strapi.db
        .query('plugin::users-permissions.user')
        .findOne({ where: { id: Number(requested) } });
      if (!target) throw new ValidationError('The selected owner does not exist.');
      ownerId = target.id;
    }

    const status = data.status === 'published' ? 'published' : 'draft';

    const created = await strapi.documents(COURSE_UID).create({
      // `pickWritable` returns a dynamic map, so TypeScript cannot see that `title`
      // is present even though it was validated three lines up. The cast is confined
      // to this one call rather than loosening the whole controller.
      data: {
        ...data,
        status,
        publishedAt: status === 'published' ? new Date() : null,
        owner: ownerId,
      } as any,
      populate: ['owner'],
    });

    ctx.status = 201;
    ctx.body = { data: courseCard(created, { lessonCount: 0, quizCount: 0, enrollmentCount: 0 }) };
  },

  /**
   * PUT /api/courses/:id
   *
   * Ownership was already enforced by `global::owns-course-or-privileged`, which
   * leaves the loaded row on `ctx.state.course` so we do not query twice.
   */
  async update(ctx) {
    const user = requireUser(ctx.state.user);
    const course = ctx.state.course ?? (await findCourse(strapi, ctx.params.id));

    if (!course) throw new NotFoundError('Course not found.');

    const payload = readBody(ctx);
    const data = pickWritable(payload);

    // Reassigning ownership is an administrative act, not an editing one.
    if (payload.owner !== undefined) {
      if (!isPrivileged(user)) {
        throw new ForbiddenError('Only administrators and content managers can reassign a course.');
      }
      data.owner = payload.owner?.id ?? payload.owner;
    }

    // Stamp `publishedAt` the first time a course goes live, and clear it if it is
    // pulled back to draft, so "published on" is always truthful.
    if (data.status === 'published' && course.status !== 'published') {
      data.publishedAt = new Date();
    } else if (data.status === 'draft') {
      data.publishedAt = null;
    }

    const updated = await strapi.documents(COURSE_UID).update({
      documentId: course.documentId,
      data,
      populate: ['owner'],
    });

    ctx.body = { data: courseCard(updated) };
  },

  /**
   * DELETE /api/courses/:id
   *
   * Removes the dependent rows first. Strapi would happily leave orphaned
   * enrollments and progress records pointing at a deleted course, which would
   * then be counted by the admin dashboard and by `computeCourseProgress`.
   */
  async delete(ctx) {
    const course = ctx.state.course ?? (await findCourse(strapi, ctx.params.id));
    if (!course) throw new NotFoundError('Course not found.');

    const lessons = await strapi.db.query(LESSON_UID).findMany({ where: { course: course.id } });
    const quizzes = await strapi.db.query(QUIZ_UID).findMany({ where: { course: course.id } });

    await strapi.db.query(LESSON_PROGRESS_UID).deleteMany({ where: { course: course.id } });
    await strapi.db.query(QUIZ_ATTEMPT_UID).deleteMany({ where: { course: course.id } });
    await strapi.db.query(ENROLLMENT_UID).deleteMany({ where: { course: course.id } });

    for (const lesson of lessons) {
      await strapi.documents(LESSON_UID).delete({ documentId: lesson.documentId });
    }
    for (const quiz of quizzes) {
      await strapi.documents(QUIZ_UID).delete({ documentId: quiz.documentId });
    }

    await strapi.documents(COURSE_UID).delete({ documentId: course.documentId });

    ctx.body = { data: { id: course.id, deleted: true } };
  },

  /**
   * GET /api/courses/:id/progress
   *
   * A student calls this for themselves. Staff and the owning instructor may pass
   * `?studentId=` to inspect a particular learner — `assertProgressReadAccess`
   * implements exactly the "View student progress" row of the matrix.
   */
  async progress(ctx) {
    const user = requireUser(ctx.state.user);
    const course = await findCourse(strapi, ctx.params.id);
    if (!course) throw new NotFoundError('Course not found.');

    const requestedStudentId = ctx.query.studentId ? Number(ctx.query.studentId) : user.id;

    await assertProgressReadAccess(strapi, user, { course, studentId: requestedStudentId });

    const progress = await computeCourseProgress(strapi, requestedStudentId, course.id);

    ctx.body = { data: { courseId: course.id, studentId: requestedStudentId, ...progress } };
  },

  /**
   * GET /api/courses/:id/roster
   *
   * "View student progress" for a whole course: every enrolled learner with their
   * live percentage. Used by the instructor course page and the admin panel.
   */
  async roster(ctx) {
    const user = requireUser(ctx.state.user);
    const course = await findCourse(strapi, ctx.params.id);
    if (!course) throw new NotFoundError('Course not found.');

    // Students have no business reading a class list, so this reuses the write
    // rule rather than the progress rule.
    if (!canWriteCourse(user, course)) {
      throw new ForbiddenError('You cannot view the roster for this course.');
    }

    const enrollments = await strapi.db.query(ENROLLMENT_UID).findMany({
      where: { course: course.id },
      populate: ['student'],
      orderBy: [{ createdAt: 'desc' }],
    });

    const rows = await Promise.all(
      enrollments.map(async (enrollment: any) => {
        const progress = enrollment.student
          ? await computeCourseProgress(strapi, enrollment.student.id, course.id)
          : { completed: 0, total: 0, percent: 0, completedLessonIds: [] };

        const attempts = enrollment.student
          ? await strapi.db.query(QUIZ_ATTEMPT_UID).findMany({
              where: { course: course.id, student: enrollment.student.id },
              orderBy: [{ createdAt: 'desc' }],
            })
          : [];

        return {
          enrollmentId: enrollment.id,
          enrolledAt: enrollment.enrolledAt ?? enrollment.createdAt,
          completedAt: enrollment.completedAt ?? null,
          student: authorSummary(enrollment.student),
          progress,
          // The learner's best score is the useful signal for an instructor
          // scanning a roster; the full history lives on the attempts endpoint.
          bestScore: attempts.length ? Math.max(...attempts.map((a: any) => a.score ?? 0)) : null,
          attemptCount: attempts.length,
        };
      })
    );

    ctx.body = {
      data: rows,
      meta: {
        total: rows.length,
        averagePercent: rows.length
          ? Math.round(rows.reduce((sum, row) => sum + row.progress.percent, 0) / rows.length)
          : 0,
      },
    };
  },
}));

/**
 * Row-level authorization helpers.
 *
 * The permission matrix in the brief has two kinds of rule:
 *
 *   - Coarse, role-only rules ("Student cannot create courses"). Those are
 *     handled by the policies in `src/policies/`, which run before a controller
 *     is ever reached.
 *   - Row-level rules ("Instructor: own courses only", "Student: own progress
 *     only"). A role check alone cannot express those — you have to load the row
 *     and compare it to the caller. That is what this module does.
 *
 * Every helper here throws a Strapi `ForbiddenError` / `NotFoundError` instead of
 * returning a boolean, so a caller that forgets to check the result fails closed
 * rather than open.
 */
import { errors } from '@strapi/utils';

import { isPrivileged, isInstructor, isStudent, type AuthUser } from './roles';

const { ForbiddenError, NotFoundError, UnauthorizedError } = errors;

export const COURSE_UID = 'api::course.course';
export const LESSON_UID = 'api::lesson.lesson';
export const QUIZ_UID = 'api::quiz.quiz';
export const ENROLLMENT_UID = 'api::enrollment.enrollment';
export const LESSON_PROGRESS_UID = 'api::lesson-progress.lesson-progress';
export const QUIZ_ATTEMPT_UID = 'api::quiz-attempt.quiz-attempt';
export const BLOG_POST_UID = 'api::blog-post.blog-post';
export const USER_UID = 'plugin::users-permissions.user';

/** Narrows `ctx.state.user` to a definitely-present user. */
export function requireUser(user?: AuthUser | null): AuthUser {
  if (!user) {
    throw new UnauthorizedError('You must be signed in to do that.');
  }
  return user;
}

/**
 * Loads a course by documentId or numeric id.
 *
 * Strapi v5 addresses entries by `documentId` in the REST layer but relations
 * still expose numeric `id`s, and the frontend passes whichever it holds. This
 * accepts either so callers never have to care.
 */
export async function findCourse(strapi: any, idOrDocumentId: string | number, populate: string[] = ['owner']) {
  const key = String(idOrDocumentId);

  const byDocumentId = await strapi.db.query(COURSE_UID).findOne({
    where: { documentId: key },
    populate,
  });
  if (byDocumentId) return byDocumentId;

  if (/^\d+$/.test(key)) {
    return strapi.db.query(COURSE_UID).findOne({ where: { id: Number(key) }, populate });
  }

  return null;
}

/**
 * Resolves the course a lesson or quiz belongs to.
 *
 * Lessons and quizzes have no owner of their own — they inherit the permissions
 * of their parent course, so every write check on them walks up to the course
 * first.
 */
export async function findParentCourse(
  strapi: any,
  uid: typeof LESSON_UID | typeof QUIZ_UID,
  idOrDocumentId: string | number
) {
  const key = String(idOrDocumentId);
  const where = /^\d+$/.test(key) ? { $or: [{ documentId: key }, { id: Number(key) }] } : { documentId: key };

  const entity = await strapi.db.query(uid).findOne({
    where,
    populate: { course: { populate: ['owner'] } },
  });

  return entity?.course ?? null;
}

/**
 * The single ownership rule for all course content.
 *
 * Admin and Content Manager pass unconditionally. An Instructor passes only when
 * they are the course's `owner`. Everyone else — including a Student holding a
 * perfectly valid JWT — is rejected.
 *
 * `course.owner` is only present when the caller populated it, so we defensively
 * treat a missing owner as "not yours" for instructors rather than assuming
 * ownership.
 */
export function assertCourseWriteAccess(user: AuthUser, course: any): void {
  if (!course) {
    throw new NotFoundError('Course not found.');
  }

  if (isPrivileged(user)) return;

  if (isInstructor(user)) {
    const ownerId = course.owner?.id ?? course.owner;
    if (ownerId && Number(ownerId) === Number(user.id)) return;

    throw new ForbiddenError('Instructors can only modify their own courses.');
  }

  throw new ForbiddenError('Your role cannot modify course content.');
}

/** Same rule, expressed as a boolean for places that need to branch, not throw. */
export function canWriteCourse(user: AuthUser, course: any): boolean {
  try {
    assertCourseWriteAccess(user, course);
    return true;
  } catch {
    return false;
  }
}

/** Looks up the enrollment row linking a student to a course, if any. */
export async function findEnrollment(strapi: any, studentId: number, courseId: number) {
  return strapi.db.query(ENROLLMENT_UID).findOne({
    where: { student: studentId, course: courseId },
    populate: ['course'],
  });
}

/**
 * Gates access to *lesson content* and *quiz taking*.
 *
 * Course titles and descriptions are public (they are the catalogue), but the
 * actual teaching material is only readable by someone enrolled in the course —
 * or by staff who are allowed to review it. Without this, any signed-in user
 * could read every paid lesson by guessing lesson ids.
 */
export async function assertCourseReadAccess(strapi: any, user: AuthUser, course: any): Promise<void> {
  if (!course) {
    throw new NotFoundError('Course not found.');
  }

  // Staff reviewing content they are responsible for.
  if (isPrivileged(user)) return;
  if (isInstructor(user)) {
    const ownerId = course.owner?.id ?? course.owner;
    if (ownerId && Number(ownerId) === Number(user.id)) return;
    throw new ForbiddenError('You can only open lessons from your own courses.');
  }

  if (isStudent(user)) {
    const enrollment = await findEnrollment(strapi, user.id, course.id);
    if (enrollment) return;
    throw new ForbiddenError('Enroll in this course to open its lessons.');
  }

  throw new ForbiddenError('You do not have access to this course content.');
}

/**
 * "View student progress" from the matrix: Admin/Content Manager see everyone,
 * Instructor sees students in their own courses, Student sees only themselves.
 */
export async function assertProgressReadAccess(
  strapi: any,
  user: AuthUser,
  opts: { course?: any; studentId?: number }
): Promise<void> {
  if (isPrivileged(user)) return;

  if (isInstructor(user)) {
    const ownerId = opts.course?.owner?.id ?? opts.course?.owner;
    if (ownerId && Number(ownerId) === Number(user.id)) return;
    throw new ForbiddenError('You can only review progress for your own courses.');
  }

  if (isStudent(user)) {
    if (opts.studentId && Number(opts.studentId) === Number(user.id)) return;
    throw new ForbiddenError('Students can only view their own progress.');
  }

  throw new ForbiddenError('You cannot view progress records.');
}

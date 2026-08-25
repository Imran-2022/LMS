/**
 * Row-level gate for *reading* course material.
 *
 * A student may open a lesson only if an enrollment row links them to that
 * lesson's course. Staff (Admin/Content Manager) always pass; an Instructor passes
 * for their own courses.
 *
 * Without this, `GET /api/lessons/42` would hand the full lesson body to any
 * signed-in user who guessed the id — the classic "we only hid the button" bug the
 * brief warns about.
 *
 * Configured per-route the same way as `owns-course-or-privileged`:
 *   { name: 'global::is-enrolled-or-privileged', config: { resource: 'lesson' } }
 */
import { errors } from '@strapi/utils';

import {
  LESSON_UID,
  QUIZ_UID,
  assertCourseReadAccess,
  findCourse,
  findParentCourse,
} from '../utils/authorization';

type Resource = 'course' | 'lesson' | 'quiz';

export default async (
  policyContext: any,
  config: { resource?: Resource; param?: string } = {},
  { strapi }: { strapi: any }
) => {
  const user = policyContext.state?.user;

  if (!user) {
    throw new errors.UnauthorizedError('You must be signed in to do that.');
  }

  const resource: Resource = config.resource ?? 'course';
  const param = config.param ?? 'id';
  const key = policyContext.params?.[param];

  const course =
    resource === 'course'
      ? await findCourse(strapi, key)
      : await findParentCourse(strapi, resource === 'lesson' ? LESSON_UID : QUIZ_UID, key);

  if (!course) {
    throw new errors.NotFoundError('Course not found.');
  }

  // Throws ForbiddenError when the student has no enrollment row.
  await assertCourseReadAccess(strapi, user, course);

  policyContext.state.course = course;

  return true;
};

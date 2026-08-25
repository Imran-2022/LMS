/**
 * Row-level gate: "Instructor — own courses only".
 *
 * Admin and Content Manager pass unconditionally. An Instructor passes only if
 * they own the course the request targets. The course is resolved differently
 * depending on the route, so the policy is configured per-route:
 *
 *   // PUT /api/courses/:id            → the param *is* the course
 *   { name: 'global::owns-course-or-privileged', config: { resource: 'course' } }
 *
 *   // PUT /api/lessons/:id            → walk lesson → course
 *   { name: 'global::owns-course-or-privileged', config: { resource: 'lesson' } }
 *
 *   // POST /api/lessons               → the course id arrives in the body
 *   { name: 'global::owns-course-or-privileged', config: { resource: 'body' } }
 *
 * This is a thin wrapper over `assertCourseWriteAccess` in `src/utils/authorization.ts`
 * so the ownership rule itself exists in exactly one place — the policy only decides
 * *which row* to check, never *what counts as ownership*.
 */
import { errors } from '@strapi/utils';

import {
  LESSON_UID,
  QUIZ_UID,
  assertCourseWriteAccess,
  findCourse,
  findParentCourse,
} from '../utils/authorization';

type Resource = 'course' | 'lesson' | 'quiz' | 'body';

export default async (
  policyContext: any,
  config: { resource?: Resource; param?: string; bodyField?: string } = {},
  { strapi }: { strapi: any }
) => {
  const user = policyContext.state?.user;

  if (!user) {
    throw new errors.UnauthorizedError('You must be signed in to do that.');
  }

  const resource: Resource = config.resource ?? 'course';
  const param = config.param ?? 'id';
  const bodyField = config.bodyField ?? 'course';

  let course: any = null;

  if (resource === 'body') {
    // `strapi::body` puts JSON payloads under `request.body`; the REST convention
    // for Strapi is `{ data: { ... } }`, but we accept a flat body too so the
    // route is forgiving to hand-written curl requests during the demo.
    const body = policyContext.request?.body ?? {};
    const payload = body.data ?? body;
    const courseRef = payload?.[bodyField];
    const courseId = courseRef?.id ?? courseRef?.documentId ?? courseRef;

    if (!courseId) {
      throw new errors.ValidationError(`A "${bodyField}" reference is required.`);
    }

    course = await findCourse(strapi, courseId);
  } else if (resource === 'course') {
    course = await findCourse(strapi, policyContext.params?.[param]);
  } else {
    const uid = resource === 'lesson' ? LESSON_UID : QUIZ_UID;
    course = await findParentCourse(strapi, uid, policyContext.params?.[param]);
  }

  if (!course) {
    throw new errors.NotFoundError('Course not found.');
  }

  // Throws ForbiddenError for a non-owning instructor or any other role.
  assertCourseWriteAccess(user, course);

  // Hand the already-loaded row to the controller so it does not re-query.
  policyContext.state.course = course;

  return true;
};

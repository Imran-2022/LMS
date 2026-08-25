/**
 * Gate for *creating* course content.
 *
 * Creation is the one case where a role check is enough on its own: there is no
 * existing row to own yet. Admin, Content Manager and Instructor all pass; Student
 * is rejected.
 *
 * For updates and deletes this policy is not sufficient — `owns-course-or-privileged`
 * (or the equivalent check inside the controller) narrows an Instructor down to
 * their own courses. Keeping the two concerns in separate policies is what stops
 * "can create" from accidentally becoming "can edit anything".
 */
import { errors } from '@strapi/utils';

import { canAuthorCourses } from '../utils/roles';

export default (policyContext: any) => {
  const user = policyContext.state?.user;

  if (!user) {
    throw new errors.UnauthorizedError('You must be signed in to do that.');
  }

  if (!canAuthorCourses(user)) {
    throw new errors.ForbiddenError('Your role cannot create course content.');
  }

  return true;
};

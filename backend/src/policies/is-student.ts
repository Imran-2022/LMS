/**
 * "Enroll in a course — Student only" and "Take quizzes — Student only".
 *
 * Note this policy rejects Admin too, and that is intentional: the matrix marks
 * those two rows ❌ for every staff role. An admin who wants to see the student
 * experience signs in as a student account — the same rule the brief describes.
 */
import { errors } from "@strapi/utils";

import { isStudent } from "../utils/roles";

export default (policyContext: any) => {
  const user = policyContext.state?.user;

  if (!user) {
    throw new errors.UnauthorizedError("You must be signed in to do that.");
  }

  if (!isStudent(user)) {
    throw new errors.ForbiddenError(
      "Only students can enroll in courses and take quizzes.",
    );
  }

  return true;
};

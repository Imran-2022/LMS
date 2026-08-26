/**
 * Admin-only routes: user management, role assignment, platform statistics.
 *
 * This is the backend half of the "Manage users & assign roles — Admin only" row
 * of the permission matrix. The frontend also hides `/admin` from other roles, but
 * that is only cosmetic: hitting `GET /api/admin/users` with an instructor's token
 * fails here, before the controller runs.
 */
import { errors } from "@strapi/utils";

import { isAdmin } from "../utils/roles";

export default (policyContext: any) => {
  const user = policyContext.state?.user;

  if (!user) {
    throw new errors.UnauthorizedError("You must be signed in to do that.");
  }

  if (!isAdmin(user)) {
    throw new errors.ForbiddenError("Administrator access required.");
  }

  return true;
};

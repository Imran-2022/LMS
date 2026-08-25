/**
 * "Write/manage blog posts — Admin ✅, Content Manager ✅, Instructor ❌,
 * Student ❌" straight from the permission matrix.
 *
 * Reading published posts is deliberately *not* gated (the blog is public), so
 * this policy is attached only to create/update/delete and the publish toggle.
 */
import { errors } from '@strapi/utils';

import { canManageBlog } from '../utils/roles';

export default (policyContext: any) => {
  const user = policyContext.state?.user;

  if (!user) {
    throw new errors.UnauthorizedError('You must be signed in to do that.');
  }

  if (!canManageBlog(user)) {
    throw new errors.ForbiddenError('Only administrators and content managers can manage blog posts.');
  }

  return true;
};

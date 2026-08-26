/**
 * Requires a valid JWT. Nothing more.
 *
 * Strapi's users-permissions plugin already rejects unknown tokens, but a route
 * that is *publicly* readable and *privately* writable needs an explicit gate on
 * the write half — this is it.
 */
import { errors } from "@strapi/utils";

export default (policyContext: any) => {
  if (!policyContext.state?.user) {
    throw new errors.UnauthorizedError("You must be signed in to do that.");
  }
  return true;
};

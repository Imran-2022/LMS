/**
 * The platform's four roles.
 *
 * These strings are the `type` column of `plugin::users-permissions.role`, which
 * is what Strapi puts on `ctx.state.user.role.type` after it verifies a JWT.
 * Everything in the authorization layer keys off these constants so a typo can
 * never silently widen access.
 */
export const ROLES = {
  ADMIN: "admin",
  CONTENT_MANAGER: "content_manager",
  INSTRUCTOR: "instructor",
  STUDENT: "student",
} as const;

export type RoleType = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_LABELS: Record<RoleType, string> = {
  [ROLES.ADMIN]: "Admin",
  [ROLES.CONTENT_MANAGER]: "Content Manager",
  [ROLES.INSTRUCTOR]: "Instructor",
  [ROLES.STUDENT]: "Student",
};

/** Minimal shape of the authenticated user Strapi hands us on `ctx.state.user`. */
export type AuthUser = {
  id: number;
  username?: string;
  email?: string;
  role?: { id: number; type?: string; name?: string } | null;
};

/**
 * Reads the role off an authenticated user.
 *
 * `ctx.state.user.role` is populated by the users-permissions JWT middleware, but
 * a user created before the roles existed could have none — returning `null`
 * rather than throwing lets every predicate below fail closed.
 */
export function roleOf(user?: AuthUser | null): RoleType | null {
  const type = user?.role?.type;
  return type && (Object.values(ROLES) as string[]).includes(type)
    ? (type as RoleType)
    : null;
}

export const isAdmin = (user?: AuthUser | null) => roleOf(user) === ROLES.ADMIN;

export const isContentManager = (user?: AuthUser | null) =>
  roleOf(user) === ROLES.CONTENT_MANAGER;

export const isInstructor = (user?: AuthUser | null) =>
  roleOf(user) === ROLES.INSTRUCTOR;

export const isStudent = (user?: AuthUser | null) =>
  roleOf(user) === ROLES.STUDENT;

/**
 * Admin and Content Manager act platform-wide: they may touch any course, lesson
 * or quiz regardless of who created it. Used as the "skip the ownership check"
 * shortcut throughout the authorization layer.
 */
export const isPrivileged = (user?: AuthUser | null) =>
  isAdmin(user) || isContentManager(user);

/**
 * Roles allowed to author course content at all. Instructors are included here
 * but are additionally narrowed to their *own* courses by
 * `assertCourseWriteAccess` — this predicate alone is never sufficient for a
 * write on an existing course.
 */
export const canAuthorCourses = (user?: AuthUser | null) =>
  isPrivileged(user) || isInstructor(user);

/** Only Admin and Content Manager write blog posts (per the permission matrix). */
export const canManageBlog = (user?: AuthUser | null) => isPrivileged(user);

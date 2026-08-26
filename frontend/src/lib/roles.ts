/**
 * Role helpers — the frontend's copy of the permission matrix.
 *
 * An important caveat about everything in this file: **none of it is security.**
 * The real checks live in the Strapi policies and controllers, and every helper
 * here has a server-side counterpart that will reject the request regardless of
 * what the UI decided to render. These functions exist so a student is not shown
 * an "Edit course" button that would 403 when clicked — that is a usability
 * concern, not an access-control one.
 *
 * They are kept in one small file, mirroring `backend/src/utils/roles.ts`, so the
 * two can be read side by side when the matrix changes.
 */
import type { RoleType, SessionUser } from "./types";

export const ROLES = {
  ADMIN: "admin",
  CONTENT_MANAGER: "content_manager",
  INSTRUCTOR: "instructor",
  STUDENT: "student",
} as const satisfies Record<string, RoleType>;

export const ROLE_LABELS: Record<RoleType, string> = {
  admin: "Admin",
  content_manager: "Content Manager",
  instructor: "Instructor",
  student: "Student",
};

/** One-line description of each role, shown in the admin role picker. */
export const ROLE_BLURBS: Record<RoleType, string> = {
  admin: "Full control: users, roles, all content and platform statistics.",
  content_manager:
    "Creates and edits any course, lesson and quiz, and runs the blog.",
  instructor:
    "Creates and edits their own courses, and reviews their own students.",
  student: "Enrols in courses, works through lessons and takes quizzes.",
};

export function roleOf(user: SessionUser | null | undefined): RoleType | null {
  return user?.role?.type ?? null;
}

export function roleLabel(role: RoleType | null | undefined): string {
  return role ? ROLE_LABELS[role] : "Guest";
}

/** Admin or Content Manager — the two roles with platform-wide content rights. */
export function isPrivileged(role: RoleType | null): boolean {
  return role === ROLES.ADMIN || role === ROLES.CONTENT_MANAGER;
}

export function isAdmin(role: RoleType | null): boolean {
  return role === ROLES.ADMIN;
}

export function isStudent(role: RoleType | null): boolean {
  return role === ROLES.STUDENT;
}

/** Can reach `/manage` at all: "Create/edit/delete course" is ✅/✅/own-only/❌. */
export function canAuthorCourses(role: RoleType | null): boolean {
  return (
    role === ROLES.ADMIN ||
    role === ROLES.CONTENT_MANAGER ||
    role === ROLES.INSTRUCTOR
  );
}

/** "Write/manage blog posts" — ✅ ✅ ❌ ❌. */
export function canManageBlog(role: RoleType | null): boolean {
  return role === ROLES.ADMIN || role === ROLES.CONTENT_MANAGER;
}

/**
 * Whether this user may edit a specific course.
 *
 * The row-level half of the matrix: an instructor's ✅ is "own only", so the
 * answer depends on the course, not just the role. Compare
 * `canWriteCourse` in `backend/src/utils/authorization.ts` — same rule, and the
 * backend's copy is the one that counts.
 */
export function canEditCourse(
  user: SessionUser | null,
  course: { owner?: { id: number } | null } | null,
): boolean {
  const role = roleOf(user);
  if (!user || !role) return false;
  if (isPrivileged(role)) return true;
  if (role === ROLES.INSTRUCTOR) return course?.owner?.id === user.id;
  return false;
}

/**
 * Where a user lands after signing in.
 *
 * Each role gets dropped into the screen that is actually theirs, rather than
 * everyone landing on a generic dashboard with most of it greyed out.
 */
export function homePathFor(role: RoleType | null): string {
  switch (role) {
    case ROLES.ADMIN:
      return "/admin";
    case ROLES.CONTENT_MANAGER:
    case ROLES.INSTRUCTOR:
      return "/manage/courses";
    case ROLES.STUDENT:
      return "/my-courses";
    default:
      return "/courses";
  }
}

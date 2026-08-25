/**
 * Roles and permissions, defined in code.
 *
 * A fresh Strapi install has no idea what an "Instructor" is, and its permission
 * table starts empty — every endpoint is 403 until someone ticks the right boxes in
 * Settings → Roles. There are roughly forty boxes here. Doing that by hand once is
 * tedious; doing it again on a Railway deploy with a fresh database is how a working
 * project arrives broken at review.
 *
 * So the permission matrix from the brief lives here as data, and `syncRoles()` runs
 * on every boot to make the database match. Two consequences worth knowing:
 *
 *   - `git diff` on this file is a diff of who can call what.
 *   - This file *wins*. Extra permissions ticked by hand in the admin UI are removed
 *     on the next restart, so the code and the running system cannot drift apart.
 *
 * Note this is the coarse layer. It answers "may this role call this endpoint at
 * all?". The row-level questions — *which* course, *whose* progress — are answered
 * afterwards by the policies in `src/policies/`.
 */
import { ROLES, ROLE_LABELS, type RoleType } from '../utils/roles';

const ROLE_UID = 'plugin::users-permissions.role';
const PERMISSION_UID = 'plugin::users-permissions.permission';

/** Turns `('course', ['find', 'create'])` into fully-qualified action strings. */
const api = (name: string, actions: string[]) => actions.map((action) => `api::${name}.${name}.${action}`);

const ROLE_DESCRIPTIONS: Record<RoleType, string> = {
  [ROLES.ADMIN]: 'Full control: users, roles, all content, blog and platform statistics.',
  [ROLES.CONTENT_MANAGER]: 'Creates and edits any course, lesson and quiz, and manages the blog.',
  [ROLES.INSTRUCTOR]: 'Creates and edits their own courses, and reviews their own students.',
  [ROLES.STUDENT]: 'Enrols in courses, works through lessons and takes quizzes.',
};

// ---------------------------------------------------------------------------
// Reusable groups, so each role below reads like a sentence
// ---------------------------------------------------------------------------

/** Browsing the catalogue and reading the blog. Available to everyone, signed in or not. */
const PUBLIC_READS = [
  ...api('course', ['find', 'findOne']),
  ...api('blog-post', ['find', 'findOne']),
];

/** Signing up, signing in, and reading your own account. */
const AUTH_ENDPOINTS = [
  'plugin::users-permissions.auth.callback',
  'plugin::users-permissions.auth.register',
  'plugin::users-permissions.auth.forgotPassword',
  'plugin::users-permissions.auth.resetPassword',
  'plugin::users-permissions.auth.emailConfirmation',
  'plugin::users-permissions.auth.sendEmailConfirmation',
];

const ACCOUNT_ENDPOINTS = [
  'plugin::users-permissions.user.me',
  'plugin::users-permissions.auth.changePassword',
  // Our own profile endpoint. See the note on `platform.me` for why the plugin's
  // `/users/me` is not enough: it sanitizes the `role` relation away.
  ...api('platform', ['me']),
];

/** Full authoring rights over course content — the shape of the ✅ column for staff. */
const COURSE_AUTHORING = [
  ...api('course', ['find', 'findOne', 'mine', 'create', 'update', 'delete', 'progress', 'roster']),
  ...api('lesson', ['find', 'findOne', 'create', 'update', 'delete', 'reorder']),
  ...api('quiz', ['find', 'findOne', 'create', 'update', 'delete']),
  // Reviewing results. Narrowed to own courses inside the controller for instructors.
  ...api('quiz-attempt', ['find']),
];

const BLOG_AUTHORING = api('blog-post', ['find', 'findOne', 'create', 'update', 'delete', 'setStatus']);

const PLATFORM_ADMIN = api('platform', [
  'stats',
  'listRoles',
  'listUsers',
  'setUserRole',
  'setUserStatus',
  'deleteUser',
  'listCourses',
]);

/**
 * The permission matrix.
 *
 * Read this against the table in the brief:
 *
 *   Action                        | Admin | Content Manager | Instructor | Student
 *   Manage users & assign roles   |  ✅   |       ❌        |     ❌     |   ❌     → PLATFORM_ADMIN
 *   Create/edit/delete any course |  ✅   |       ✅        |  own only  |   ❌     → COURSE_AUTHORING
 *   Add/edit/delete lessons       |  ✅   |       ✅        | own courses|   ❌     → COURSE_AUTHORING
 *   Create quizzes                |  ✅   |       ✅        | own courses|   ❌     → COURSE_AUTHORING
 *   View student progress         |  ✅   |       ✅        | own courses| own only → course.progress / roster
 *   Write/manage blog posts       |  ✅   |       ✅        |     ❌     |   ❌     → BLOG_AUTHORING
 *   Enrol in a course             |  ❌   |       ❌        |     ❌     |   ✅     → enrollment.create
 *   Take quizzes                  |  ❌   |       ❌        |     ❌     |   ✅     → quiz-attempt.create
 *
 * The "own only" cells are the same endpoint as the ✅ cell — an instructor may call
 * `PUT /api/courses/:id`, they just cannot get past `owns-course-or-privileged` on
 * someone else's course. Endpoint access and row access are separate layers on purpose.
 *
 * Note what is *absent*: no staff role has `enrollment.create` or
 * `quiz-attempt.create`. Those two rows are ❌ for everyone except Student, so an
 * admin token is rejected before it even reaches the `is-student` policy.
 */
const PERMISSION_MATRIX: Record<RoleType | 'public', string[]> = {
  public: [...PUBLIC_READS, ...AUTH_ENDPOINTS],

  [ROLES.ADMIN]: [
    ...PUBLIC_READS,
    ...ACCOUNT_ENDPOINTS,
    ...COURSE_AUTHORING,
    ...BLOG_AUTHORING,
    ...PLATFORM_ADMIN,
    // Admins moderate enrolments (remove them) and read the full list, but cannot
    // create one for themselves — see the matrix note above.
    ...api('enrollment', ['find', 'delete']),
    ...api('lesson-progress', ['mine']),
  ],

  [ROLES.CONTENT_MANAGER]: [
    ...PUBLIC_READS,
    ...ACCOUNT_ENDPOINTS,
    ...COURSE_AUTHORING,
    ...BLOG_AUTHORING,
    ...api('enrollment', ['find', 'delete']),
  ],

  [ROLES.INSTRUCTOR]: [
    ...PUBLIC_READS,
    ...ACCOUNT_ENDPOINTS,
    ...COURSE_AUTHORING,
    // Read-only on the blog: "Write/manage blog posts" is ❌ for instructors.
  ],

  [ROLES.STUDENT]: [
    ...PUBLIC_READS,
    ...ACCOUNT_ENDPOINTS,
    // Reading course material they are enrolled in.
    ...api('course', ['find', 'findOne', 'progress']),
    ...api('lesson', ['find', 'findOne']),
    ...api('quiz', ['find', 'findOne']),
    // The two student-only rows of the matrix.
    ...api('enrollment', ['mine', 'create', 'delete']),
    ...api('quiz-attempt', ['mine', 'create']),
    // Progress tracking.
    ...api('lesson-progress', ['mine', 'complete', 'uncomplete']),
  ],
};

/** Creates the role if it is missing, and keeps its label in step with the code. */
async function ensureRole(strapi: any, type: RoleType) {
  const name = ROLE_LABELS[type];
  const description = ROLE_DESCRIPTIONS[type];

  const existing = await strapi.db.query(ROLE_UID).findOne({ where: { type } });

  if (existing) {
    if (existing.name !== name || existing.description !== description) {
      await strapi.db.query(ROLE_UID).update({
        where: { id: existing.id },
        data: { name, description },
      });
    }
    return existing;
  }

  strapi.log.info(`[bootstrap] creating role "${name}" (${type})`);
  return strapi.db.query(ROLE_UID).create({ data: { name, description, type } });
}

/**
 * Makes the permission rows for one role exactly match `actions`.
 *
 * In users-permissions a permission is granted purely by a row existing, so this is
 * a set difference in both directions: insert what is missing, delete what is extra.
 */
async function syncRolePermissions(strapi: any, roleId: number, roleLabel: string, actions: string[]) {
  const wanted = new Set(actions);

  const existing = await strapi.db.query(PERMISSION_UID).findMany({
    where: { role: roleId },
  });
  const held = new Set(existing.map((permission: any) => permission.action));

  let granted = 0;
  for (const action of wanted) {
    if (!held.has(action)) {
      await strapi.db.query(PERMISSION_UID).create({ data: { action, role: roleId } });
      granted += 1;
    }
  }

  let revoked = 0;
  for (const permission of existing) {
    if (!wanted.has(permission.action)) {
      await strapi.db.query(PERMISSION_UID).delete({ where: { id: permission.id } });
      revoked += 1;
    }
  }

  if (granted || revoked) {
    strapi.log.info(`[bootstrap] ${roleLabel}: +${granted} / -${revoked} permissions`);
  }
}

/**
 * Points `advanced.default_role` at Student.
 *
 * Out of the box, anyone who signs up becomes `authenticated`, which has no
 * permissions in this project — they would log in successfully and then get 403 on
 * every page. Every public sign-up is a learner, so Student is the correct default,
 * and an admin promotes people from the admin panel afterwards.
 */
async function setDefaultRegistrationRole(strapi: any) {
  const store = strapi.store({ type: 'plugin', name: 'users-permissions' });
  const advanced = (await store.get({ key: 'advanced' })) ?? {};

  if (advanced.default_role === ROLES.STUDENT && advanced.allow_register === true) return;

  await store.set({
    key: 'advanced',
    value: { ...advanced, default_role: ROLES.STUDENT, allow_register: true },
  });

  strapi.log.info(`[bootstrap] default role for new sign-ups set to "${ROLES.STUDENT}"`);
}

/** Entry point called from `src/index.ts` on every boot. */
export async function syncRolesAndPermissions(strapi: any) {
  // The four application roles.
  for (const type of Object.values(ROLES)) {
    const role = await ensureRole(strapi, type);
    await syncRolePermissions(strapi, role.id, ROLE_LABELS[type], PERMISSION_MATRIX[type]);
  }

  // Plus Strapi's built-in `public` role, which is what an anonymous visitor gets.
  const publicRole = await strapi.db.query(ROLE_UID).findOne({ where: { type: 'public' } });
  if (publicRole) {
    await syncRolePermissions(strapi, publicRole.id, 'Public', PERMISSION_MATRIX.public);
  }

  await setDefaultRegistrationRole(strapi);
}

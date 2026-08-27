/**
 * Platform controller — the admin panel's backend.
 *
 * The folder is called `platform`, not `admin`, on purpose: `admin::` is Strapi's own
 * internal namespace for the CMS panel, and an `src/api/admin` folder collides with
 * it in confusing ways. The *routes* still live at `/api/admin/...` as specified —
 * a route path and a folder name are independent.
 *
 * Every route here is behind `global::is-admin`. This is the "Manage users & assign
 * roles — Admin only" row of the matrix, and it is enforced at the route, so an
 * instructor's token gets 403 from `GET /api/admin/users` no matter what the
 * frontend renders.
 */
import { errors } from "@strapi/utils";

import {
  BLOG_POST_UID,
  COURSE_UID,
  ENROLLMENT_UID,
  LESSON_PROGRESS_UID,
  LESSON_UID,
  QUIZ_ATTEMPT_UID,
  QUIZ_UID,
  USER_UID,
  requireUser,
} from "../../../utils/authorization";
import { ROLES, ROLE_LABELS, type RoleType } from "../../../utils/roles";
import { courseCard, publicUser } from "../../../utils/serialize";

const { ForbiddenError, NotFoundError, ValidationError } = errors;

const ROLE_UID = "plugin::users-permissions.role";

function readBody(ctx: any) {
  const body = ctx.request?.body ?? {};
  return body.data ?? body;
}

export default ({ strapi }: { strapi: any }) => ({
  /** POST /api/auth/register with the application's required profile fields. */
  async register(ctx: any) {
    const body = readBody(ctx);
    const username =
      typeof body.username === "string" ? body.username.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const fullName =
      typeof body.fullName === "string" ? body.fullName.trim() : "";
    const mobileNumber =
      typeof body.mobileNumber === "string" ? body.mobileNumber.trim() : "";

    if (!username || !email || !password || !fullName || !mobileNumber) {
      throw new ValidationError(
        "Email, password, full name, and mobile number are required.",
      );
    }

    const existing = await strapi.db.query(USER_UID).findOne({
      where: { $or: [{ email }, { username }] },
    });
    if (existing)
      throw new ValidationError("Email or username is already taken.");

    const studentRole = await strapi.db
      .query(ROLE_UID)
      .findOne({ where: { type: "student" } });
    if (!studentRole)
      throw new ValidationError("Student role is not configured.");

    const user = await strapi.plugin("users-permissions").service("user").add({
      username,
      email,
      password,
      fullName,
      mobileNumber,
      provider: "local",
      confirmed: true,
      blocked: false,
      role: studentRole.id,
    });
    const jwt = strapi
      .plugin("users-permissions")
      .service("jwt")
      .issue({ id: user.id });

    ctx.body = { jwt, user: publicUser(user) };
  },

  /**
   * GET /api/me
   *
   * The signed-in user's own profile, including their role.
   *
   * This exists because the stock `GET /api/users/me` is not usable for it: that
   * handler pushes its response through content-API sanitization, which strips the
   * `role` relation for any caller who lacks permission to read the role collection
   * — i.e. everyone. The frontend needs the role on every request to pick a
   * dashboard, so it gets a purpose-built endpoint instead of a plugin workaround.
   *
   * The response is still built from the `publicUser` allow-list, so nothing extra
   * leaks. Guarded by `global::is-authenticated`, not `is-admin` like the rest of
   * this file — a role gate here would defeat the point.
   *
   * Note the role is read from the database rather than from `ctx.state.user`: if an
   * admin changes someone's role mid-session, the next page load reflects it instead
   * of trusting a stale token.
   */
  async me(ctx: any) {
    const actor = requireUser(ctx.state.user);

    const user = await strapi.db.query(USER_UID).findOne({
      where: { id: actor.id },
      populate: ["role"],
    });

    if (!user) throw new NotFoundError("User not found.");

    ctx.body = { data: publicUser(user) };
  },

  /**
   * GET /api/admin/stats
   *
   * Everything the admin dashboard needs in one request. Counts are done with `count()`
   * rather than `findMany().length` so the database does the counting instead of
   * shipping every row to Node.
   */
  async stats(ctx: any) {
    const [
      totalCourses,
      publishedCourses,
      totalLessons,
      totalQuizzes,
      totalEnrollments,
      completedEnrollments,
      totalAttempts,
      totalPosts,
      publishedPosts,
      completedLessons,
    ] = await Promise.all([
      strapi.db.query(COURSE_UID).count(),
      strapi.db.query(COURSE_UID).count({ where: { status: "published" } }),
      strapi.db.query(LESSON_UID).count(),
      strapi.db.query(QUIZ_UID).count(),
      strapi.db.query(ENROLLMENT_UID).count(),
      strapi.db
        .query(ENROLLMENT_UID)
        .count({ where: { completedAt: { $notNull: true } } }),
      strapi.db.query(QUIZ_ATTEMPT_UID).count(),
      strapi.db.query(BLOG_POST_UID).count(),
      strapi.db.query(BLOG_POST_UID).count({ where: { status: "published" } }),
      strapi.db
        .query(LESSON_PROGRESS_UID)
        .count({ where: { completed: true } }),
    ]);

    // Users are fetched (not counted) because the breakdown needs each user's role.
    const users = await strapi.db
      .query(USER_UID)
      .findMany({ populate: ["role"] });

    const usersByRole = Object.values(ROLES).reduce<Record<string, number>>(
      (acc, role) => {
        acc[role] = 0;
        return acc;
      },
      {},
    );

    for (const user of users) {
      const type = user.role?.type;
      if (type && type in usersByRole) usersByRole[type] += 1;
    }

    const attempts = await strapi.db
      .query(QUIZ_ATTEMPT_UID)
      .findMany({ limit: 500 });

    const recentEnrollments = await strapi.db.query(ENROLLMENT_UID).findMany({
      populate: { student: true, course: true },
      orderBy: [{ createdAt: "desc" }],
      limit: 6,
    });

    const recentPosts = await strapi.db.query(BLOG_POST_UID).findMany({
      populate: ["author"],
      orderBy: [{ createdAt: "desc" }],
      limit: 5,
    });

    ctx.body = {
      data: {
        users: {
          total: users.length,
          byRole: usersByRole,
          blocked: users.filter((user: any) => user.blocked).length,
        },
        courses: {
          total: totalCourses,
          published: publishedCourses,
          drafts: totalCourses - publishedCourses,
        },
        content: { lessons: totalLessons, quizzes: totalQuizzes },
        learning: {
          enrollments: totalEnrollments,
          completedEnrollments,
          lessonsCompleted: completedLessons,
          // Platform-wide completion rate, guarded against divide-by-zero on a fresh
          // install where nothing has been enrolled yet.
          completionRate: totalEnrollments
            ? Math.round((completedEnrollments / totalEnrollments) * 100)
            : 0,
        },
        quizzes: {
          attempts: totalAttempts,
          averageScore: attempts.length
            ? Math.round(
                attempts.reduce(
                  (sum: number, a: any) => sum + (a.score ?? 0),
                  0,
                ) / attempts.length,
              )
            : 0,
          passRate: attempts.length
            ? Math.round(
                (attempts.filter((a: any) => a.passed).length /
                  attempts.length) *
                  100,
              )
            : 0,
        },
        blog: {
          total: totalPosts,
          published: publishedPosts,
          drafts: totalPosts - publishedPosts,
        },
        recent: {
          enrollments: recentEnrollments
            .filter(
              (enrollment: any) => enrollment.student && enrollment.course,
            )
            .map((enrollment: any) => ({
              id: enrollment.id,
              studentName:
                enrollment.student.fullName ?? enrollment.student.username,
              courseTitle: enrollment.course.title,
              enrolledAt: enrollment.enrolledAt ?? enrollment.createdAt,
            })),
          posts: recentPosts.map((post: any) => ({
            id: post.id,
            title: post.title,
            slug: post.slug,
            status: post.status,
            authorName: post.author?.fullName ?? post.author?.username ?? null,
            createdAt: post.createdAt,
          })),
        },
      },
    };
  },

  /**
   * GET /api/admin/users
   *
   * The user table. Every row goes through `publicUser`, which builds the response
   * from an allow-list — so the password hash and the reset tokens sitting in the same
   * database row cannot leak into the admin panel.
   */
  async listUsers(ctx: any) {
    const { q, role } = ctx.query as Record<string, string | undefined>;

    const filters: Record<string, any> = {};

    if (q) {
      filters.$or = [
        { username: { $containsi: q } },
        { email: { $containsi: q } },
        { fullName: { $containsi: q } },
      ];
    }
    if (role) filters.role = { type: role };

    const users = await strapi.db.query(USER_UID).findMany({
      where: filters,
      populate: ["role"],
      orderBy: [{ createdAt: "desc" }],
      limit: 200,
    });

    // Attach the numbers that make the table useful without a request per row.
    const rows = await Promise.all(
      users.map(async (user: any) => {
        const [enrollments, ownedCourses] = await Promise.all([
          strapi.db
            .query(ENROLLMENT_UID)
            .count({ where: { student: user.id } }),
          strapi.db.query(COURSE_UID).count({ where: { owner: user.id } }),
        ]);
        return {
          ...publicUser(user),
          enrollmentCount: enrollments,
          ownedCourseCount: ownedCourses,
        };
      }),
    );

    ctx.body = { data: rows, meta: { total: rows.length } };
  },

  /**
   * GET /api/admin/roles
   *
   * Feeds the role dropdown. Returned from the database rather than hard-coded in the
   * frontend so the ids the UI submits are always real.
   */
  async listRoles(ctx: any) {
    const roles = await strapi.db.query(ROLE_UID).findMany({
      where: { type: { $in: Object.values(ROLES) } },
    });

    ctx.body = {
      data: roles.map((role: any) => ({
        id: role.id,
        type: role.type,
        name: role.name ?? ROLE_LABELS[role.type as RoleType] ?? role.type,
        description: role.description ?? null,
      })),
    };
  },

  /**
   * PUT /api/admin/users/:id/role
   *
   * Body: `{ "role": "instructor" }` (a role `type`) or `{ "role": 3 }` (a role id).
   *
   * Two guards worth calling out:
   *   - Only the four application roles can be assigned, so nobody can be moved into
   *     Strapi's `public` role and end up in a broken state.
   *   - An admin cannot demote themselves. Locking the last admin out of the panel is
   *     unrecoverable without database access, so the API refuses.
   */
  async setUserRole(ctx: any) {
    const actor = requireUser(ctx.state.user);
    const targetId = Number(ctx.params.id);
    const payload = readBody(ctx);

    const requested = payload.role ?? payload.roleType ?? payload.roleId;
    if (requested === undefined || requested === null || requested === "") {
      throw new ValidationError("A `role` is required.");
    }

    const target = await strapi.db.query(USER_UID).findOne({
      where: { id: targetId },
      populate: ["role"],
    });
    if (!target) throw new NotFoundError("User not found.");

    if (Number(target.id) === Number(actor.id)) {
      throw new ForbiddenError("You cannot change your own role.");
    }

    const role = await this.resolveRole(requested);

    const updated = await strapi.db.query(USER_UID).update({
      where: { id: target.id },
      data: { role: role.id },
      populate: ["role"],
    });

    strapi.log.info(
      `[admin] ${actor.username ?? actor.id} set user ${target.id} role to ${role.type}`,
    );

    ctx.body = { data: publicUser(updated) };
  },

  /**
   * PUT /api/admin/users/:id/status
   *
   * Blocks or unblocks an account. Blocking is preferable to deleting for moderation —
   * the users-permissions auth strategy rejects a blocked user's token immediately,
   * but their enrollments and progress survive if they are reinstated.
   */
  async setUserStatus(ctx: any) {
    const actor = requireUser(ctx.state.user);
    const targetId = Number(ctx.params.id);
    const payload = readBody(ctx);

    const target = await strapi.db
      .query(USER_UID)
      .findOne({ where: { id: targetId } });
    if (!target) throw new NotFoundError("User not found.");

    if (Number(target.id) === Number(actor.id)) {
      throw new ForbiddenError("You cannot block your own account.");
    }

    const blocked =
      payload.blocked === undefined
        ? !target.blocked
        : Boolean(payload.blocked);

    const updated = await strapi.db.query(USER_UID).update({
      where: { id: target.id },
      data: { blocked },
      populate: ["role"],
    });

    ctx.body = { data: publicUser(updated) };
  },

  /**
   * DELETE /api/admin/users/:id
   *
   * Removes the account and everything that only makes sense with it — enrollments,
   * progress rows, quiz attempts. Courses and blog posts they authored are *kept* and
   * left ownerless rather than deleted, because destroying a course because its
   * instructor left would take every enrolled student's progress with it.
   */
  async deleteUser(ctx: any) {
    const actor = requireUser(ctx.state.user);
    const targetId = Number(ctx.params.id);

    if (Number(targetId) === Number(actor.id)) {
      throw new ForbiddenError("You cannot delete your own account.");
    }

    const target = await strapi.db
      .query(USER_UID)
      .findOne({ where: { id: targetId } });
    if (!target) throw new NotFoundError("User not found.");

    await strapi.db
      .query(LESSON_PROGRESS_UID)
      .deleteMany({ where: { student: target.id } });
    await strapi.db
      .query(QUIZ_ATTEMPT_UID)
      .deleteMany({ where: { student: target.id } });
    await strapi.db
      .query(ENROLLMENT_UID)
      .deleteMany({ where: { student: target.id } });

    await strapi.db.query(USER_UID).delete({ where: { id: target.id } });

    ctx.body = { data: { id: target.id, deleted: true } };
  },

  /**
   * GET /api/admin/courses
   *
   * Every course including drafts, with the numbers the admin content table shows.
   * The public catalogue endpoint deliberately hides drafts, so the admin panel needs
   * its own unfiltered view.
   */
  async listCourses(ctx: any) {
    const courses = await strapi.db.query(COURSE_UID).findMany({
      populate: ["owner"],
      orderBy: [{ createdAt: "desc" }],
      limit: 200,
    });

    const rows = await Promise.all(
      courses.map(async (course: any) => {
        const [lessonCount, quizCount, enrollmentCount] = await Promise.all([
          strapi.db.query(LESSON_UID).count({ where: { course: course.id } }),
          strapi.db.query(QUIZ_UID).count({ where: { course: course.id } }),
          strapi.db
            .query(ENROLLMENT_UID)
            .count({ where: { course: course.id } }),
        ]);

        return courseCard(course, {
          lessonCount,
          quizCount,
          enrollmentCount,
        });
      }),
    );

    ctx.body = { data: rows, meta: { total: rows.length } };
  },

  /** Accepts a role `type` string or a numeric role id, and rejects anything else. */
  async resolveRole(requested: unknown) {
    const allowed = Object.values(ROLES) as string[];

    if (typeof requested === "string" && allowed.includes(requested)) {
      const role = await strapi.db
        .query(ROLE_UID)
        .findOne({ where: { type: requested } });
      if (!role)
        throw new ValidationError(
          `Role "${requested}" has not been created yet.`,
        );
      return role;
    }

    const asId = Number(requested);
    if (Number.isInteger(asId) && asId > 0) {
      const role = await strapi.db
        .query(ROLE_UID)
        .findOne({ where: { id: asId } });
      if (!role) throw new NotFoundError("Role not found.");
      if (!allowed.includes(role.type)) {
        throw new ValidationError(
          "Only the four application roles can be assigned.",
        );
      }
      return role;
    }

    throw new ValidationError(
      `\`role\` must be one of: ${allowed.join(", ")}.`,
    );
  },
});

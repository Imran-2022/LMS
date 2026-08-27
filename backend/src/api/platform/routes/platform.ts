/**
 * Platform (admin panel) routes.
 *
 * Paths keep the `/api/admin/...` shape from the spec even though the folder is
 * `platform` — see the note at the top of the controller for why the folder was
 * renamed.
 *
 * Every `/admin/...` route carries `global::is-admin`, so no other role can reach any
 * of them. The one exception is `GET /api/me`, which is deliberately open to every
 * signed-in user — it lives here because it shares this controller's serializer.
 */
export default {
  routes: [
    {
      method: "POST",
      path: "/auth/register",
      handler: "platform.register",
      config: { auth: false },
    },
    {
      // The one route in this file that is not admin-only: every signed-in user needs
      // to be able to read their own profile and role.
      method: "GET",
      path: "/me",
      handler: "platform.me",
      config: { policies: ["global::is-authenticated"] },
    },
    {
      method: "GET",
      path: "/admin/stats",
      handler: "platform.stats",
      config: { policies: ["global::is-admin"] },
    },
    {
      method: "GET",
      path: "/admin/roles",
      handler: "platform.listRoles",
      config: { policies: ["global::is-admin"] },
    },
    {
      method: "GET",
      path: "/admin/users",
      handler: "platform.listUsers",
      config: { policies: ["global::is-admin"] },
    },
    {
      method: "POST",
      path: "/admin/users",
      handler: "platform.createUser",
      config: { policies: ["global::is-admin"] },
    },
    {
      method: "PUT",
      path: "/admin/users/:id/role",
      handler: "platform.setUserRole",
      config: { policies: ["global::is-admin"] },
    },
    {
      method: "PUT",
      path: "/admin/users/:id/status",
      handler: "platform.setUserStatus",
      config: { policies: ["global::is-admin"] },
    },
    {
      method: "DELETE",
      path: "/admin/users/:id",
      handler: "platform.deleteUser",
      config: { policies: ["global::is-admin"] },
    },
    {
      method: "GET",
      path: "/admin/courses",
      handler: "platform.listCourses",
      config: { policies: ["global::is-admin"] },
    },
  ],
};

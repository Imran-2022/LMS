/**
 * Strapi lifecycle hooks.
 *
 * The important line in this file is `syncRolesAndPermissions`. A fresh Strapi
 * database has no application roles and an empty permission table, so without this
 * every endpoint returns 403 until somebody opens Settings → Roles and ticks about
 * forty boxes. That is fine once on a laptop and unacceptable on a Railway deploy
 * that rebuilds from an empty volume.
 *
 * Running it on *every* boot, not just the first, is deliberate: the permission
 * matrix in `bootstrap/permissions.ts` is the single source of truth, and each start
 * reconciles the database back to it.
 */
import { syncRolesAndPermissions } from "./bootstrap/permissions";
import { seedDemoData } from "./bootstrap/seed";

export default {
  /**
   * Runs before the application is initialised. Nothing needs to happen here — the
   * content types and policies are picked up from the filesystem — but the hook is
   * kept so the two phases stay visible.
   */
  register() {},

  /**
   * Runs once the application is initialised and the database is reachable.
   *
   * Order matters: roles have to exist before the seed can assign one to a user.
   *
   * Failures are logged rather than thrown. A permission sync that fails should not
   * take the whole API down — a running server with stale permissions is easier to
   * diagnose from the logs than a crash loop on Railway.
   */
  async bootstrap({ strapi }: { strapi: any }) {
    try {
      await syncRolesAndPermissions(strapi);
    } catch (error) {
      strapi.log.error("[bootstrap] role/permission sync failed");
      strapi.log.error(error);
    }

    try {
      await seedDemoData(strapi);
    } catch (error) {
      strapi.log.error("[bootstrap] demo seed failed");
      strapi.log.error(error);
    }
  },
};

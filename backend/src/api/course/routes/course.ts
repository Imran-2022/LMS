import { factories } from "@strapi/strapi";
export default factories.createCoreRouter("api::course.course" as any, {
  config: {
    update: { policies: ["global::is-course-owner-or-privileged"] },
    delete: { policies: ["global::is-course-owner-or-privileged"] },
  },
});

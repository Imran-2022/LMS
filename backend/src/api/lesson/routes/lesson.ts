import { factories } from "@strapi/strapi";
export default factories.createCoreRouter("api::lesson.lesson" as any, {
  config: {
    findOne: { policies: ["global::is-enrolled-or-privileged"] },
    create: { policies: ["global::is-course-owner-or-privileged"] },
    update: { policies: ["global::is-course-owner-or-privileged"] },
    delete: { policies: ["global::is-course-owner-or-privileged"] },
  },
});

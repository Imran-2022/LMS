import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::enrollment.enrollment",
  ({ strapi }) => ({
    async create(ctx: any) {
      const user = ctx.state.user;
      if (!user) return ctx.unauthorized();
      const courseId =
        ctx.request.body?.data?.course || ctx.request.body?.courseId;
      if (!courseId) return ctx.badRequest("courseId is required");
      const course = await strapi.db
        .query("api::course.course")
        .findOne({ where: { id: courseId } });
      if (!course) return ctx.notFound();
      const existing = await strapi.db
        .query("api::enrollment.enrollment")
        .findOne({ where: { student: user.id, course: courseId } });
      if (existing) return existing;
      return strapi.db.query("api::enrollment.enrollment").create({
        data: { student: user.id, course: courseId, enrolledAt: new Date() },
      });
    },
  }),
);

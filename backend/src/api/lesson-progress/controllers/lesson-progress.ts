import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::lesson-progress.lesson-progress",
  ({ strapi }) => ({
    async complete(ctx: any, next: any) {
      const user = ctx.state.user;
      if (!user) return ctx.unauthorized();
      const lesson = await strapi.db
        .query("api::lesson.lesson")
        .findOne({ where: { id: ctx.params.lessonId }, populate: ["course"] });
      if (!lesson) return ctx.notFound();
      const existing = await strapi.db
        .query("api::lesson-progress.lesson-progress")
        .findOne({ where: { student: user.id, lesson: lesson.id } });
      const data = {
        student: user.id,
        lesson: lesson.id,
        course: lesson.course.id,
        completed: true,
        completedAt: new Date(),
      };
      if (existing)
        await strapi.db
          .query("api::lesson-progress.lesson-progress")
          .update({ where: { id: existing.id }, data });
      else
        await strapi.db
          .query("api::lesson-progress.lesson-progress")
          .create({ data });
      return this.courseProgress(
        { ...ctx, params: { id: lesson.course.id } },
        next,
      );
    },
    async courseProgress(ctx: any, next: any) {
      const user = ctx.state.user;
      if (!user) return ctx.unauthorized();
      const total = await strapi.db
        .query("api::lesson.lesson")
        .count({ where: { course: ctx.params.id } });
      const completed = await strapi.db
        .query("api::lesson-progress.lesson-progress")
        .count({
          where: { student: user.id, course: ctx.params.id, completed: true },
        });
      return {
        completed,
        total,
        percent: total ? Math.round((completed / total) * 100) : 0,
      };
    },
  }),
);

/**
 * Lesson progress routes.
 *
 * All three require a signed-in user; the student-only and enrolled-only rules are
 * enforced in `resolveContext` rather than in a policy, because both write routes
 * need the loaded lesson and enrollment anyway — checking there avoids querying the
 * same two rows twice per request.
 */
export default {
  routes: [
    {
      method: "GET",
      path: "/lesson-progress/mine",
      handler: "lesson-progress.mine",
      config: {
        policies: ["global::is-authenticated"],
      },
    },
    {
      method: "POST",
      path: "/lesson-progress/:lessonId/complete",
      handler: "lesson-progress.complete",
      config: {
        policies: ["global::is-student"],
      },
    },
    {
      method: "DELETE",
      path: "/lesson-progress/:lessonId/complete",
      handler: "lesson-progress.uncomplete",
      config: {
        policies: ["global::is-student"],
      },
    },
  ],
};

export default {
  routes: [
    {
      method: "POST",
      path: "/lesson-progress/:lessonId/complete",
      handler: "lesson-progress.complete",
      type: "content-api",
      config: { policies: ["global::is-enrolled-or-privileged"] },
    },
  ],
};

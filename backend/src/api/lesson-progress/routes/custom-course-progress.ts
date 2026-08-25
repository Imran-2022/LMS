export default {
  routes: [
    {
      method: "GET",
      path: "/courses/:id/progress",
      handler: "lesson-progress.courseProgress",
      type: "content-api",
      info: { type: "content-api" },
      config: { policies: ["global::is-enrolled-or-privileged"] },
    },
  ],
};

export default {
  routes: [
    {
      method: "POST",
      path: "/enrollments",
      handler: "enrollment.create",
      type: "content-api",
      info: { type: "content-api" },
      config: {},
    },
  ],
};

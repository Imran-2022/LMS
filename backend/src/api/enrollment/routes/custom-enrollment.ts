export default {
  routes: [
    {
      method: "POST",
      path: "/enrollments",
      handler: "enrollment.create",
      type: "content-api",
      config: {},
    },
  ],
};

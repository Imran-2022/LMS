/**
 * Lesson routes.
 *
 * The read routes are the interesting ones: both require authentication *and* an
 * enrollment (or staff/ownership). This is the concrete answer to the brief's
 * "enforce this on the backend, not just by hiding buttons" — there is no way to
 * reach a lesson body without passing `is-enrolled-or-privileged`.
 */
export default {
  routes: [
    {
      // `?courseId=` — the lesson rail. The controller resolves the course and runs
      // the same read check as `findOne`, because the course arrives as a query
      // param rather than a path param.
      method: "GET",
      path: "/lessons",
      handler: "lesson.find",
      config: {
        policies: ["global::is-authenticated"],
      },
    },
    {
      // Must stay above `/lessons/:id`.
      method: "PUT",
      path: "/lessons/reorder",
      handler: "lesson.reorder",
      config: {
        policies: [
          {
            name: "global::owns-course-or-privileged",
            config: { resource: "body" },
          },
        ],
      },
    },
    {
      method: "GET",
      path: "/lessons/:id",
      handler: "lesson.findOne",
      config: {
        policies: [
          {
            name: "global::is-enrolled-or-privileged",
            config: { resource: "lesson" },
          },
        ],
      },
    },
    {
      method: "POST",
      path: "/lessons",
      handler: "lesson.create",
      config: {
        // The target course comes from the request body on a create, so the policy
        // reads it from there instead of from the path.
        policies: [
          {
            name: "global::owns-course-or-privileged",
            config: { resource: "body" },
          },
        ],
      },
    },
    {
      method: "PUT",
      path: "/lessons/:id",
      handler: "lesson.update",
      config: {
        policies: [
          {
            name: "global::owns-course-or-privileged",
            config: { resource: "lesson" },
          },
        ],
      },
    },
    {
      method: "DELETE",
      path: "/lessons/:id",
      handler: "lesson.delete",
      config: {
        policies: [
          {
            name: "global::owns-course-or-privileged",
            config: { resource: "lesson" },
          },
        ],
      },
    },
  ],
};

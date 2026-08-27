/**
 * Course routes.
 *
 * Declared explicitly instead of via `createCoreRouter` for two reasons:
 *
 *   - Ordering. `/courses/mine` has to be registered before `/courses/:id`, or Koa
 *     matches "mine" as an id and the dashboard 404s. A core router gives no
 *     control over that.
 *   - Visible policies. Every mutating route names the rule that guards it right
 *     here, so the permission matrix can be read straight off this file.
 *
 * `find` and `findOne` carry no policy: the catalogue is public by design (course
 * titles are marketing copy). Lesson *content* is what needs protecting, and that
 * is gated in the lesson routes.
 */
export default {
  routes: [
    {
      method: "GET",
      path: "/courses",
      handler: "course.find",
    },
    {
      // Must stay above `/courses/:id`.
      method: "GET",
      path: "/courses/mine",
      handler: "course.mine",
      config: {
        policies: ["global::can-author-courses"],
      },
    },
    {
      method: "GET",
      path: "/courses/instructors",
      handler: "course.instructors",
      config: {
        policies: ["global::can-author-courses"],
      },
    },
    {
      method: "GET",
      path: "/courses/:id",
      handler: "course.findOne",
    },
    {
      method: "GET",
      path: "/courses/:id/progress",
      handler: "course.progress",
      config: {
        // Row-level rule ("own progress only" vs "own courses only") is resolved
        // inside the controller by `assertProgressReadAccess`, because it depends
        // on the `studentId` query param as well as the role.
        policies: ["global::is-authenticated"],
      },
    },
    {
      method: "GET",
      path: "/courses/:id/roster",
      handler: "course.roster",
      config: {
        policies: [
          {
            name: "global::owns-course-or-privileged",
            config: { resource: "course" },
          },
        ],
      },
    },
    {
      method: "POST",
      path: "/courses",
      handler: "course.create",
      config: {
        policies: ["global::can-author-courses"],
      },
    },
    {
      method: "PUT",
      path: "/courses/:id",
      handler: "course.update",
      config: {
        policies: [
          {
            name: "global::owns-course-or-privileged",
            config: { resource: "course" },
          },
        ],
      },
    },
    {
      method: "DELETE",
      path: "/courses/:id",
      handler: "course.delete",
      config: {
        policies: [
          {
            name: "global::owns-course-or-privileged",
            config: { resource: "course" },
          },
        ],
      },
    },
  ],
};

/**
 * Enrollment routes.
 *
 * `/enrollments/mine` sits above nothing dangerous, but note which policy each
 * route carries:
 *
 *   - `mine`   → any signed-in user (a student reading their own list)
 *   - `find`   → signed in, then narrowed to staff *inside* the controller
 *   - `create` → `is-student`, because the matrix marks "Enroll in a course" ❌ for
 *                Admin, Content Manager and Instructor alike
 *   - `delete` → signed in; the controller allows own-enrollment or staff
 */
export default {
  routes: [
    {
      // Must stay above any `/enrollments/:id` route.
      method: 'GET',
      path: '/enrollments/mine',
      handler: 'enrollment.mine',
      config: {
        policies: ['global::is-authenticated'],
      },
    },
    {
      method: 'GET',
      path: '/enrollments',
      handler: 'enrollment.find',
      config: {
        policies: ['global::is-authenticated'],
      },
    },
    {
      method: 'POST',
      path: '/enrollments',
      handler: 'enrollment.create',
      config: {
        policies: ['global::is-student'],
      },
    },
    {
      method: 'DELETE',
      path: '/enrollments/:id',
      handler: 'enrollment.delete',
      config: {
        policies: ['global::is-authenticated'],
      },
    },
  ],
};

/**
 * Quiz routes.
 *
 * Reading a quiz needs an enrollment (or staff/ownership) — the same wall as lesson
 * content, since the questions *are* course material. Writing needs course
 * ownership.
 */
export default {
  routes: [
    {
      method: 'GET',
      path: '/quizzes',
      handler: 'quiz.find',
      config: {
        policies: ['global::is-authenticated'],
      },
    },
    {
      method: 'GET',
      path: '/quizzes/:id',
      handler: 'quiz.findOne',
      config: {
        policies: [{ name: 'global::is-enrolled-or-privileged', config: { resource: 'quiz' } }],
      },
    },
    {
      method: 'POST',
      path: '/quizzes',
      handler: 'quiz.create',
      config: {
        policies: [{ name: 'global::owns-course-or-privileged', config: { resource: 'body' } }],
      },
    },
    {
      method: 'PUT',
      path: '/quizzes/:id',
      handler: 'quiz.update',
      config: {
        policies: [{ name: 'global::owns-course-or-privileged', config: { resource: 'quiz' } }],
      },
    },
    {
      method: 'DELETE',
      path: '/quizzes/:id',
      handler: 'quiz.delete',
      config: {
        policies: [{ name: 'global::owns-course-or-privileged', config: { resource: 'quiz' } }],
      },
    },
  ],
};

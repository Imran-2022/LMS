/**
 * Quiz attempt routes.
 *
 * `create` carries `global::is-student` because "Take quizzes" is ❌ for every staff
 * role in the matrix. `find` is the staff/instructor results view and narrows itself
 * by ownership inside the controller.
 */
export default {
  routes: [
    {
      // Must stay above any `/quiz-attempts/:id` route.
      method: 'GET',
      path: '/quiz-attempts/mine',
      handler: 'quiz-attempt.mine',
      config: {
        policies: ['global::is-authenticated'],
      },
    },
    {
      method: 'GET',
      path: '/quiz-attempts',
      handler: 'quiz-attempt.find',
      config: {
        policies: ['global::is-authenticated'],
      },
    },
    {
      method: 'POST',
      path: '/quiz-attempts',
      handler: 'quiz-attempt.create',
      config: {
        policies: ['global::is-student'],
      },
    },
  ],
};

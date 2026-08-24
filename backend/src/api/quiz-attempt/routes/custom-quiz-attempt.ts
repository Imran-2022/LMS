export default { routes: [{ method: 'POST', path: '/quiz-attempts', handler: 'quiz-attempt.create', config: { policies: ['global::is-enrolled-or-privileged'] } }] };

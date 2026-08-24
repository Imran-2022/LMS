export default { routes: [{ method: 'GET', path: '/courses/:id/progress', handler: 'lesson-progress.courseProgress', config: { policies: ['global::is-enrolled-or-privileged'] } }] };

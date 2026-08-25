export default ({ env }) => ({
  rest: {
    prefix: '/api',
    defaultLimit: 25,
    maxLimit: 100,
    withCount: true,
  },
});

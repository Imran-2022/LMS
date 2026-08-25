export default ({ env }) => ({
  'users-permissions': {
    config: {
      jwtSecret: env('JWT_SECRET'),
      jwt: {
        // Learners stay signed in for a week; the frontend stores this token in
        // an httpOnly cookie so client-side JavaScript can never read it.
        expiresIn: env('JWT_EXPIRES_IN', '7d'),
      },
    },
  },
});

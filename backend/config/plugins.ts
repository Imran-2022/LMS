export default ({ env }: { env: (key: string, fallback?: string) => string }) => ({
  upload: { config: {} },
  'users-permissions': { config: { jwtSecret: env('JWT_SECRET', 'lms-jwt-secret') } },
});

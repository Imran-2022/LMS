export default ({
  env,
}: {
  env: (key: string, fallback?: string) => string;
}) => ({
  rest: {
    prefix: env("API_REST_PREFIX", "/api"),
  },
});

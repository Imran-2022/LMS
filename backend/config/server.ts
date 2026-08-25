/**
 * Server config.
 *
 * Railway injects PORT at runtime, so it is never hard-coded. APP_KEYS is a
 * comma-separated list used to sign session cookies — generate fresh values per
 * environment (see README) and never reuse the local development defaults.
 */
export default ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  app: {
    keys: env.array('APP_KEYS'),
  },
  // Strapi needs to know its public origin to build correct absolute URLs for
  // uploaded assets and admin redirects once it sits behind Railway's proxy.
  url: env('PUBLIC_URL', ''),
  proxy: env.bool('IS_PROXIED', true),
});

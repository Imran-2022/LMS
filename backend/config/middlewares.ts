/**
 * Middleware stack.
 *
 * This is Strapi's default stack with one deliberate change: CORS is restricted
 * to the origins listed in `FRONTEND_URLS` instead of the `*` default, so the
 * deployed Railway API only answers browser calls coming from our own Vercel
 * deployment (and localhost during development).
 */
export default ({ env }) => {
  const frontendUrls = env.array('FRONTEND_URLS', [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ]) as string[];

  return [
    'strapi::logger',
    'strapi::errors',
    {
      name: 'strapi::security',
      config: {
        contentSecurityPolicy: {
          useDefaults: true,
          directives: {
            'connect-src': ["'self'", 'https:'],
            // Cover images are pasted in as URLs, so remote hosts must be allowed
            // for the Strapi admin preview to render them.
            'img-src': ["'self'", 'data:', 'blob:', 'https:'],
            'media-src': ["'self'", 'data:', 'blob:', 'https:'],
            upgradeInsecureRequests: null,
          },
        },
      },
    },
    {
      name: 'strapi::cors',
      config: {
        origin: frontendUrls,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
        headers: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
        credentials: true,
      },
    },
    'strapi::poweredBy',
    'strapi::query',
    'strapi::body',
    'strapi::session',
    'strapi::favicon',
    'strapi::public',
  ];
};

/**
 * Database config.
 *
 * Two supported shapes:
 *   1. `DATABASE_URL` — what Railway's Postgres plugin injects. Preferred in
 *      production; SSL is enabled with `rejectUnauthorized: false` because
 *      Railway terminates TLS with its own internal CA.
 *   2. Discrete `DATABASE_HOST` / `DATABASE_PORT` / ... vars — used locally.
 *
 * Falling back to sqlite keeps `npm run develop` working on a machine with no
 * Postgres installed, which makes the project easy for a reviewer to clone
 * and run.
 */
import path from 'path';

export default ({ env }) => {
  const client = env('DATABASE_CLIENT', 'postgres');

  const connections = {
    postgres: () => {
      const connectionString = env('DATABASE_URL');

      // Railway / Heroku style single-URL connection.
      if (connectionString) {
        return {
          connection: {
            connectionString,
            ssl: env.bool('DATABASE_SSL', true) ? { rejectUnauthorized: false } : false,
          },
          pool: { min: env.int('DATABASE_POOL_MIN', 0), max: env.int('DATABASE_POOL_MAX', 10) },
        };
      }

      return {
        connection: {
          host: env('DATABASE_HOST', 'localhost'),
          port: env.int('DATABASE_PORT', 5432),
          database: env('DATABASE_NAME', 'lms'),
          user: env('DATABASE_USERNAME', 'postgres'),
          password: env('DATABASE_PASSWORD', 'postgres'),
          schema: env('DATABASE_SCHEMA', 'public'),
          ssl: env.bool('DATABASE_SSL', false) ? { rejectUnauthorized: false } : false,
        },
        pool: { min: env.int('DATABASE_POOL_MIN', 0), max: env.int('DATABASE_POOL_MAX', 10) },
      };
    },
    sqlite: () => ({
      connection: {
        filename: path.join(__dirname, '..', env('DATABASE_FILENAME', '.tmp/data.db')),
      },
      useNullAsDefault: true,
    }),
  };

  const resolve = connections[client];

  if (!resolve) {
    throw new Error(`Unsupported DATABASE_CLIENT "${client}". Use "postgres" or "sqlite".`);
  }

  return {
    connection: {
      client,
      ...resolve(),
      acquireConnectionTimeout: env.int('DATABASE_CONNECTION_TIMEOUT', 60000),
    },
  };
};

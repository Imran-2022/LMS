export default ({
  env,
}: {
  env: (key: string, fallback?: string) => string;
}) => ({
  auth: {
    secret: env("ADMIN_JWT_SECRET"),
  },
  apiToken: {
    salt: env("API_TOKEN_SALT"),
  },
  secrets: {
    encryptionKey: env("ADMIN_ENCRYPTION_KEY"),
  },
  transfer: {
    token: {
      salt: env("TRANSFER_TOKEN_SALT"),
    },
  },
});

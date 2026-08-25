export default ({
  env,
}: {
  env: (key: string, fallback?: string) => string;
}) => ({
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

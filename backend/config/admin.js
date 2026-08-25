"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ({ env, }) => ({
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

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ({ env, }) => ({
    upload: { config: {} },
    "users-permissions": {
        config: { jwtSecret: env("JWT_SECRET", "lms-jwt-secret") },
    },
});

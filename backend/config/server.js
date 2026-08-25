"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ({ env, }) => ({
    host: env("HOST", "0.0.0.0"),
    port: env("PORT", "1337"),
    app: { keys: env("APP_KEYS", "lms-key-1,lms-key-2").split(",") },
});

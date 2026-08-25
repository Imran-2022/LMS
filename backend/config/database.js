"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ({ env, }) => ({
    connection: {
        client: "postgres",
        connection: {
            host: env("DATABASE_HOST", "localhost"),
            port: env("DATABASE_PORT", "5432"),
            database: env("DATABASE_NAME", "lms"),
            user: env("DATABASE_USERNAME", "postgres"),
            password: env("DATABASE_PASSWORD", "postgres"),
            ssl: env("DATABASE_SSL") === "true" ? { rejectUnauthorized: false } : false,
        },
    },
});

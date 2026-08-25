"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    routes: [
        {
            method: "POST",
            path: "/quiz-attempts",
            handler: "quiz-attempt.create",
            type: "content-api",
            info: { type: "content-api" },
            config: { policies: ["global::is-enrolled-or-privileged"] },
        },
    ],
};

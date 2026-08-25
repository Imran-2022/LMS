"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    routes: [
        {
            method: "POST",
            path: "/lesson-progress/:lessonId/complete",
            handler: "lesson-progress.complete",
            type: "content-api",
            info: { type: "content-api" },
            config: { policies: ["global::is-enrolled-or-privileged"] },
        },
    ],
};

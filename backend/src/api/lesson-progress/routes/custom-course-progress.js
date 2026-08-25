"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    routes: [
        {
            method: "GET",
            path: "/courses/:id/progress",
            handler: "lesson-progress.courseProgress",
            config: { policies: ["global::is-enrolled-or-privileged"] },
        },
    ],
};

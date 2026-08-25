"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    routes: [
        {
            method: "POST",
            path: "/enrollments",
            handler: "enrollment.create",
            type: "content-api",
            info: { type: "content-api" },
            config: {},
        },
    ],
};

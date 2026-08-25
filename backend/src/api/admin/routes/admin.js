"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    routes: [
        {
            method: "GET",
            path: "/admin/stats",
            handler: "admin.stats",
            type: "content-api",
            config: { policies: ["global::is-admin"] },
        },
    ],
};

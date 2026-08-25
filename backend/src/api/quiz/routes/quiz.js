"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const strapi_1 = require("@strapi/strapi");
exports.default = strapi_1.factories.createCoreRouter("api::quiz.quiz", {
    config: {
        create: { policies: ["global::is-course-owner-or-privileged"] },
        update: { policies: ["global::is-course-owner-or-privileged"] },
        delete: { policies: ["global::is-course-owner-or-privileged"] },
    },
});

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const strapi_1 = require("@strapi/strapi");
exports.default = strapi_1.factories.createCoreRouter("api::course.course", {
    config: {
        update: { policies: ["global::is-course-owner-or-privileged"] },
        delete: { policies: ["global::is-course-owner-or-privileged"] },
    },
});

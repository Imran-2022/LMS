"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ({ strapi }) => ({
    async stats(ctx) {
        const users = await strapi.db
            .query("plugin::users-permissions.user")
            .findMany({ populate: ["role"] });
        const usersByRole = users.reduce((result, user) => {
            const role = user.role?.type || "unknown";
            result[role] = (result[role] || 0) + 1;
            return result;
        }, {});
        return {
            usersByRole,
            totalCourses: await strapi.db.query("api::course.course").count(),
            totalEnrollments: await strapi.db
                .query("api::enrollment.enrollment")
                .count(),
        };
    },
});

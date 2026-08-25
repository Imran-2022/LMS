"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const strapi_1 = require("@strapi/strapi");
exports.default = strapi_1.factories.createCoreController("api::quiz-attempt.quiz-attempt", ({ strapi }) => ({
    async create(ctx) {
        const user = ctx.state.user;
        if (!user)
            return ctx.unauthorized();
        const { quizId, answers } = ctx.request.body || {};
        const quiz = await strapi.db
            .query("api::quiz.quiz")
            .findOne({ where: { id: quizId }, populate: ["questions"] });
        if (!quiz || !Array.isArray(answers))
            return ctx.badRequest("quizId and answers are required");
        const score = quiz.questions.reduce((total, question, index) => total + (answers[index] === question.correctOptionIndex ? 1 : 0), 0);
        const attempt = await strapi.db
            .query("api::quiz-attempt.quiz-attempt")
            .create({
            data: {
                student: user.id,
                quiz: quizId,
                answers,
                score,
                submittedAt: new Date(),
            },
        });
        return { id: attempt.id, score, total: quiz.questions.length };
    },
}));

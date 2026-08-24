import { factories } from '@strapi/strapi';
export default factories.createCoreRouter('api::quiz.quiz', { config: { create: { policies: ['global::is-course-owner-or-privileged'] }, update: { policies: ['global::is-course-owner-or-privileged'] }, delete: { policies: ['global::is-course-owner-or-privileged'] } } });

import { factories } from '@strapi/strapi';
export default factories.createCoreRouter('api::blog-post.blog-post', { config: { create: { policies: ['global::is-admin'] }, update: { policies: ['global::is-admin'] }, delete: { policies: ['global::is-admin'] } } });

/**
 * Blog post controller — the draft/published differentiator.
 *
 * Two rules from the brief drive this file:
 *
 *   1. "Only published posts are visible to students/public" and "anyone can read
 *      published posts". So `find`/`findOne` are open routes, and the *visibility
 *      filter* — not authentication — is what hides drafts. An anonymous visitor and
 *      a signed-in student get byte-identical responses.
 *
 *   2. "Admin should have full control over every post." A Content Manager may write
 *      and manage posts, but only the ones they authored; an Admin may edit or delete
 *      anyone's. That distinction is `assertPostWriteAccess` below, and it is the
 *      reason the blog needs its own ownership check rather than reusing the course one.
 */
import { factories } from '@strapi/strapi';
import { errors } from '@strapi/utils';

import { BLOG_POST_UID, requireUser } from '../../../utils/authorization';
import { blogPostCard, blogPostDetail } from '../../../utils/serialize';
import { canManageBlog, isAdmin, type AuthUser } from '../../../utils/roles';
import { uniqueSlug } from '../../../utils/slug';

const { ForbiddenError, NotFoundError, ValidationError } = errors;

const WRITABLE_FIELDS = [
  'title',
  'excerpt',
  'body',
  'coverImageUrl',
  'tags',
  'readingMinutes',
  'status',
] as const;

function pickWritable(payload: Record<string, any> = {}) {
  return WRITABLE_FIELDS.reduce<Record<string, any>>((acc, field) => {
    if (payload[field] !== undefined) acc[field] = payload[field];
    return acc;
  }, {});
}

function readBody(ctx: any) {
  const body = ctx.request?.body ?? {};
  return body.data ?? body;
}

/**
 * Who may edit or delete an existing post.
 *
 * Admin: anything. Content Manager: only their own. Everyone else was already turned
 * away by the `global::can-manage-blog` policy on the route, so reaching here as an
 * instructor or student is impossible — the final throw is a safety net, not a
 * expected path.
 */
function assertPostWriteAccess(user: AuthUser, post: any): void {
  if (!post) throw new NotFoundError('Post not found.');

  if (isAdmin(user)) return;

  if (canManageBlog(user)) {
    const authorId = post.author?.id ?? post.author;
    if (authorId && Number(authorId) === Number(user.id)) return;
    throw new ForbiddenError('Content managers can only edit posts they wrote.');
  }

  throw new ForbiddenError('Your role cannot manage blog posts.');
}

export default factories.createCoreController(BLOG_POST_UID, ({ strapi }) => ({
  /**
   * GET /api/blog-posts
   *
   * Public. Returns published posts only, newest first.
   *
   * `?status=` and `?mine=1` are honoured **only** for callers who can manage the
   * blog — that is how the same endpoint serves both the public blog index and the
   * `/admin/blog` table without a second route to keep in sync.
   */
  async find(ctx) {
    const user = ctx.state.user as AuthUser | undefined;
    const staff = canManageBlog(user);
    const { q, status, mine, tag } = ctx.query as Record<string, string | undefined>;

    const filters: Record<string, any> = {};

    if (!staff) {
      // The whole visibility rule, in one line.
      filters.status = 'published';
    } else if (status === 'draft' || status === 'published') {
      filters.status = status;
    }

    if (staff && mine === '1' && user) filters.author = user.id;
    if (q) {
      filters.$or = [{ title: { $containsi: q } }, { excerpt: { $containsi: q } }];
    }
    if (tag) filters.tags = { $containsi: tag };

    const posts = await strapi.db.query(BLOG_POST_UID).findMany({
      where: filters,
      populate: ['author'],
      // Published posts sort by their publish date; drafts have none, so fall back to
      // creation order for the admin table.
      orderBy: [{ publishedDate: 'desc' }, { createdAt: 'desc' }],
      limit: 100,
    });

    ctx.body = {
      data: posts.map((post: any) => ({
        ...blogPostCard(post),
        canEdit: staff && user ? isAdmin(user) || Number(post.author?.id) === Number(user.id) : false,
      })),
      meta: { total: posts.length },
    };
  },

  /**
   * GET /api/blog-posts/:slug
   *
   * Public, addressed by slug (or id, so the admin table can link by either). A draft
   * is a 404 for everyone except someone allowed to edit it — 404 rather than 403 so
   * the existence of an unpublished post is not leaked.
   */
  async findOne(ctx) {
    const user = ctx.state.user as AuthUser | undefined;
    const key = String(ctx.params.id);

    const where: Record<string, any> = /^\d+$/.test(key)
      ? { $or: [{ id: Number(key) }, { documentId: key }, { slug: key }] }
      : { $or: [{ slug: key }, { documentId: key }] };

    const post = await strapi.db.query(BLOG_POST_UID).findOne({ where, populate: ['author'] });

    if (!post) throw new NotFoundError('Post not found.');

    if (post.status !== 'published') {
      const maySee = user && (isAdmin(user) || (canManageBlog(user) && Number(post.author?.id) === Number(user.id)));
      if (!maySee) throw new NotFoundError('Post not found.');
    }

    ctx.body = {
      data: {
        ...blogPostDetail(post),
        canEdit: Boolean(
          user && (isAdmin(user) || (canManageBlog(user) && Number(post.author?.id) === Number(user.id)))
        ),
      },
    };
  },

  /**
   * POST /api/blog-posts
   *
   * Guarded by `global::can-manage-blog`. `author` comes from the JWT, and the slug is
   * derived from the title so the public URL exists from the moment the post does.
   */
  async create(ctx) {
    const user = requireUser(ctx.state.user);
    const payload = readBody(ctx);
    const data = pickWritable(payload);

    const title = String(data.title ?? '').trim();
    if (!title) throw new ValidationError('A post title is required.');

    const status = data.status === 'published' ? 'published' : 'draft';

    const created = await strapi.documents(BLOG_POST_UID).create({
      data: {
        ...data,
        title,
        slug: await uniqueSlug(strapi, BLOG_POST_UID, payload.slug || title),
        status,
        publishedDate: status === 'published' ? new Date() : null,
        author: user.id,
      },
      populate: ['author'],
    });

    ctx.status = 201;
    ctx.body = { data: { ...blogPostDetail(created), canEdit: true } };
  },

  /** PUT /api/blog-posts/:id — Admin any post, Content Manager their own. */
  async update(ctx) {
    const user = requireUser(ctx.state.user);
    const post = await this.loadForWrite(ctx);

    assertPostWriteAccess(user, post);

    const payload = readBody(ctx);
    const data = pickWritable(payload);

    if (data.title !== undefined) {
      const title = String(data.title).trim();
      if (!title) throw new ValidationError('A post title is required.');
      data.title = title;
    }

    // Only re-slug when explicitly asked. Silently changing the URL because someone
    // fixed a typo in the title would break every link to the post.
    if (payload.slug) {
      data.slug = await uniqueSlug(strapi, BLOG_POST_UID, payload.slug, post.id);
    }

    if (data.status === 'published' && post.status !== 'published') {
      data.publishedDate = new Date();
    } else if (data.status === 'draft') {
      data.publishedDate = null;
    }

    const updated = await strapi.documents(BLOG_POST_UID).update({
      documentId: post.documentId,
      data,
      populate: ['author'],
    });

    ctx.body = { data: { ...blogPostDetail(updated), canEdit: true } };
  },

  /**
   * POST /api/blog-posts/:id/publish
   *
   * Body: `{ "status": "published" | "draft" }`.
   *
   * A dedicated endpoint rather than a plain `PUT` because publishing is a distinct
   * action in the UI (one toggle in a table row) and deserves to be one request that
   * cannot accidentally carry a half-edited body with it.
   */
  async setStatus(ctx) {
    const user = requireUser(ctx.state.user);
    const post = await this.loadForWrite(ctx);

    assertPostWriteAccess(user, post);

    const payload = readBody(ctx);
    // Default to toggling, so the frontend can fire this with an empty body.
    const requested = payload.status ?? (post.status === 'published' ? 'draft' : 'published');

    if (requested !== 'draft' && requested !== 'published') {
      throw new ValidationError('`status` must be either "draft" or "published".');
    }

    const updated = await strapi.documents(BLOG_POST_UID).update({
      documentId: post.documentId,
      data: {
        status: requested,
        // Preserve the original publish date on re-publish so the byline does not
        // jump forward every time a typo is fixed.
        publishedDate: requested === 'published' ? (post.publishedDate ?? new Date()) : null,
      },
      populate: ['author'],
    });

    ctx.body = { data: { ...blogPostCard(updated), canEdit: true } };
  },

  /** DELETE /api/blog-posts/:id — Admin any post, Content Manager their own. */
  async delete(ctx) {
    const user = requireUser(ctx.state.user);
    const post = await this.loadForWrite(ctx);

    assertPostWriteAccess(user, post);

    await strapi.documents(BLOG_POST_UID).delete({ documentId: post.documentId });

    ctx.body = { data: { id: post.id, deleted: true } };
  },

  /** Loads a post by id, documentId or slug, with the author needed for the ownership check. */
  async loadForWrite(ctx: any) {
    const key = String(ctx.params.id);
    const where: Record<string, any> = /^\d+$/.test(key)
      ? { $or: [{ id: Number(key) }, { documentId: key }, { slug: key }] }
      : { $or: [{ slug: key }, { documentId: key }] };

    const post = await strapi.db.query(BLOG_POST_UID).findOne({ where, populate: ['author'] });
    if (!post) throw new NotFoundError('Post not found.');

    return post;
  },
}));

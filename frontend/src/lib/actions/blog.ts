"use server";

/**
 * Blog actions.
 *
 * The assignment asks for drafts that are invisible publicly and an Admin who has full
 * control over every post. Both of those live in the API — `global::can-manage-blog`
 * decides who may write, and the controller decides whose posts they may touch (a
 * Content Manager gets their own, an Admin gets everyone's). So, as elsewhere, these
 * actions do input handling and leave authorisation to the one place that owns it.
 */
import { apiFetch } from "@/lib/api";
import { requireBlogManager } from "@/lib/session";
import type { ApiItem, BlogPost } from "@/lib/types";

import { bool, finish, num, optionalStr, str } from "./shared";
import type { FormState } from "./shared";

/** Every route that renders a post list or a post. */
const BLOG_PATHS = ["/blog", "/manage/blog", "/admin/blog", "/admin"];

function postPayload(form: FormData) {
  return {
    title: str(form, "title"),
    excerpt: optionalStr(form, "excerpt"),
    body: optionalStr(form, "body"),
    coverImageUrl: optionalStr(form, "coverImageUrl"),
    // Sent as a comma-separated string by the form and split by the controller's
    // `toTags`, so a stray ", " or an empty trailing tag is already handled there.
    tags: str(form, "tags"),
    readingMinutes: Math.max(0, num(form, "readingMinutes")),
    status: bool(form, "publishNow") ? "published" : "draft",
  };
}

export async function createPost(_prev: FormState, form: FormData): Promise<FormState> {
  await requireBlogManager();
  const payload = postPayload(form);

  if (!payload.title) return { error: "Give the post a title." };
  if (!payload.body) return { error: "A post needs a body before it can be saved." };

  const result = await apiFetch<ApiItem<BlogPost>>("/api/blog-posts", {
    method: "POST",
    body: payload,
  });

  if (!result.ok) return { error: result.error };

  finish([...BLOG_PATHS, `/blog/${result.data.data.slug}`], "/manage/blog", "post-created");
}

/**
 * Save an existing post.
 *
 * `slug` is only included when the author actually edited that field. The controller
 * re-slugs whenever it receives one, and a published post's slug is its URL — silently
 * regenerating it because someone fixed a typo in the title would break every existing
 * link to the article. So the form ships the slug field as `slug` only if it changed,
 * and this action forwards it only if it arrived.
 */
export async function updatePost(_prev: FormState, form: FormData): Promise<FormState> {
  await requireBlogManager();
  const id = str(form, "postId");
  const payload = postPayload(form);
  const slug = optionalStr(form, "slug");
  const originalSlug = optionalStr(form, "originalSlug");

  if (!id) return { error: "Missing post reference." };
  if (!payload.title) return { error: "Give the post a title." };
  if (!payload.body) return { error: "A post needs a body before it can be saved." };

  const body = slug && slug !== originalSlug ? { ...payload, slug } : payload;

  const result = await apiFetch<ApiItem<BlogPost>>(`/api/blog-posts/${id}`, {
    method: "PUT",
    body,
  });

  if (!result.ok) return { error: result.error };

  finish(
    [...BLOG_PATHS, `/blog/${result.data.data.slug}`, ...(originalSlug ? [`/blog/${originalSlug}`] : [])],
    "/manage/blog",
    "post-saved",
  );
}

/**
 * Flip a post between draft and published.
 *
 * Its own endpoint (`POST /api/blog-posts/:id/publish`) rather than a `status` field on
 * the update call, because publishing is not the same kind of event as editing: the
 * controller preserves the *original* `publishedDate` when a post is re-published, so an
 * article edited six months later does not jump to the top of the blog. Reusing the
 * update path would have made that rule impossible to express.
 *
 * The endpoint toggles when the body is empty, but the desired state is sent explicitly
 * anyway — a toggle fired twice by a double-click ends up back where it started, and
 * "publish" is the wrong thing to be ambiguous about.
 */
export async function setPostStatus(form: FormData) {
  await requireBlogManager();
  const id = str(form, "postId");
  const slug = optionalStr(form, "slug");
  const status = str(form, "status") === "published" ? "published" : "draft";
  if (!id) return;

  const result = await apiFetch(`/api/blog-posts/${id}/publish`, {
    method: "POST",
    body: { status },
  });

  const from = str(form, "from") === "admin" ? "/admin/blog" : "/manage/blog";

  finish(
    [...BLOG_PATHS, ...(slug ? [`/blog/${slug}`] : [])],
    from,
    result.ok ? (status === "published" ? "post-published" : "post-unpublished") : "forbidden",
    !result.ok,
  );
}

export async function deletePost(form: FormData) {
  await requireBlogManager();
  const id = str(form, "postId");
  const slug = optionalStr(form, "slug");
  if (!id) return;

  const result = await apiFetch(`/api/blog-posts/${id}`, { method: "DELETE" });

  const from = str(form, "from") === "admin" ? "/admin/blog" : "/manage/blog";

  finish(
    [...BLOG_PATHS, ...(slug ? [`/blog/${slug}`] : [])],
    from,
    result.ok ? "post-deleted" : "forbidden",
    !result.ok,
  );
}

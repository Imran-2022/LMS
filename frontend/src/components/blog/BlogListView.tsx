import Link from "next/link";
import { Eye, Trash2 } from "lucide-react";

import { BlogAuthoringDialog } from "./BlogAuthoringDialog";
import { deletePost } from "@/lib/actions/blog";
import { DangerousSubmit } from "@/components/ui/DangerousSubmit";
import type { BlogPost } from "@/lib/types";

export function BlogListView({ posts, fromAdmin = false }: { posts: BlogPost[]; fromAdmin?: boolean }) {
  return (
    <div className="mt-8 space-y-3">
      {posts.map((post) => (
        <article key={post.id} className="flex items-center justify-between gap-4 rounded border border-ink-200 bg-white p-5 hover:border-brand-300">
          <Link href={`/blog/${post.slug}`} className="min-w-0 flex-1">
            <h2 className="font-bold text-ink-900">{post.title}</h2>
            <p className="mt-1 text-sm text-ink-500">{post.status} · {post.readingMinutes} min read</p>
          </Link>
          <div className="flex shrink-0 items-center gap-1">
            <Link href={`/blog/${post.slug}`} aria-label={`View ${post.title}`} title="View post" className="grid h-9 w-9 place-items-center rounded text-ink-500 hover:bg-brand-50 hover:text-brand-700">
              <Eye size={18} strokeWidth={2.25} aria-hidden="true" />
            </Link>
            <BlogAuthoringDialog post={post} />
            <form action={deletePost}>
              <input type="hidden" name="postId" value={post.id} />
              <input type="hidden" name="slug" value={post.slug} />
              {fromAdmin ? <input type="hidden" name="from" value="admin" /> : null}
              <DangerousSubmit variant="ghost" size="sm" confirm={`Delete \"${post.title}\"?`} pendingLabel="Deleting..." aria-label={`Delete ${post.title}`} title="Delete post" className="grid h-9 w-9 place-items-center rounded px-0 text-ink-500 hover:bg-brand-50 hover:text-brand-700">
                <Trash2 size={20} strokeWidth={2.25} aria-hidden="true" />
              </DangerousSubmit>
            </form>
          </div>
        </article>
      ))}
    </div>
  );
}

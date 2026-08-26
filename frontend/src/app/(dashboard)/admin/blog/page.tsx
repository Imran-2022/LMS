import { requireAdmin } from "@/lib/session";
import { fetchList } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";
import type { BlogPost } from "@/lib/types";

export default async function AdminBlogPage() {
  await requireAdmin();
  const posts = await fetchList<BlogPost>("/api/blog-posts?status=all");
  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="Blog management"
        description="Manage published and draft learning resources."
      />
      <div className="mt-8 space-y-3">
        {posts.map((post) => (
          <article
            key={post.id}
            className="rounded border border-ink-200 bg-white p-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-bold text-ink-900">{post.title}</h2>
                <p className="mt-1 text-sm text-ink-500">
                  {post.status} · {post.author?.fullName ?? "Unassigned"}
                </p>
              </div>
              <div className="flex gap-4">
                <a
                  className="font-semibold text-brand-700"
                  href={`/blog/${post.slug}`}
                >
                  View
                </a>
                <a
                  className="font-semibold text-brand-700"
                  href={`/manage/blog/${post.id}`}
                >
                  Edit
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

import Link from "next/link";
import { CoverImage } from "@/components/courses/CoverImage";
import { Footer } from "@/components/layout/Footer";
import { PublicNav } from "@/components/layout/PublicNav";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { fetchList } from "@/lib/api";
import { formatDate } from "@/lib/format";
import type { BlogPost } from "@/lib/types";

export default async function BlogPage() {
  const posts = await fetchList<BlogPost>("/api/blog-posts", { anonymous: true, revalidate: 60 });

  return (
    <div className="min-h-dvh bg-ink-50">
      <PublicNav />

      <main className="mx-auto w-full max-w-[1180px] px-4 py-12 sm:px-6 lg:py-16">
        <PageHeader
          eyebrow="Notes from CPS Academy"
          title="CPS Academy blog"
          description="Ideas and practical notes for better learning and teaching."
        />

        {posts.length ? (
          <div className="mt-8 grid items-stretch gap-5 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded border border-ink-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lg"
              >
                <CoverImage src={post.coverImageUrl} alt="" />

                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-wide text-brand-600">
                    <span>{post.readingMinutes} min read</span>
                    <time
                      dateTime={post.publishedDate ?? post.createdAt}
                      className="font-medium normal-case tracking-normal text-ink-400"
                    >
                      {formatDate(post.publishedDate ?? post.createdAt)}
                    </time>
                  </div>

                  <h2 className="mt-2 font-bold text-ink-900 transition-colors group-hover:text-brand-700">
                    {post.title}
                  </h2>
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-ink-600">
                    {post.excerpt}
                  </p>

                  {post.tags.length ? (
                    <div className="mt-auto flex flex-wrap gap-1.5 pt-5">
                      {post.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-medium text-brand-700"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            className="mt-8"
            title="No published posts yet"
            description="Check back soon for new notes from the CPS Academy team."
          />
        )}
      </main>

      <Footer />
    </div>
  );
}
import { notFound } from "next/navigation";
import { BlogContent } from "@/components/blog/BlogContent";
import { Footer } from "@/components/layout/Footer";
import { PublicNav } from "@/components/layout/PublicNav";
import { BackButton } from "@/components/ui/BackButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { fetchItem } from "@/lib/api";
import type { BlogPost } from "@/lib/types";

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await fetchItem<BlogPost>(`/api/blog-posts/${slug}`, { anonymous: true, revalidate: 60 });
  if (!post) notFound();
  return (
    <div className="min-h-dvh bg-ink-50">
      <PublicNav />
      <main className="mx-auto w-full max-w-[850px] px-4 py-12 sm:px-6 lg:py-16">
        <PageHeader
          eyebrow={
            <div className="flex items-center justify-between gap-4">
              <span>{post.readingMinutes} min read</span>
              <BackButton />
            </div>
          }
          title={post.title}
          description={post.excerpt ?? undefined}
        />
        <article className="mt-8 overflow-hidden rounded border border-ink-200 bg-white">
          <div className="p-6 sm:p-10">
            <BlogContent body={post.body} />
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
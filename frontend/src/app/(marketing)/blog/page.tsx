import Link from "next/link";
import { CoverImage } from "@/components/courses/CoverImage";
import { Footer } from "@/components/layout/Footer";
import { PublicNav } from "@/components/layout/PublicNav";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { fetchList } from "@/lib/api";
import type { BlogPost } from "@/lib/types";

export default async function BlogPage() {
  const posts = await fetchList<BlogPost>("/api/blog-posts", { anonymous: true, revalidate: 60 });
  return <div className="min-h-dvh bg-ink-50"><PublicNav /><main className="mx-auto w-full max-w-[1180px] px-4 py-12 sm:px-6 lg:py-16"><PageHeader eyebrow="Notes from Lumen" title="Lumen blog" description="Ideas and practical notes for better learning and teaching." />{posts.length ? <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{posts.map((post) => <Link key={post.id} href={`/blog/${post.slug}`} className="overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"><CoverImage src={post.coverImageUrl} alt="" /><div className="p-5"><p className="text-xs font-semibold uppercase tracking-wide text-brand-600">{post.readingMinutes} min read</p><h2 className="mt-2 font-bold text-ink-900">{post.title}</h2><p className="mt-2 line-clamp-3 text-sm leading-6 text-ink-600">{post.excerpt}</p></div></Link>)}</div> : <EmptyState className="mt-8" title="No published posts yet" description="Check back soon for new notes from the Lumen team." />}</main><Footer /></div>;
}
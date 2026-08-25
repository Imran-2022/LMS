import Link from "next/link";
import { fetchList } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";
import type { BlogPost } from "@/lib/types";

export default async function ManageBlogPage() {
  const posts = await fetchList<BlogPost>("/api/blog-posts?mine=1");
  return <><PageHeader eyebrow="Content workspace" title="Manage blog" description="Draft and publish useful notes for your learning community." action={<Link className="rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white" href="/manage/blog/new">Write post</Link>} /><div className="mt-8 space-y-3">{posts.map((post) => <Link key={post.id} href={`/manage/blog/${post.id}`} className="block rounded-xl border border-ink-200 bg-white p-5 hover:border-brand-300"><h2 className="font-bold text-ink-900">{post.title}</h2><p className="mt-1 text-sm text-ink-500">{post.status} · {post.readingMinutes} min read</p></Link>)}</div></>;
}
import { BlogForm } from "@/components/blog/BlogForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { fetchItem } from "@/lib/api";
import type { BlogPost } from "@/lib/types";

export default async function EditBlogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await fetchItem<BlogPost>(`/api/blog-posts/${id}`);
  if (!post) return <p className="text-ink-600">Post not found.</p>;
  return <><PageHeader eyebrow="Content workspace" title="Edit post" description="Update the article and its publication status." /><div className="mt-8 max-w-3xl rounded border border-ink-200 bg-white p-6 sm:p-8"><BlogForm post={post} /></div></>;
}
import { BlogListView } from "@/components/blog/BlogListView";
import { requireAdmin } from "@/lib/session";
import { fetchList } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { BlogAuthoringDialog } from "@/components/blog/BlogAuthoringDialog";
import type { BlogPost } from "@/lib/types";

export default async function AdminBlogPage() {
  await requireAdmin();
  const posts = await fetchList<BlogPost>("/api/blog-posts?status=all");
  return (
    <>
      <PageHeader
        eyebrow="Administration"
        title="All Blogs"
        description="Manage published and draft learning resources."
        action={
          <BlogAuthoringDialog />
        }
      />
      <BlogListView posts={posts} fromAdmin />
    </>
  );
}

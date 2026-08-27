import { BlogListView } from "@/components/blog/BlogListView";
import { fetchList } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { BlogAuthoringDialog } from "@/components/blog/BlogAuthoringDialog";
import type { BlogPost } from "@/lib/types";

export default async function ManageBlogPage() {
  const posts = await fetchList<BlogPost>("/api/blog-posts?mine=1");
  return (
    <>
      <PageHeader
        eyebrow="Content workspace"
        title="Manage blog"
        description="Draft and publish useful notes for your learning community."
        action={
          <BlogAuthoringDialog />
        }
      />

      <BlogListView posts={posts} />
    </>
  );
}

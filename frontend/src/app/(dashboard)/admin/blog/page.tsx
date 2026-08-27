import { BlogListView } from "@/components/blog/BlogListView";
import { requireAdmin } from "@/lib/session";
import { fetchListWithMeta } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { BlogAuthoringDialog } from "@/components/blog/BlogAuthoringDialog";
import { AdminBlogFilters } from "@/components/admin/AdminBlogFilters";
import { EmptyState } from "@/components/ui/EmptyState";
import type { BlogPost } from "@/lib/types";

const PAGE_SIZE = 25;

export default async function AdminBlogPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const status = params.status === "draft" || params.status === "published" ? params.status : "";
  const requestedPage = Number.parseInt(params.page ?? "1", 10);
  const page = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const queryString = new URLSearchParams({
    ...(query ? { q: query } : {}),
    ...(status ? { status } : { status: "all" }),
    page: String(page),
    pageSize: String(PAGE_SIZE),
  }).toString();
  const result = await fetchListWithMeta<BlogPost>(`/api/blog-posts?${queryString}`);
  const total = Number(result.meta.total ?? 0);
  const pageCount = Number(result.meta.pageCount ?? 0);

  function pageHref(nextPage: number) {
    const next = new URLSearchParams({
      ...(query ? { q: query } : {}),
      ...(status ? { status } : { status: "all" }),
      page: String(nextPage),
      pageSize: String(PAGE_SIZE),
    });
    return `/admin/blog?${next.toString()}`;
  }

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
      <AdminBlogFilters query={query} status={status} />
      {result.data.length ? (
        <BlogListView posts={result.data} fromAdmin />
      ) : (
        <EmptyState className="mt-8" title={query || status ? "No posts found" : "No posts yet"} description={query || status ? "Try a different search or status." : "Write the first post to see it here."} />
      )}
      {pageCount > 1 ? (
        <nav aria-label="Blog pagination" className="mt-5 flex items-center justify-between text-sm">
          <span className="text-ink-500">Showing {(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, total)} of {total}</span>
          <div className="flex gap-2">
            {page > 1 ? <a href={pageHref(page - 1)} className="rounded border border-ink-200 px-3 py-2 font-semibold text-ink-700 hover:border-brand-300 hover:text-brand-700">Previous</a> : null}
            {page < pageCount ? <a href={pageHref(page + 1)} className="rounded border border-ink-200 px-3 py-2 font-semibold text-ink-700 hover:border-brand-300 hover:text-brand-700">Next</a> : null}
          </div>
        </nav>
      ) : null}
    </>
  );
}

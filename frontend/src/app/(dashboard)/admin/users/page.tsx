import { requireAdmin } from "@/lib/session";
import { fetchListWithMeta } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { AdminUsersTable } from "@/components/admin/AdminUsersTable";
import { AdminCreateUser } from "@/components/admin/AdminCreateUser";
import { AdminUserFilters } from "@/components/admin/AdminUserFilters";
import { EmptyState } from "@/components/ui/EmptyState";
import type { AdminUser } from "@/lib/types";

const PAGE_SIZE = 25;

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; role?: string; page?: string }>;
}) {
  const current = await requireAdmin();
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const role = params.role ?? "";
  const requestedPage = Number.parseInt(params.page ?? "1", 10);
  const page = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const queryString = new URLSearchParams({
    ...(query ? { q: query } : {}),
    ...(role ? { role } : {}),
    page: String(page),
    pageSize: String(PAGE_SIZE),
  }).toString();
  const result = await fetchListWithMeta<AdminUser>(`/api/admin/users?${queryString}`);
  const total = Number(result.meta.total ?? 0);
  const pageCount = Number(result.meta.pageCount ?? 0);

  function pageHref(nextPage: number) {
    const next = new URLSearchParams({
      ...(query ? { q: query } : {}),
      ...(role ? { role } : {}),
      page: String(nextPage),
      pageSize: String(PAGE_SIZE),
    });
    return `/admin/users?${next.toString()}`;
  }

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="Users"
        description="Review accounts, roles, and access status."
        action={<AdminCreateUser />}
      />
      <AdminUserFilters query={query} role={role} />
      {result.data.length ? (
        <AdminUsersTable currentUserId={current.id} initialUsers={result.data} />
      ) : (
        <EmptyState className="mt-8" title={query || role ? "No users found" : "No users yet"} description={query || role ? "Try a different search or account type." : "Create the first account to see it here."} />
      )}
      {pageCount > 1 ? (
        <nav aria-label="User list pagination" className="mt-5 flex items-center justify-between text-sm">
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

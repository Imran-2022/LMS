import { requireAdmin } from "@/lib/session";
import { fetchList } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { AdminUsersTable } from "@/components/admin/AdminUsersTable";
import type { AdminUser } from "@/lib/types";

export default async function AdminUsersPage() {
  const current = await requireAdmin();
  const users = await fetchList<AdminUser>("/api/admin/users");
  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="Users"
        description="Review accounts, roles, and access status."
      />
      <AdminUsersTable currentUserId={current.id} initialUsers={users} />
    </>
  );
}

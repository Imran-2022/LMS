import { requireAdmin } from "@/lib/session";
import { fetchList } from "@/lib/api";
import { setUserRole, setUserStatus, deleteUser } from "@/lib/actions/admin";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
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
      <div className="mt-8 overflow-x-auto rounded border border-ink-200 bg-white">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="border-b border-ink-200 bg-ink-50 text-xs uppercase tracking-wide text-ink-500">
            <tr>
              <th className="px-5 py-4">User</th>
              <th className="px-5 py-4">Role</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {users.map((user) => {
              const own = user.id === current.id;
              return (
                <tr key={user.id}>
                  <td className="px-5 py-4">
                    <strong className="block text-ink-900">
                      {user.fullName ?? user.username}
                    </strong>
                    <span className="text-ink-500">{user.email}</span>
                  </td>
                  <td className="px-5 py-4">
                    <form action={setUserRole} className="flex gap-2">
                      <input type="hidden" name="userId" value={user.id} />
                      <select
                        name="role"
                        defaultValue={user.role?.type ?? "student"}
                        disabled={own}
                        className="rounded border border-ink-200 px-2 py-1.5 text-sm"
                      >
                        <option value="admin">Admin</option>
                        <option value="content_manager">Content manager</option>
                        <option value="instructor">Instructor</option>
                        <option value="student">Student</option>
                      </select>
                      {!own ? (
                        <Button
                          type="submit"
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-brand-700 hover:text-brand-700"
                        >
                          Save
                        </Button>
                      ) : null}
                    </form>
                  </td>
                  <td className="px-5 py-4">
                    {user.blocked ? "Blocked" : "Active"}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-3">
                      <form action={setUserStatus}>
                        <input type="hidden" name="userId" value={user.id} />
                        <input
                          type="hidden"
                          name="blocked"
                          value={String(!user.blocked)}
                        />
                        <Button
                          type="submit"
                          variant="ghost"
                          size="sm"
                          disabled={own}
                          className="h-8 px-2 text-brand-700 hover:text-brand-700"
                        >
                          {user.blocked ? "Unblock" : "Block"}
                        </Button>
                      </form>
                      <form action={deleteUser}>
                        <input type="hidden" name="userId" value={user.id} />
                        <Button
                          type="submit"
                          variant="ghost"
                          size="sm"
                          disabled={own}
                          className="h-8 px-2 text-danger-600 hover:text-danger-600"
                        >
                          Delete
                        </Button>
                      </form>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

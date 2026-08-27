"use client";

import { useState } from "react";
import { UserActionsMenu } from "@/components/admin/UserActionsMenu";
import { UserRoleSelect } from "@/components/admin/UserRoleSelect";
import type { AdminUser, RoleType } from "@/lib/types";

export function AdminUsersTable({
  currentUserId,
  initialUsers,
}: {
  currentUserId: number;
  initialUsers: AdminUser[];
}) {
  const [users, setUsers] = useState(initialUsers);

  return (
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
            const own = user.id === currentUserId;
            return (
              <tr key={user.id}>
                <td className="px-5 py-4">
                  <strong className="block text-ink-900">
                    {user.fullName ?? user.username}
                  </strong>
                  <span className="text-ink-500">{user.email}</span>
                </td>
                <td className="px-5 py-4">
                  <UserRoleSelect
                    userId={user.id}
                    role={user.role?.type ?? "student"}
                    disabled={own}
                    onSaved={(role) =>
                      setUsers((current) =>
                        current.map((item) =>
                          item.id === user.id
                            ? {
                                ...item,
                                role: item.role
                                  ? { ...item.role, type: role as RoleType }
                                  : item.role,
                              }
                            : item,
                        ),
                      )
                    }
                  />
                </td>
                <td className="px-5 py-4">
                  {user.blocked ? "Blocked" : "Active"}
                </td>
                <td className="px-5 py-4">
                  {own ? null : (
                    <UserActionsMenu
                      userId={user.id}
                      userName={user.fullName ?? user.username}
                      blocked={user.blocked}
                      onStatusChange={(blocked) =>
                        setUsers((current) =>
                          current.map((item) =>
                            item.id === user.id ? { ...item, blocked } : item,
                          ),
                        )
                      }
                      onDeleted={() =>
                        setUsers((current) =>
                          current.filter((item) => item.id !== user.id),
                        )
                      }
                    />
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
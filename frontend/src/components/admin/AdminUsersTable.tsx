"use client";

import { useState } from "react";
import { UserActionsMenu } from "@/components/admin/UserActionsMenu";
import { UserRoleSelect } from "@/components/admin/UserRoleSelect";
import { CellStack, DataTable, type Column } from "@/components/ui/DataTable";
import type { AdminUser, RoleType } from "@/lib/types";

export function AdminUsersTable({
  currentUserId,
  initialUsers,
}: {
  currentUserId: number;
  initialUsers: AdminUser[];
}) {
  const [users, setUsers] = useState(initialUsers);

  const columns: Column<AdminUser>[] = [
    { key: "user", header: "User", cell: (user) => <CellStack title={user.fullName ?? user.username} meta={user.email} /> },
    { key: "role", header: "Role", cell: (user) => <UserRoleSelect userId={user.id} role={user.role?.type ?? "student"} disabled={user.id === currentUserId} onSaved={(role) => setUsers((current) => current.map((item) => item.id === user.id && item.role ? { ...item, role: { ...item.role, type: role as RoleType } } : item))} /> },
    { key: "status", header: "Status", cell: (user) => user.blocked ? "Blocked" : "Active" },
    { key: "actions", header: "Actions", srOnlyHeader: true, cell: (user) => user.id === currentUserId ? null : <UserActionsMenu userId={user.id} userName={user.fullName ?? user.username} blocked={user.blocked} onStatusChange={(blocked) => setUsers((current) => current.map((item) => item.id === user.id ? { ...item, blocked } : item))} onDeleted={() => setUsers((current) => current.filter((item) => item.id !== user.id))} /> },
  ];

  return (
    <DataTable columns={columns} rows={users} getRowKey={(user) => user.id} caption="Administrator user accounts" className="mt-8 min-w-[680px]" />
  );
}
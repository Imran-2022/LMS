"use client";

import { useEffect, useState } from "react";
import { updateUserRole } from "@/lib/actions/admin";

export function UserRoleSelect({
  userId,
  role,
  disabled = false,
  onSaved,
}: {
  userId: number;
  role: string;
  disabled?: boolean;
  onSaved?: (role: string) => void;
}) {
  const [selectedRole, setSelectedRole] = useState(role);

  useEffect(() => {
    setSelectedRole(role);
  }, [role]);

  async function saveRole(nextRole: string) {
    setSelectedRole(nextRole);
    const result = await updateUserRole(String(userId), nextRole);
    if (result.ok) {
      onSaved?.(nextRole);
    } else {
      setSelectedRole(role);
    }
  }

  return (
    <select
      name="role"
      value={selectedRole}
      disabled={disabled}
      onChange={(event) => saveRole(event.currentTarget.value)}
      className="rounded border border-ink-200 px-2 py-1.5 text-sm"
      aria-label="User role"
    >
      <option value="admin">Admin</option>
      <option value="content_manager">Content manager</option>
      <option value="instructor">Instructor</option>
      <option value="student">Student</option>
    </select>
  );
}
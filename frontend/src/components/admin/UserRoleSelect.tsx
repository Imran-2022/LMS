"use client";

import { useEffect, useState, useTransition } from "react";
import { updateUserRole } from "@/lib/actions/admin";
import { ROLE_BLURBS, ROLE_LABELS } from "@/lib/roles";
import type { RoleType } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { useToast } from "@/components/ui/Toast";

const roles = Object.keys(ROLE_LABELS) as RoleType[];

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
  const [selectedRole, setSelectedRole] = useState(role as RoleType);
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const { toast } = useToast();

  useEffect(() => setSelectedRole(role as RoleType), [role]);

  function save() {
    startTransition(async () => {
      const result = await updateUserRole(String(userId), selectedRole);
      if (result.ok) {
        onSaved?.(selectedRole);
        setOpen(false);
        toast("Role updated.", "success");
      } else toast(result.error ?? "Could not update role.", "danger");
    });
  }

  return (
    <>
      <Button type="button" variant="secondary" size="sm" disabled={disabled} onClick={() => setOpen(true)}>{ROLE_LABELS[selectedRole] ?? selectedRole}</Button>
      <Dialog open={open} onClose={() => !pending && setOpen(false)} title="Change role" size="md" dismissable={!pending} footer={<><Button type="button" variant="secondary" size="sm" onClick={() => setOpen(false)} disabled={pending}>Cancel</Button><Button type="button" size="sm" onClick={save} disabled={pending}>{pending ? "Saving..." : "Save role"}</Button></>}>
        <fieldset className="space-y-2">
          <legend className="sr-only">Select a role</legend>
          {roles.map((candidate) => <label key={candidate} className="flex cursor-pointer items-start gap-3 rounded border border-ink-200 p-3 has-[:checked]:border-brand-400 has-[:checked]:bg-brand-50"><input type="radio" name={`role-${userId}`} value={candidate} checked={selectedRole === candidate} onChange={() => setSelectedRole(candidate)} className="mt-1" /><span><span className="block text-sm font-semibold text-ink-900">{ROLE_LABELS[candidate]}</span><span className="block text-xs leading-relaxed text-ink-500">{ROLE_BLURBS[candidate]}</span></span></label>)}
        </fieldset>
      </Dialog>
    </>
  );
}
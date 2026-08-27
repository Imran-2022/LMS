"use client";

import { Ban, CheckCircle2, Trash2 } from "lucide-react";

import { removeUser, updateUserStatus } from "@/lib/actions/admin";
import { ActionMenu } from "@/components/ui/ActionMenu";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";

export function UserActionsMenu({
  userId,
  userName,
  blocked,
  onStatusChange,
  onDeleted,
}: {
  userId: number;
  userName: string;
  blocked: boolean;
  onStatusChange?: (blocked: boolean) => void;
  onDeleted?: () => void;
}) {
  const confirm = useConfirm();
  const { toast } = useToast();

  async function changeStatus() {
    const nextBlocked = !blocked;
    const accepted = await confirm({
      title: nextBlocked ? "Block this user?" : "Unblock this user?",
      body: nextBlocked
        ? `${userName} will lose access until an administrator unblocks the account.`
        : `${userName} will be able to sign in and use the platform again.`,
      confirmLabel: nextBlocked ? "Block user" : "Unblock user",
      tone: nextBlocked ? "danger" : "default",
    });
    if (!accepted) return;
    const result = await updateUserStatus(String(userId), nextBlocked);
    if (!result.ok) {
      toast(result.error ?? "Could not update account status.", "danger");
      return;
    }
    onStatusChange?.(nextBlocked);
    toast(nextBlocked ? "User blocked." : "User unblocked.", "success");
  }

  async function deleteAccount() {
    const accepted = await confirm({
      title: "Delete this user?",
      body: `Delete ${userName}'s account? Their enrollments, progress, and quiz history will be removed. This cannot be undone.`,
      confirmLabel: "Delete user",
      tone: "danger",
    });
    if (!accepted) return;
    const result = await removeUser(String(userId));
    if (!result.ok) {
      toast(result.error ?? "Could not delete account.", "danger");
      return;
    }
    onDeleted?.();
    toast("User deleted.", "success");
  }

  return (
    <ActionMenu
      label={`Actions for ${userName}`}
      items={[
        {
          label: blocked ? "Unblock user" : "Block user",
          icon: blocked ? <CheckCircle2 /> : <Ban />,
          onSelect: changeStatus,
        },
        {
          label: "Delete user",
          icon: <Trash2 />,
          tone: "danger",
          separated: true,
          onSelect: deleteAccount,
        },
      ]}
    />
  );
}

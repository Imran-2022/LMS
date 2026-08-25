import { AppShell } from "@/components/layout/AppShell";
import { requireUser } from "@/lib/session";
import { roleOf } from "@/lib/roles";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return (
    <AppShell
      name={user.fullName ?? user.username}
      email={user.email}
      avatarUrl={user.avatarUrl}
      role={roleOf(user)}
    >
      {children}
    </AppShell>
  );
}
import { AppShell } from "@/components/layout/AppShell";
import { requireUser } from "@/lib/session";
import { roleOf } from "@/lib/roles";
import { SIDEBAR_COOKIE } from "@/lib/sidebar";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const sidebarCollapsed =
    (await cookies()).get(SIDEBAR_COOKIE)?.value === "true";
  return (
    <AppShell
      name={user.fullName ?? user.username}
      email={user.email}
      avatarUrl={user.avatarUrl}
      role={roleOf(user)}
      sidebarCollapsed={sidebarCollapsed}
    >
      {children}
    </AppShell>
  );
}

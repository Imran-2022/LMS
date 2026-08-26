import { BarChart3 } from "lucide-react";
import { requireAdmin } from "@/lib/session";
import { fetchItem } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/Card";
import type { PlatformStats } from "@/lib/types";

export default async function AdminPage() {
  await requireAdmin();
  const stats = await fetchItem<PlatformStats>("/api/admin/stats");
  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="Platform dashboard"
        description="Manage the learning platform from one central workspace."
      />
      {stats ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Users"
            value={stats.users.total}
            icon={<BarChart3 size={18} />}
          />
          <StatCard label="Published courses" value={stats.courses.published} />
          <StatCard label="Enrollments" value={stats.learning.enrollments} />
          <StatCard label="Quiz attempts" value={stats.quizzes.attempts} />
        </div>
      ) : (
        <p className="mt-8 text-ink-600">Dashboard data is unavailable.</p>
      )}
    </>
  );
}

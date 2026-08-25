import { requireAdmin } from "@/lib/session";
import { fetchList } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";
import type { AdminCourse } from "@/lib/types";

export default async function AdminCoursesPage() {
  await requireAdmin(); const courses = await fetchList<AdminCourse>("/api/admin/courses");
  return <><PageHeader eyebrow="Admin" title="All courses" description="Review and manage every course on the platform." /><div className="mt-8 overflow-x-auto rounded-2xl border border-ink-200 bg-white"><table className="w-full text-left text-sm"><thead className="border-b border-ink-200 bg-ink-50 text-xs uppercase text-ink-500"><tr><th className="px-5 py-4">Course</th><th className="px-5 py-4">Owner</th><th className="px-5 py-4">Status</th><th className="px-5 py-4">Learners</th></tr></thead><tbody className="divide-y divide-ink-100">{courses.map((course) => <tr key={course.id}><td className="px-5 py-4 font-semibold text-ink-900">{course.title}</td><td className="px-5 py-4 text-ink-600">{course.owner?.fullName ?? course.owner?.username ?? "Unassigned"}</td><td className="px-5 py-4">{course.status}</td><td className="px-5 py-4">{course.enrollmentCount}</td></tr>)}</tbody></table></div></>;
}
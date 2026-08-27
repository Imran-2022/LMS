import { requireAdmin } from "@/lib/session";
import { fetchList } from "@/lib/api";
import { CourseCard } from "@/components/courses/CourseCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { ButtonLink } from "@/components/ui/Button";
import { BookOpen } from "lucide-react";
import type { Course } from "@/lib/types";

export default async function AdminCoursesPage() {
  await requireAdmin();
  const courses = await fetchList<Course>("/api/admin/courses");
  return (
    <>
      <header>
        <p className="mb-2 text-[11.5px] font-bold uppercase tracking-[0.1em] text-brand-500">
          Administration
        </p>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="min-w-0 text-[26px] font-bold leading-tight tracking-tight text-ink-900 sm:text-[30px]">
            All courses
          </h1>
          <ButtonLink href="/manage/courses/new">Create course</ButtonLink>
        </div>
        <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-ink-500">
          Create courses and shape learning experiences for your students.
        </p>
      </header>
      <div className="mt-8">
        {courses.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                showStatus
                href={`/manage/courses/${course.id}`}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<BookOpen size={24} />}
            title="No courses yet"
            description="Create your first course to start building a learning path."
            action={<ButtonLink href="/manage/courses/new">Create course</ButtonLink>}
          />
        )}
      </div>
    </>
  );
}

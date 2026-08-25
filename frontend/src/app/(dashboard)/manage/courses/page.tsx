import { BookOpen } from "lucide-react";
import { CourseCard } from "@/components/courses/CourseCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { ButtonLink } from "@/components/ui/Button";
import { fetchList } from "@/lib/api";
import type { Course } from "@/lib/types";

export default async function ManageCoursesPage() {
  const courses = await fetchList<Course>("/api/courses/mine");
  return (
    <>
      <PageHeader eyebrow="Teaching workspace" title="Manage courses" description="Create courses and shape learning experiences for your students." action={<ButtonLink href="/manage/courses/new">Create course</ButtonLink>} />
      <div className="mt-8">
        {courses.length ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{courses.map((course) => <CourseCard key={course.id} course={course} showStatus href={`/manage/courses/${course.id}`} />)}</div> : <EmptyState icon={<BookOpen size={24} />} title="No courses yet" description="Create your first course to start building a learning path." action={<ButtonLink href="/manage/courses/new">Create course</ButtonLink>} />}
      </div>
    </>
  );
}
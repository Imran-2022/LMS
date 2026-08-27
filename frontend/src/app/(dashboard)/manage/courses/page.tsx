import { CourseAuthoringDialog } from "@/components/courses/CourseAuthoringDialog";
import { CourseListView } from "@/components/courses/CourseListView";
import { fetchList } from "@/lib/api";
import type { Course } from "@/lib/types";

export default async function ManageCoursesPage() {
  const courses = await fetchList<Course>("/api/courses/mine");
  return (
    <>
      <header>
        <p className="mb-2 text-[11.5px] font-bold uppercase tracking-[0.1em] text-brand-500">
          Teaching workspace
        </p>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="min-w-0 text-[26px] font-bold leading-tight tracking-tight text-ink-900 sm:text-[30px]">
            Manage courses
          </h1>
          <CourseAuthoringDialog />
        </div>
        <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-ink-500">
          Create courses and shape learning experiences for your students.
        </p>
      </header>
      <div className="mt-8">
        <CourseListView courses={courses} />
      </div>
    </>
  );
}

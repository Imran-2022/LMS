import { CourseForm } from "@/components/courses/CourseForm";
import { BackButton } from "@/components/ui/BackButton";
import { fetchList } from "@/lib/api";
import { requireAuthor } from "@/lib/session";
import { isPrivileged, roleOf } from "@/lib/roles";
import type { InstructorOption } from "@/lib/types";

export default async function NewCoursePage() {
  const user = await requireAuthor();
  const canAssignInstructor = isPrivileged(roleOf(user));
  const instructors = canAssignInstructor
    ? await fetchList<InstructorOption>("/api/courses/instructors")
    : [];

  return (
    <>
      <header>
        <p className="mb-2 text-[11.5px] font-bold uppercase tracking-[0.1em] text-brand-500">
          Teaching workspace
        </p>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="min-w-0 text-[26px] font-bold leading-tight tracking-tight text-ink-900 sm:text-[30px]">
            Create a course
          </h1>
          <BackButton />
        </div>
        <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-ink-500">
          Start a new course and add lessons and quizzes as it takes shape.
        </p>
      </header>

      <div className="mt-8 max-w-3xl rounded border border-ink-200 bg-white p-6 sm:p-8">
        <CourseForm
          instructors={instructors}
          canAssignInstructor={canAssignInstructor}
        />
      </div>
    </>
  );
}

import { CourseAuthoringDialog } from "@/components/courses/CourseAuthoringDialog";
import { LessonAuthoringDialog } from "@/components/courses/LessonAuthoringDialog";
import { QuizAuthoringDialog } from "@/components/quiz/QuizAuthoringDialog";
import { LessonRail } from "@/components/courses/LessonRail";
import { QuizRail } from "@/components/quiz/QuizRail";
import { BackButton } from "@/components/ui/BackButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { ButtonLink } from "@/components/ui/Button";
import { fetchItem, fetchList } from "@/lib/api";
import { isPrivileged, roleOf } from "@/lib/roles";
import { requireAuthor } from "@/lib/session";
import type { Course, InstructorOption, LessonSummary } from "@/lib/types";

type ManagedCourse = Course & {
  canEdit?: boolean;
  lessons: LessonSummary[];
  quizzes: { id: number; title: string; questionCount: number }[];
};

export default async function ManageCoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireAuthor();
  const course = await fetchItem<ManagedCourse>(`/api/courses/${id}`);
  if (!course) return <p className="text-ink-600">Course not found.</p>;
  if (course.canEdit === false) {
    return (
      <>
        <PageHeader
          eyebrow="Teaching workspace"
          title={course.title}
          description="This course belongs to another instructor and is available for viewing only."
        />
        <div className="mt-8 rounded border border-ink-200 bg-white p-6">
          <p className="text-ink-600">
            You do not have permission to edit this course.
          </p>
          <ButtonLink
            className="mt-5"
            href="/manage/courses"
            variant="secondary"
          >
            Back to my courses
          </ButtonLink>
        </div>
      </>
    );
  }
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
            {course.title}
          </h1>
          <div className="flex items-center gap-2">
            <ButtonLink
              href={`/manage/courses/${id}/roster`}
              variant="secondary"
              size="sm"
            >
              View progress
            </ButtonLink>
            <BackButton />
          </div>
        </div>
        <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-ink-500">
          Manage course details, lessons, and quizzes.
        </p>
      </header>

      <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="rounded border border-ink-200 bg-white p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-ink-400">Course details</p>
              <p className="mt-3 text-sm leading-relaxed text-ink-600">{course.description || course.summary || "No description yet."}</p>
            </div>
            <CourseAuthoringDialog course={course} instructors={instructors} canAssignInstructor={canAssignInstructor} />
          </div>
        </div>
        <div className="space-y-6">
          <section className="rounded border border-ink-200 bg-white p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="font-bold text-ink-900">Lessons</h2>
              <LessonAuthoringDialog courseId={id} />
            </div>
            <LessonRail
              lessons={course.lessons ?? []}
              mode="manage"
              courseId={id}
            />
          </section>

          <section className="rounded border border-ink-200 bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-bold text-ink-900">Quizzes</h2>
              <QuizAuthoringDialog courseId={id} />
            </div>
            <QuizRail
              quizzes={(course.quizzes ?? []).map((quiz, index) => ({
                ...quiz,
                documentId: "",
                description: null,
                passingScore: 70,
                position: index + 1,
                completed: false,
                score: null,
                passed: null,
              }))}
              courseId={id}
              mode="manage"
            />
          </section>
        </div>
      </div>
    </>
  );
}

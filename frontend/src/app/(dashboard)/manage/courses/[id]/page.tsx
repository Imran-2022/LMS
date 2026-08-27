import { CourseAuthoringDialog } from "@/components/courses/CourseAuthoringDialog";
import { LessonAuthoringDialog } from "@/components/courses/LessonAuthoringDialog";
import { QuizAuthoringDialog } from "@/components/quiz/QuizAuthoringDialog";
import { LessonRail } from "@/components/courses/LessonRail";
import { QuizRail } from "@/components/quiz/QuizRail";
import { BackButton } from "@/components/ui/BackButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { ButtonLink } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { CoverImage } from "@/components/courses/CoverImage";
import { LevelBadge, StatusBadge } from "@/components/ui/Badge";
import { fetchItem, fetchList } from "@/lib/api";
import { formatDuration } from "@/lib/format";
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
            <CourseAuthoringDialog course={course} instructors={instructors} canAssignInstructor={canAssignInstructor} />
            <BackButton />
          </div>
        </div>
        <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-ink-500">
          Manage course details, lessons, and quizzes.
        </p>
      </header>

      <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="overflow-hidden rounded border border-ink-200 bg-white">
          <CoverImage src={course.coverImageUrl} alt={course.title} ratio="aspect-[2/1]" />
          <div className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-ink-400">Course details</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <LevelBadge level={course.level} />
                  <StatusBadge status={course.status} />
                  {course.category ? <span className="text-sm text-ink-500">{course.category}</span> : null}
                </div>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink-500">
              <span>{course.lessonCount} {course.lessonCount === 1 ? "lesson" : "lessons"}</span>
              <span>{formatDuration(course.durationMinutes)}</span>
              <span>{course.enrollmentCount} enrolled</span>
            </div>
            <div className="mt-5 flex items-center gap-3 border-t border-ink-100 pt-5">
              <Avatar name={course.owner?.fullName ?? course.owner?.username ?? "CPS Academy LMS"} src={course.owner?.avatarUrl} size="sm" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Instructor</p>
                <p className="mt-0.5 font-semibold text-ink-800">{course.owner?.fullName ?? course.owner?.username ?? "CPS Academy LMS"}</p>
              </div>
            </div>
            <p className="mt-5 whitespace-pre-line text-sm leading-relaxed text-ink-600">{course.description || course.summary || "No description yet."}</p>
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

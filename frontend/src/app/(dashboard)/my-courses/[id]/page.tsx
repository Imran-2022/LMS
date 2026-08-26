import { LessonRail } from "@/components/courses/LessonRail";
import { QuizRail } from "@/components/quiz/QuizRail";
import { ButtonLink } from "@/components/ui/Button";
import { fetchItem } from "@/lib/api";
import type { Course, CourseQuizSummary, LessonSummary } from "@/lib/types";

type LearningCourse = Course & { lessons: LessonSummary[]; quizzes: CourseQuizSummary[] };

export default async function LearningCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const course = await fetchItem<LearningCourse>(`/api/courses/${id}`);
  if (!course) return <p className="text-ink-600">Course not found or you are not enrolled.</p>;

  return (
    <>
      <header>
        <p className="mb-2 text-[11.5px] font-bold uppercase tracking-[0.1em] text-brand-500">
          Learning workspace
        </p>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="min-w-0 text-[26px] font-bold leading-tight tracking-tight text-ink-900 sm:text-[30px]">
            {course.title}
          </h1>
          <ButtonLink href="/my-courses" variant="secondary" size="sm">
            Back to my courses
          </ButtonLink>
        </div>
        {course.summary ? (
          <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-ink-500">
            {course.summary}
          </p>
        ) : null}
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section>
          <h2 className="mb-4 text-xl font-bold text-ink-900">Lessons</h2>
          <LessonRail
            lessons={course.lessons ?? []}
            mode="learn"
            courseId={id}
            completedIds={course.progress?.completedLessonIds}
          />
        </section>

        <aside className="rounded border border-ink-200 bg-white p-5">
          <h2 className="font-bold text-ink-900">Quizzes</h2>
          <QuizRail quizzes={course.quizzes ?? []} courseId={id} />
        </aside>
      </div>
    </>
  );
}
import { LessonRail } from "@/components/courses/LessonRail";
import { QuizRail } from "@/components/quiz/QuizRail";
import { PageHeader } from "@/components/ui/PageHeader";
import { fetchItem } from "@/lib/api";
import type { Course, CourseQuizSummary, LessonSummary } from "@/lib/types";

type LearningCourse = Course & { lessons: LessonSummary[]; quizzes: CourseQuizSummary[] };

export default async function LearningCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const course = await fetchItem<LearningCourse>(`/api/courses/${id}`);
  if (!course) return <p className="text-ink-600">Course not found or you are not enrolled.</p>;
  return <><PageHeader eyebrow="Learning workspace" title={course.title} description={course.summary ?? undefined} /><div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]"><section><h2 className="mb-4 text-xl font-bold text-ink-900">Lessons</h2><LessonRail lessons={course.lessons ?? []} mode="learn" courseId={id} completedIds={course.progress?.completedLessonIds} /></section><aside className="rounded border border-ink-200 bg-white p-5"><h2 className="font-bold text-ink-900">Quizzes</h2><QuizRail quizzes={course.quizzes ?? []} courseId={id} /></aside></div></>;
}
import { LessonRail } from "@/components/courses/LessonRail";
import { PageHeader } from "@/components/ui/PageHeader";
import { ButtonLink } from "@/components/ui/Button";
import { fetchItem } from "@/lib/api";
import type { Course, LessonSummary } from "@/lib/types";

type LearningCourse = Course & { lessons: LessonSummary[]; quizzes: { id: number; title: string }[] };

export default async function LearningCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const course = await fetchItem<LearningCourse>(`/api/courses/${id}`);
  if (!course) return <p className="text-ink-600">Course not found or you are not enrolled.</p>;
  return <><PageHeader eyebrow="Learning workspace" title={course.title} description={course.summary ?? undefined} /><div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]"><section><h2 className="mb-4 text-xl font-bold text-ink-900">Lessons</h2><LessonRail lessons={course.lessons ?? []} mode="learn" courseId={id} completedIds={course.progress?.completedLessonIds} /></section><aside className="rounded border border-ink-200 bg-white p-5"><h2 className="font-bold text-ink-900">Quizzes</h2>{course.quizzes?.length ? <ul className="mt-4 space-y-2">{course.quizzes.map((quiz) => <li key={quiz.id}><ButtonLink href={`/my-courses/${id}/quiz/${quiz.id}`} variant="secondary" fullWidth size="sm">{quiz.title}</ButtonLink></li>)}</ul> : <p className="mt-3 text-sm text-ink-500">No quizzes yet.</p>}</aside></div></>;
}
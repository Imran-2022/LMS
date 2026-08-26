import { CourseForm } from "@/components/courses/CourseForm";
import { LessonRail } from "@/components/courses/LessonRail";
import { PageHeader } from "@/components/ui/PageHeader";
import { ButtonLink } from "@/components/ui/Button";
import { fetchItem } from "@/lib/api";
import type { Course, LessonSummary } from "@/lib/types";

type ManagedCourse = Course & { canEdit?: boolean; lessons: LessonSummary[]; quizzes: { id: number; title: string }[] };

export default async function ManageCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const course = await fetchItem<ManagedCourse>(`/api/courses/${id}`);
  if (!course) return <p className="text-ink-600">Course not found.</p>;
  if (course.canEdit === false) {
    return <><PageHeader eyebrow="Teaching workspace" title={course.title} description="This course belongs to another instructor and is available for viewing only." /><div className="mt-8 rounded border border-ink-200 bg-white p-6"><p className="text-ink-600">You do not have permission to edit this course.</p><ButtonLink className="mt-5" href="/manage/courses" variant="secondary">Back to my courses</ButtonLink></div></>;
  }
  return <><PageHeader eyebrow="Teaching workspace" title={course.title} description="Manage course details, lessons, and quizzes." /><div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px]"><div className="rounded border border-ink-200 bg-white p-6"><CourseForm course={course} /></div><div className="space-y-6"><section className="rounded border border-ink-200 bg-white p-5"><div className="mb-4 flex items-center justify-between"><h2 className="font-bold text-ink-900">Lessons</h2><ButtonLink href={`/manage/courses/${id}/lessons/new`} size="sm">Add lesson</ButtonLink></div><LessonRail lessons={course.lessons ?? []} mode="manage" courseId={id} /></section><section className="rounded border border-ink-200 bg-white p-5"><div className="mb-4 flex items-center justify-between"><h2 className="font-bold text-ink-900">Quizzes</h2><ButtonLink href={`/manage/courses/${id}/quiz/new`} size="sm">Add quiz</ButtonLink></div>{course.quizzes?.length ? <ul className="space-y-2">{course.quizzes.map((quiz) => <li key={quiz.id}><ButtonLink href={`/manage/courses/${id}/quiz/${quiz.id}`} variant="secondary" fullWidth size="sm">{quiz.title}</ButtonLink></li>)}</ul> : <p className="text-sm text-ink-500">No quizzes yet.</p>}</section></div></div></>;
}
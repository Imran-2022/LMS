import { setLessonComplete } from "@/lib/actions/progress";
import { fetchItem, fetchList } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { SubmitButton } from "@/components/ui/SubmitButton";
import type { LessonDetail } from "@/lib/types";

type CompletedLesson = { lessonId: number };

export default async function LessonPage({ params }: { params: Promise<{ id: string; lessonId: string }> }) {
  const { id, lessonId } = await params;
  const lesson = await fetchItem<LessonDetail>(`/api/lessons/${lessonId}`);
  if (!lesson) return <p className="text-ink-600">Lesson not found.</p>;
  const completedLessons = await fetchList<CompletedLesson>(`/api/lesson-progress/mine?courseId=${id}`);
  const completed = completedLessons.some((item) => item.lessonId === lesson.id);

  return <><PageHeader eyebrow={`Course ${id}`} title={lesson.title} description={lesson.summary ?? undefined} /><article className="mt-8 max-w-3xl rounded-2xl border border-ink-200 bg-white p-6 sm:p-8"><div className="whitespace-pre-line text-[15px] leading-8 text-ink-700">{lesson.content ?? "This lesson has no written content yet."}</div>{lesson.videoUrl ? <a className="mt-6 inline-block font-semibold text-brand-700" href={lesson.videoUrl} target="_blank" rel="noreferrer">Watch lesson video</a> : null}<form action={setLessonComplete} className="mt-8 flex flex-wrap items-center gap-3 border-t border-ink-100 pt-6"><input type="hidden" name="lessonId" value={lesson.id} /><input type="hidden" name="courseId" value={id} /><input type="hidden" name="completed" value={String(!completed)} /><input type="hidden" name="next" value={`/my-courses/${id}/lessons/${lessonId}`} /><SubmitButton variant={completed ? "secondary" : "primary"} pendingLabel="Saving...">{completed ? "Mark as incomplete" : "Mark complete"}</SubmitButton>{completed ? <span className="text-sm font-semibold text-success-600">Completed</span> : null}</form></article></>;
}
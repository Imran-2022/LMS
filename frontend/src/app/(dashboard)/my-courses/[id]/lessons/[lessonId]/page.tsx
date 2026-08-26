import { setLessonComplete } from "@/lib/actions/progress";
import { fetchItem, fetchList } from "@/lib/api";
import { BlogContent } from "@/components/blog/BlogContent";
import { VideoEmbed } from "@/components/courses/VideoEmbed";
import { LessonRail } from "@/components/courses/LessonRail";
import { BackButton } from "@/components/ui/BackButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { SubmitButton } from "@/components/ui/SubmitButton";
import type { LessonDetail, LessonSummary } from "@/lib/types";

type CompletedLesson = { lessonId: number };

export default async function LessonPage({ params }: { params: Promise<{ id: string; lessonId: string }> }) {
  const { id, lessonId } = await params;
  const lesson = await fetchItem<LessonDetail>(`/api/lessons/${lessonId}`);
  if (!lesson) return <p className="text-ink-600">Lesson not found.</p>;
  const [completedLessons, lessons] = await Promise.all([
    fetchList<CompletedLesson>(`/api/lesson-progress/mine?courseId=${id}`),
    fetchList<LessonSummary>(`/api/lessons?courseId=${id}`),
  ]);
  const completed = completedLessons.some((item) => item.lessonId === lesson.id);

  return (
    <>
      <PageHeader
        eyebrow={
          <div className="flex items-center justify-between gap-4">
            <span>
              Lesson {lesson.order}
              {lesson.totalLessons ? ` of ${lesson.totalLessons}` : ""}
            </span>
            <BackButton href={`/my-courses/${id}`} />
          </div>
        }
        title={lesson.title}
        description={lesson.summary ?? undefined}
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        <article className="rounded border border-ink-200 bg-white p-6 sm:p-8">
          {lesson.videoUrl ? <VideoEmbed url={lesson.videoUrl} /> : null}
          <BlogContent body={lesson.content} />
          <form
            action={setLessonComplete}
            className="mt-8 flex flex-wrap items-center gap-3 border-t border-ink-100 pt-6"
          >
            <input type="hidden" name="lessonId" value={lesson.id} />
            <input type="hidden" name="courseId" value={id} />
            <input type="hidden" name="completed" value={String(!completed)} />
            <input
              type="hidden"
              name="next"
              value={`/my-courses/${id}/lessons/${lessonId}`}
            />
            <SubmitButton
              variant="primary"
              pendingLabel="Saving..."
            >
              {completed ? "Mark as incomplete" : "Mark complete"}
            </SubmitButton>
          </form>
        </article>

        <aside className="rounded border border-ink-200 bg-white p-5 lg:sticky lg:top-24">
          <h2 className="text-base font-bold text-ink-900">In this course</h2>
          <p className="mt-1 text-sm text-ink-500">
            {lessons.length} {lessons.length === 1 ? "lesson" : "lessons"}
          </p>
          <div className="mt-4">
            <LessonRail
              lessons={lessons}
              mode="learn"
              courseId={id}
              completedIds={completedLessons.map((item) => item.lessonId)}
              currentLessonId={lesson.id}
            />
          </div>
        </aside>
      </div>
    </>
  );
}
import { LessonForm } from "@/components/courses/LessonForm";
import { BackButton } from "@/components/ui/BackButton";
import { fetchItem } from "@/lib/api";
import type { LessonDetail } from "@/lib/types";

export default async function ManageLessonPage({
  params,
}: {
  params: Promise<{ id: string; lessonId: string }>;
}) {
  const { id, lessonId } = await params;
  const lesson = await fetchItem<LessonDetail>(`/api/lessons/${lessonId}`);
  if (!lesson) return <p className="text-ink-600">Lesson not found.</p>;
  return (
    <>
      <header>
        <p className="mb-2 text-[11.5px] font-bold uppercase tracking-[0.1em] text-brand-500">
          Course {id}
        </p>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="min-w-0 text-[26px] font-bold leading-tight tracking-tight text-ink-900 sm:text-[30px]">
            Edit lesson
          </h1>
          <BackButton />
        </div>
        <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-ink-500">
          Update lesson content and keep the learning path in order.
        </p>
      </header>
      <div className="mt-8 max-w-3xl rounded border border-ink-200 bg-white p-6 sm:p-8">
        <LessonForm courseId={id} lesson={lesson} />
      </div>
    </>
  );
}

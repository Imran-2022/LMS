import { LessonForm } from "@/components/courses/LessonForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { fetchItem } from "@/lib/api";
import type { LessonDetail } from "@/lib/types";

export default async function ManageLessonPage({ params }: { params: Promise<{ id: string; lessonId: string }> }) {
  const { id, lessonId } = await params;
  const lesson = await fetchItem<LessonDetail>(`/api/lessons/${lessonId}`);
  if (!lesson) return <p className="text-ink-600">Lesson not found.</p>;
  return <><PageHeader eyebrow={`Course ${id}`} title="Edit lesson" description="Update lesson content and keep the learning path in order." /><div className="mt-8 max-w-3xl rounded border border-ink-200 bg-white p-6 sm:p-8"><LessonForm courseId={id} lesson={lesson} /></div></>;
}
import { LessonForm } from "@/components/courses/LessonForm";
import { PageHeader } from "@/components/ui/PageHeader";

export default async function NewLessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <><PageHeader eyebrow={`Course ${id}`} title="Add lesson" description="Create the next lesson in this course." /><div className="mt-8 max-w-3xl rounded border border-ink-200 bg-white p-6 sm:p-8"><LessonForm courseId={id} /></div></>;
}
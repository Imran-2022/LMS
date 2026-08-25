import { QuizForm } from "@/components/quiz/QuizForm";
import { PageHeader } from "@/components/ui/PageHeader";

export default async function NewQuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <><PageHeader eyebrow={`Course ${id}`} title="Add quiz" description="Create a quiz to help students practice and check their understanding." /><div className="mt-8 max-w-4xl rounded-2xl border border-ink-200 bg-white p-6 sm:p-8"><QuizForm courseId={id} /></div></>;
}
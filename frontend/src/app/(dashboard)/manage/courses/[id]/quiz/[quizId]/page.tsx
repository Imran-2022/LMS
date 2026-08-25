import { QuizForm } from "@/components/quiz/QuizForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { fetchItem } from "@/lib/api";
import type { QuizWithAnswers } from "@/lib/types";

export default async function ManageQuizPage({ params }: { params: Promise<{ id: string; quizId: string }> }) {
  const { id, quizId } = await params;
  const quiz = await fetchItem<QuizWithAnswers>(`/api/quizzes/${quizId}`);
  if (!quiz) return <p className="text-ink-600">Quiz not found.</p>;
  return <><PageHeader eyebrow={`Course ${id}`} title={quiz.title} description="Update questions, answers, and grading settings." /><div className="mt-8 max-w-4xl rounded-2xl border border-ink-200 bg-white p-6 sm:p-8"><QuizForm courseId={id} quiz={quiz} /></div></>;
}
import { QuizRunner } from "@/components/quiz/QuizRunner";
import { PageHeader } from "@/components/ui/PageHeader";
import { fetchItem } from "@/lib/api";
import type { Quiz } from "@/lib/types";

export default async function QuizPage({ params }: { params: Promise<{ id: string; quizId: string }> }) {
  const { id, quizId } = await params;
  const quiz = await fetchItem<Quiz & { myAttempts?: { score: number }[] }>(`/api/quizzes/${quizId}`);
  if (!quiz) return <p className="text-ink-600">Quiz not found.</p>;
  const previousBest = quiz.myAttempts?.reduce((best, attempt) => Math.max(best, attempt.score), 0) || null;
  return <><PageHeader eyebrow={`Course ${id}`} title={quiz.title} description={quiz.description ?? "Test your understanding and see your score immediately."} /><div className="mt-8 max-w-3xl"><QuizRunner quiz={quiz} courseId={id} previousBest={previousBest} /></div></>;
}
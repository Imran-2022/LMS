import { QuizForm } from "@/components/quiz/QuizForm";
import { BackButton } from "@/components/ui/BackButton";
import { fetchItem } from "@/lib/api";
import type { QuizWithAnswers } from "@/lib/types";

export default async function ManageQuizPage({
  params,
}: {
  params: Promise<{ id: string; quizId: string }>;
}) {
  const { id, quizId } = await params;
  const quiz = await fetchItem<QuizWithAnswers>(`/api/quizzes/${quizId}`);
  if (!quiz) return <p className="text-ink-600">Quiz not found.</p>;
  return (
    <>
      <header>
        <p className="mb-2 text-[11.5px] font-bold uppercase tracking-[0.1em] text-brand-500">
          Course {id}
        </p>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="min-w-0 text-[26px] font-bold leading-tight tracking-tight text-ink-900 sm:text-[30px]">
            {quiz.title}
          </h1>
          <BackButton />
        </div>
        <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-ink-500">
          Update questions, answers, and grading settings.
        </p>
      </header>
      <div className="mt-8 max-w-4xl rounded border border-ink-200 bg-white p-6 sm:p-8">
        <QuizForm courseId={id} quiz={quiz} />
      </div>
    </>
  );
}

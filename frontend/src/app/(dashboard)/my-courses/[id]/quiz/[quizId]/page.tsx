import { QuizRunner } from "@/components/quiz/QuizRunner";
import { ButtonLink } from "@/components/ui/Button";
import { fetchItem } from "@/lib/api";
import type { Quiz } from "@/lib/types";

export default async function QuizPage({ params }: { params: Promise<{ id: string; quizId: string }> }) {
  const { id, quizId } = await params;
  const quiz = await fetchItem<Quiz>(`/api/quizzes/${quizId}`);
  if (!quiz) return <p className="text-ink-600">Quiz not found.</p>;

  return (
    <>
      <header className="max-w-4xl">
        <p className="mb-2 text-[11.5px] font-bold uppercase tracking-[0.1em] text-brand-500">
          Course {id}
        </p>
        <div className="flex items-center justify-between gap-4">
          <h1 className="min-w-0 text-[26px] font-bold leading-tight tracking-tight text-ink-900 sm:text-[30px]">
            {quiz.title}
          </h1>
          <ButtonLink href={`/my-courses/${id}`} variant="secondary" size="sm">
            Back to course
          </ButtonLink>
        </div>
        <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-ink-500">
          {quiz.description ?? "Test your understanding and see your score immediately."}
        </p>
      </header>

      <div className="mt-8 max-w-3xl">
        <QuizRunner quiz={quiz} courseId={id} initialAttempt={quiz.myAttempt} />
      </div>
    </>
  );
}
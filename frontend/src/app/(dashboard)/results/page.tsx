import { ClipboardCheck } from "lucide-react";

import { EmptyState } from "@/components/ui/EmptyState";
import { ButtonLink } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { fetchList } from "@/lib/api";
import type { QuizAttempt } from "@/lib/types";

export default async function ResultsPage() {
  const attempts = await fetchList<QuizAttempt>("/api/quiz-attempts/mine");

  return (
    <>
      <PageHeader
        eyebrow="Learning workspace"
        title="Quiz results"
        description="Review your recent quiz attempts and scores."
      />

      <div className="mt-8 space-y-3">
        {attempts.length ? (
          attempts.map((attempt) => (
            <div
              key={attempt.id}
              className="flex items-center justify-between rounded border border-ink-200 bg-white p-5"
            >
              <div>
                <h2 className="font-bold text-ink-900">{attempt.quiz?.title ?? "Quiz"}</h2>
                <p className="mt-1 text-sm text-ink-500">
                  {attempt.correctCount} of {attempt.totalQuestions} correct
                </p>
              </div>
              <strong className="text-xl text-brand-700">{attempt.score}%</strong>
            </div>
          ))
        ) : (
          <EmptyState
            icon={<ClipboardCheck size={24} />}
            title="No quiz results yet"
            description="Complete a quiz in one of your courses to see your scores and progress here."
            action={<ButtonLink href="/my-courses">View my courses</ButtonLink>}
          />
        )}
      </div>
    </>
  );
}
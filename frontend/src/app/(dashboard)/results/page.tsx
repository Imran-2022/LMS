import Link from "next/link";
import { ArrowRight, CalendarDays, CheckCircle2, ClipboardCheck, XCircle } from "lucide-react";

import { EmptyState } from "@/components/ui/EmptyState";
import { ButtonLink } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { fetchList } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { cx } from "@/lib/format";
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
            <Link
              key={attempt.id}
              href={
                attempt.course?.id && attempt.quiz?.id
                  ? `/my-courses/${attempt.course.id}/quiz/${attempt.quiz.id}`
                  : "/results"
              }
              className="group flex flex-col gap-4 rounded border border-ink-200 bg-white p-5 transition hover:-translate-y-px hover:border-brand-200 hover:shadow-[0_10px_26px_rgba(15,23,42,0.06)] sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
                  {attempt.course?.title ?? "Course"}
                </p>
                <h2 className="mt-1 truncate font-bold text-ink-900 group-hover:text-brand-700">
                  {attempt.quiz?.title ?? "Quiz"}
                </h2>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-500">
                  <span>{attempt.correctCount} of {attempt.totalQuestions} correct</span>
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {formatDate(attempt.submittedAt)}
                  </span>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-4">
                <div className="text-right">
                  <strong className="block text-xl text-brand-700">{attempt.score}%</strong>
                  <span
                    className={cx(
                      "inline-flex items-center gap-1 text-xs font-semibold",
                      attempt.passed ? "text-success-600" : "text-danger-600",
                    )}
                  >
                    {attempt.passed ? (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5" />
                    )}
                    {attempt.passed ? "Passed" : "Needs review"}
                  </span>
                </div>
                <ArrowRight className="h-5 w-5 text-ink-300 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-500" />
              </div>
            </Link>
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
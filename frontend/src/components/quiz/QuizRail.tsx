import { Check, Clock, FileText } from "lucide-react";
import Link from "next/link";

import { cx } from "@/lib/format";
import type { CourseQuizSummary } from "@/lib/types";

export function QuizRail({ quizzes, courseId }: { quizzes: CourseQuizSummary[]; courseId: number | string }) {
  if (!quizzes.length) {
    return <p className="mt-3 text-sm text-ink-500">No quizzes yet.</p>;
  }

  return (
    <ol className="mt-4 space-y-2">
      {quizzes.map((quiz) => (
        <li key={quiz.id}>
          <Link
            href={`/my-courses/${courseId}/quiz/${quiz.id}`}
            className={cx(
              "group flex items-center gap-3 rounded border px-3 py-3 transition-colors",
              quiz.completed
                ? "border-success-100 bg-success-50/50 hover:border-success-200"
                : "border-ink-200 bg-white hover:border-brand-200 hover:bg-brand-50/30",
            )}
          >
            <span
              className={cx(
                "grid h-8 w-8 shrink-0 place-items-center rounded text-[12px] font-bold",
                quiz.completed ? "bg-success-500 text-white" : "bg-brand-50 text-brand-600",
              )}
            >
              {quiz.completed ? <Check className="h-4 w-4" strokeWidth={3} /> : quiz.position}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-ink-900 group-hover:text-brand-700">
                {quiz.title}
              </span>
              <span className="mt-0.5 flex items-center gap-1.5 text-xs text-ink-500">
                <FileText className="h-3.5 w-3.5" />
                {quiz.questionCount} questions
              </span>
            </span>
            {quiz.completed ? (
              <span className={cx("shrink-0 text-sm font-bold", quiz.passed ? "text-success-600" : "text-danger-600")}>
                {quiz.score}%
              </span>
            ) : (
              <Clock className="h-4 w-4 shrink-0 text-ink-400" />
            )}
          </Link>
        </li>
      ))}
    </ol>
  );
}
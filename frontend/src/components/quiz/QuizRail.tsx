import { Check, Clock, FileText, Trash2 } from "lucide-react";
import Link from "next/link";
import { QuizAuthoringDialog } from "./QuizAuthoringDialog";
import { deleteQuiz } from "@/lib/actions/quiz";
import { DangerousSubmit } from "@/components/ui/DangerousSubmit";

import { cx } from "@/lib/format";
import type { CourseQuizSummary } from "@/lib/types";

export function QuizRail({
  quizzes,
  courseId,
  mode = "learn",
}: {
  quizzes: CourseQuizSummary[];
  courseId: number | string;
  mode?: "learn" | "manage";
}) {
  if (!quizzes.length) {
    return <p className="mt-3 text-sm text-ink-500">No quizzes yet.</p>;
  }

  return (
    <ol className="mt-4 space-y-2">
      {quizzes.map((quiz) => (
        <li key={quiz.id}>
          {mode === "manage" ? (
            <div className="relative">
              <QuizAuthoringDialog courseId={courseId} quiz={quiz} trigger={<button type="button" className="group flex w-full cursor-pointer items-center gap-3.5 rounded border border-ink-200/70 bg-white px-3.5 py-3 pr-16 text-left hover:border-brand-200"><span className="grid h-8 w-8 shrink-0 place-items-center rounded bg-brand-50 text-[12px] font-bold text-brand-600">{quiz.position}</span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-ink-900">{quiz.title}</span><span className="mt-0.5 block text-xs text-ink-500">{quiz.questionCount} questions</span></span></button>} />
              <form action={deleteQuiz} className="absolute right-2 top-1/2 -translate-y-1/2 border-l border-ink-100 bg-white pl-2">
                <input type="hidden" name="courseId" value={courseId} />
                <input type="hidden" name="quizId" value={quiz.id} />
                <DangerousSubmit variant="ghost" size="sm" confirm="Delete this quiz? Its questions and attempts will also be removed." aria-label={`Delete ${quiz.title}`} title="Delete quiz" className="h-9 w-9 px-0 text-danger-600 hover:bg-danger-50 hover:text-danger-700"><Trash2 className="h-4 w-4" /></DangerousSubmit>
              </form>
            </div>
          ) : (
          <Link
            href={`/my-courses/${courseId}/quiz/${quiz.id}`}
            className={cx(
              "group flex items-center gap-3.5 rounded border px-3.5 py-3 transition-all",
              mode === "learn" && quiz.completed
                ? "border-success-100 bg-success-50/50 hover:border-success-200"
                : "border-ink-200/70 bg-white hover:-translate-y-px hover:border-brand-200 hover:shadow-[0_10px_26px_rgba(15,23,42,0.06)]",
            )}
          >
            <span
              className={cx(
                "grid h-8 w-8 shrink-0 place-items-center rounded text-[12px] font-bold",
                mode === "learn" && quiz.completed
                  ? "bg-success-500 text-white"
                  : "bg-brand-50 text-brand-600 group-hover:bg-brand-100",
              )}
            >
              {mode === "learn" && quiz.completed ? (
                <Check className="h-4 w-4" strokeWidth={3} />
              ) : (
                quiz.position
              )}
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
            {mode === "learn" && quiz.completed ? (
              <span
                className={cx(
                  "shrink-0 text-sm font-bold",
                  quiz.passed ? "text-success-600" : "text-danger-600",
                )}
              >
                {quiz.score}%
              </span>
            ) : (
              <Clock className="h-4 w-4 shrink-0 text-ink-400" />
            )}
          </Link>
          )}
        </li>
      ))}
    </ol>
  );
}

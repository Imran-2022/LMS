import type { Quiz, QuizAttempt } from "@/lib/types";
import { cx } from "@/lib/format";

import { AnswerMark } from "./AnswerMark";

export function QuizResult({
  attempt,
  quiz,
}: {
  attempt: QuizAttempt;
  quiz: Quiz;
}) {
  return (
    <section className="rounded border border-ink-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold text-brand-600">Quiz complete</p>
      <h2 className="mt-2 text-2xl font-bold text-ink-950">{quiz.title}</h2>
      <p className="mt-3 text-ink-600">
        Score: <strong className="text-ink-900">{attempt.score}%</strong>
      </p>
      {attempt.currentQuestionCount !== undefined &&
      attempt.currentQuestionCount !== attempt.totalQuestions ? (
        <p className="mt-3 rounded border border-brand-100 bg-brand-50 px-3 py-2 text-sm text-brand-800">
          This quiz has been updated since you submitted. Your result remains {attempt.correctCount} of {attempt.totalQuestions} questions from the original version.
        </p>
      ) : null}

      {attempt.breakdown?.length ? (
        <div className="mt-6 space-y-4 border-t border-ink-100 pt-6">
          <h3 className="text-lg font-bold text-ink-900">
            Review your answers
          </h3>
          {attempt.breakdown.map((question) => {
            return (
              <article
                key={question.questionIndex}
                className="rounded border border-ink-200 p-4"
              >
                <div className="flex items-start gap-3">
                  <AnswerMark
                    state={question.isCorrect ? "correct" : "wrong"}
                  />
                  <h4 className="font-semibold leading-snug text-ink-900">
                    {question.questionIndex + 1}. {question.questionText}
                  </h4>
                </div>
                <div className="mt-4 space-y-2 pl-8">
                  {question.options.map((option) => {
                    const isSelected =
                      option.index === question.selectedOptionIndex;
                    const isCorrect =
                      option.index === question.correctOptionIndex;

                    return (
                      <div
                        key={option.index}
                        className={cx(
                          "flex items-center justify-between gap-3 rounded border px-3 py-2.5 text-sm",
                          isCorrect
                            ? "border-success-200 bg-success-50/70 text-success-700"
                            : isSelected
                              ? "border-danger-200 bg-danger-50/70 text-danger-700"
                              : "border-ink-200 bg-white text-ink-600",
                        )}
                      >
                        <span>{option.text}</span>
                        <span className="shrink-0 text-[11px] font-semibold uppercase tracking-wide">
                          {isCorrect
                            ? "Correct"
                            : isSelected
                              ? "Your answer"
                              : ""}
                        </span>
                      </div>
                    );
                  })}
                </div>
                {question.explanation ? (
                  <div className="mt-4 rounded bg-brand-50 px-3 py-2.5 pl-11 text-sm text-brand-800">
                    <p className="font-semibold text-brand-700">
                      Why this is correct
                    </p>
                    <p className="mt-1">{question.explanation}</p>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}

import type { Quiz, QuizAttempt } from "@/lib/types";

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

      {attempt.breakdown?.length ? (
        <div className="mt-6 space-y-4 border-t border-ink-100 pt-6">
          <h3 className="text-lg font-bold text-ink-900">Review your answers</h3>
          {attempt.breakdown.map((question) => {
            const selected = question.options.find(
              (option) => option.index === question.selectedOptionIndex,
            );
            const correct = question.options.find(
              (option) => option.index === question.correctOptionIndex,
            );

            return (
              <article key={question.questionIndex} className="rounded border border-ink-200 p-4">
                <div className="flex items-start gap-3">
                  <AnswerMark state={question.isCorrect ? "correct" : "wrong"} />
                  <h4 className="font-semibold leading-snug text-ink-900">
                    {question.questionIndex + 1}. {question.questionText}
                  </h4>
                </div>
                <dl className="mt-3 space-y-2 pl-8 text-sm">
                  <div>
                    <dt className="font-semibold text-ink-500">Your answer</dt>
                    <dd className="text-ink-700">{selected?.text ?? "Not answered"}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-success-600">Correct answer</dt>
                    <dd className="text-ink-700">{correct?.text ?? "Unavailable"}</dd>
                  </div>
                  {question.explanation ? (
                    <div>
                      <dt className="font-semibold text-brand-700">Why</dt>
                      <dd className="text-ink-600">{question.explanation}</dd>
                    </div>
                  ) : null}
                </dl>
              </article>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
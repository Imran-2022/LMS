"use client";

/**
 * QuizRunner — sitting a quiz, and seeing the result.
 *
 * The two states live in one component because the result arrives as the return value
 * of the submit action: `useActionState` hands back `{ attempt }`, and the attempt
 * carries the per-question `breakdown` that only exists in the response to the POST.
 * Splitting this across two routes would mean re-reading the attempt from history,
 * where the breakdown is not included, and the student would get a bare score.
 *
 * What this component does *not* do is any marking. It collects radio selections and
 * posts them. The answer key is not in the payload it received — `GET /api/quizzes/:id`
 * strips `correctOptionIndex` for students — so grading here would be impossible even if
 * it were a good idea. The score comes back from the server, computed against the stored
 * key. Same for `passed`: that is the server comparing against the quiz's own
 * `passingScore`, not this component's opinion.
 */
import { ArrowLeft } from "lucide-react";
import { useActionState, useState } from "react";

import { submitQuizAttempt } from "@/lib/actions/quiz";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FormError } from "@/components/ui/Input";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { cx } from "@/lib/format";
import type { Quiz, QuizAttempt } from "@/lib/types";

import { QuizResult } from "./QuizResult";

export function QuizRunner({
  quiz,
  courseId,
  initialAttempt,
}: {
  quiz: Quiz;
  courseId: number | string;
  initialAttempt?: QuizAttempt;
}) {
  const [state, action] = useActionState(submitQuizAttempt, undefined);

  // Which option is selected per question. Held in state purely to drive the
  // "5 of 6 answered" counter and the selected styling; the values that get submitted
  // are the radio inputs themselves.
  const [selected, setSelected] = useState<Record<number, number>>({});
  const answered = Object.keys(selected).length;
  const total = quiz.questions.length;

  if (state?.attempt || initialAttempt) {
    return (
      <QuizResult attempt={state?.attempt ?? initialAttempt!} quiz={quiz} />
    );
  }

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="quizId" value={quiz.id} />
      <input type="hidden" name="courseId" value={courseId} />
      <input type="hidden" name="questionCount" value={total} />

      <FormError>{state?.error}</FormError>

      <ol className="space-y-4">
        {quiz.questions.map((question, index) => (
          <li key={question.id}>
            <fieldset className="rounded border border-ink-200/70 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
              <legend className="sr-only">Question {index + 1}</legend>

              <div className="mb-4 flex items-start gap-3">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded bg-brand-50 text-[12.5px] font-bold tabular-nums text-brand-600">
                  {index + 1}
                </span>
                <p className="pt-0.5 text-[15px] font-semibold leading-snug text-ink-900">
                  {question.text}
                </p>
              </div>

              <div className="space-y-2 pl-10">
                {question.options.map((option) => {
                  const checked = selected[question.index] === option.index;
                  const id = `q${question.index}-o${option.index}`;

                  return (
                    <label
                      key={option.id}
                      htmlFor={id}
                      className={cx(
                        "flex cursor-pointer items-center gap-3 rounded border px-4 py-3 text-[14px] transition-all",
                        checked
                          ? "border-brand-400 bg-brand-50/70 font-medium text-brand-800 shadow-[0_0_0_3px_rgba(124,58,237,0.08)]"
                          : "border-ink-200 bg-white text-ink-700 hover:border-brand-200 hover:bg-brand-50/30",
                      )}
                    >
                      <input
                        id={id}
                        type="radio"
                        name={`answer-${question.index}`}
                        value={option.index}
                        checked={checked}
                        onChange={() =>
                          setSelected((current) => ({
                            ...current,
                            [question.index]: option.index,
                          }))
                        }
                        className="h-4 w-4 shrink-0 cursor-pointer accent-brand-500"
                      />
                      {option.text}
                    </label>
                  );
                })}
              </div>
            </fieldset>
          </li>
        ))}
      </ol>

      <Card className="sticky bottom-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[13.5px] font-semibold text-ink-900 tabular-nums">
            {answered} of {total} answered
          </p>
          <p className="mt-0.5 text-[12.5px] text-ink-500">
            {answered < total
              ? "Unanswered questions are marked wrong — they still count in the total."
              : "All questions answered. Marking is instant."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ButtonLink href={`/my-courses/${courseId}`} variant="ghost">
            <ArrowLeft className="h-4 w-4" />
            Back
          </ButtonLink>
          <SubmitButton
            size="lg"
            pendingLabel="Marking…"
            disabled={answered === 0}
          >
            Submit answers
          </SubmitButton>
        </div>
      </Card>
    </form>
  );
}

"use client";

/**
 * QuizForm — the quiz builder.
 *
 * The only genuinely stateful form in the app, because the number of questions is not
 * known until the author decides. State holds *structure* (how many question blocks,
 * how many option slots each has, which radio is checked); the text itself stays in
 * uncontrolled inputs and travels as `FormData`. That keeps re-renders cheap — typing
 * in a question body does not re-render the other nine questions.
 *
 * Field names are flat (`q-0-text`, `q-0-opt-2`, `q-0-correct`) because that is what
 * `FormData` can carry. `readQuestions` in `lib/actions/quiz.ts` reassembles them, and
 * the two halves have to agree on the naming — hence the comment there as well as here.
 *
 * One detail worth pointing out: each question block is keyed by a stable id, not by
 * its array index. Keying by index means deleting question 2 makes React reuse the old
 * question 2's DOM node for the former question 3, and since the inputs are
 * uncontrolled, the text stays behind while the label changes. That bug looks like data
 * corruption and is entirely a keying mistake.
 */
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { useId, useState } from "react";
import { useActionState } from "react";

import { createQuiz, updateQuiz } from "@/lib/actions/quiz";
import { Button } from "@/components/ui/Button";
import { FormError, Input, Textarea } from "@/components/ui/Input";
import { FieldsetLegend } from "@/components/ui/PageHeader";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { cx } from "@/lib/format";
import type { QuizWithAnswers } from "@/lib/types";

/** Must match `MAX_OPTIONS` in `lib/actions/quiz.ts`. */
const MAX_OPTIONS = 6;
const MIN_OPTIONS = 2;

type DraftOption = { key: string; text: string };

type Draft = {
  key: string;
  text: string;
  explanation: string;
  options: DraftOption[];
  correct: number;
};

let sequence = 0;
/**
 * Stable keys for newly-added rows.
 *
 * A counter rather than `Math.random()` or `Date.now()`: both differ between the server
 * render and the client hydration, and React logs a mismatch for the changed key. The
 * counter only ever runs on the client (rows are added by a click), so it is safe.
 */
function nextKey(prefix: string) {
  sequence += 1;
  return `${prefix}-${sequence}`;
}

function blankQuestion(): Draft {
  return {
    key: nextKey("q"),
    text: "",
    explanation: "",
    options: [
      { key: nextKey("o"), text: "" },
      { key: nextKey("o"), text: "" },
      { key: nextKey("o"), text: "" },
      { key: nextKey("o"), text: "" },
    ],
    correct: 0,
  };
}

/** Turn an existing quiz into editable drafts, padding to four option slots. */
function toDrafts(quiz?: QuizWithAnswers): Draft[] {
  if (!quiz || quiz.questions.length === 0) return [blankQuestion()];

  return quiz.questions.map((question) => {
    const options: DraftOption[] = question.options.map((option) => ({
      key: nextKey("o"),
      text: option.text,
    }));
    while (options.length < 4) options.push({ key: nextKey("o"), text: "" });

    return {
      key: nextKey("q"),
      text: question.text,
      explanation: question.explanation ?? "",
      options,
      correct: question.correctOptionIndex,
    };
  });
}

export function QuizForm({
  courseId,
  quiz,
}: {
  courseId: number | string;
  quiz?: QuizWithAnswers;
}) {
  const editing = Boolean(quiz);
  const [state, action] = useActionState(editing ? updateQuiz : createQuiz, undefined);
  const [questions, setQuestions] = useState<Draft[]>(() => toDrafts(quiz));
  const formId = useId();

  function update(key: string, change: (draft: Draft) => Draft) {
    setQuestions((current) =>
      current.map((question) => (question.key === key ? change(question) : question)),
    );
  }

  return (
    <form action={action} className="space-y-6">
      <FormError>{state?.error}</FormError>

      <input type="hidden" name="courseId" value={courseId} />
      {quiz ? <input type="hidden" name="quizId" value={quiz.id} /> : null}
      {/* The action loops from 0 to this number to find the question blocks. */}
      <input type="hidden" name="questionCount" value={questions.length} />

      <Input
        label="Quiz title"
        name="title"
        required
        maxLength={160}
        defaultValue={quiz?.title ?? ""}
        placeholder="e.g. React fundamentals check"
      />

      <Textarea
        label="Description"
        name="description"
        rows={2}
        defaultValue={quiz?.description ?? ""}
        placeholder="What this quiz covers, and anything the student should know before starting."
      />

      <Input
        label="Passing score"
        name="passingScore"
        type="number"
        min={0}
        max={100}
        defaultValue={quiz?.passingScore ?? 70}
        wrapperClassName="sm:max-w-[220px]"
        hint="Percent needed to pass. Marking is automatic — this only decides pass or fail."
      />

      <FieldsetLegend>Questions</FieldsetLegend>

      <div className="space-y-4">
        {questions.map((question, index) => (
          <fieldset
            key={question.key}
            className="rounded border border-ink-200/70 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]"
          >
            <legend className="sr-only">Question {index + 1}</legend>

            <div className="mb-4 flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2 text-[12.5px] font-bold uppercase tracking-[0.08em] text-brand-600">
                <GripVertical className="h-4 w-4 text-ink-300" />
                Question {index + 1}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                // Removing the only question would leave a form that cannot be saved
                // and no obvious way to recover, so the last one stays.
                disabled={questions.length === 1}
                onClick={() =>
                  setQuestions((current) => current.filter((item) => item.key !== question.key))
                }
                className="text-danger-600 hover:bg-danger-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Remove
              </Button>
            </div>

            <Textarea
              label="Question"
              name={`q-${index}-text`}
              rows={2}
              required
              defaultValue={question.text}
              placeholder="What do you want to ask?"
            />

            <div className="mt-4">
              <p className="mb-2 text-[13px] font-semibold text-ink-700">
                Answer options
                <span className="ml-2 font-normal text-ink-400">
                  select the radio button next to the correct answer
                </span>
              </p>

              <div className="space-y-2">
                {question.options.map((option, slot) => {
                  const radioId = `${formId}-${question.key}-${option.key}`;
                  const isCorrect = question.correct === slot;

                  return (
                    <div
                      key={option.key}
                      className={cx(
                        "flex items-center gap-3 rounded border px-3 py-2 transition-colors",
                        isCorrect
                          ? "border-success-500/40 bg-success-50/60"
                          : "border-ink-200 bg-white",
                      )}
                    >
                      {/*
                        The radio's `value` is the *slot* number, not the position among
                        filled options. The action compacts blank slots out and remaps
                        this index accordingly — see `readQuestions`.
                      */}
                      <input
                        id={radioId}
                        type="radio"
                        name={`q-${index}-correct`}
                        value={slot}
                        checked={isCorrect}
                        onChange={() => update(question.key, (draft) => ({ ...draft, correct: slot }))}
                        className="h-4 w-4 shrink-0 cursor-pointer accent-success-500"
                      />
                      <label htmlFor={radioId} className="sr-only">
                        Mark option {slot + 1} as the correct answer
                      </label>
                      <input
                        name={`q-${index}-opt-${slot}`}
                        defaultValue={option.text}
                        placeholder={`Option ${slot + 1}${slot < MIN_OPTIONS ? " (required)" : " (optional)"}`}
                        aria-label={`Option ${slot + 1} text`}
                        className="w-full border-0 bg-transparent text-sm text-ink-800 outline-none placeholder:text-ink-400"
                      />
                      <Button
                        type="button"
                        // Below the minimum there is nothing to delete: a question needs
                        // at least two options to be answerable.
                        disabled={question.options.length <= MIN_OPTIONS}
                        onClick={() =>
                          update(question.key, (draft) => ({
                            ...draft,
                            options: draft.options.filter((item) => item.key !== option.key),
                            // If the removed slot was the answer, or sat before it, the
                            // marked index has to move or it points at the wrong option.
                            correct:
                              draft.correct === slot
                                ? 0
                                : draft.correct > slot
                                  ? draft.correct - 1
                                  : draft.correct,
                          }))
                        }
                        aria-label={`Remove option ${slot + 1}`}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 shrink-0 p-0 text-ink-400 hover:bg-danger-50 hover:text-danger-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  );
                })}
              </div>

              {question.options.length < MAX_OPTIONS ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="mt-2"
                  onClick={() =>
                    update(question.key, (draft) => ({
                      ...draft,
                      options: [...draft.options, { key: nextKey("o"), text: "" }],
                    }))
                  }
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add option
                </Button>
              ) : null}
            </div>

            <div className="mt-4">
              <Input
                label="Explanation"
                name={`q-${index}-explanation`}
                defaultValue={question.explanation}
                placeholder="Why that answer is right — shown after the student submits."
                hint="Optional, but it turns a score into feedback."
              />
            </div>
          </fieldset>
        ))}
      </div>

      <Button
        type="button"
        variant="secondary"
        onClick={() => setQuestions((current) => [...current, blankQuestion()])}
      >
        <Plus className="h-4 w-4" />
        Add question
      </Button>

      <div className="flex flex-wrap items-center gap-3 border-t border-ink-100 pt-5">
        <SubmitButton size="lg" pendingLabel={editing ? "Saving…" : "Creating…"}>
          {editing ? "Save quiz" : "Create quiz"}
        </SubmitButton>
        <p className="text-[12.5px] text-ink-500">
          {questions.length} question{questions.length === 1 ? "" : "s"}. Correct answers are
          stored server-side and never sent to a student&apos;s browser.
        </p>
      </div>
    </form>
  );
}

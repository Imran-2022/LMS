"use server";

/**
 * Quiz actions — authoring on one side, sitting the quiz on the other.
 *
 * The authoring half has the fiddliest input handling in the app, because a quiz form
 * is a variable-length list of variable-length lists. The two functions below
 * (`readQuestions`, and the option-compaction inside it) exist to turn flat `FormData`
 * keys back into that structure without losing which answer is the right one.
 *
 * The sitting half is the assignment's auto-grading requirement, and the thing worth
 * saying about it is what it does *not* do: no grading. The submitted answers go to the
 * API and the score comes back. Marking client-side would mean shipping the answer key
 * to the browser, which is why `GET /api/quizzes/:id` strips `correctOptionIndex` for
 * students in the first place.
 */
import { apiFetch } from "@/lib/api";
import { requireAuthor, requireStudent } from "@/lib/session";
import type { ApiItem, QuizAttempt, QuizWithAnswers } from "@/lib/types";

import { coursePaths, finish, num, optionalNum, optionalStr, refresh, str } from "./shared";
import type { FormState } from "./shared";

/** Matches the option slots the builder renders per question. */
const MAX_OPTIONS = 6;

type DraftQuestion = {
  text: string;
  options: { text: string }[];
  correctOptionIndex: number;
  explanation: string | null;
};

/**
 * Rebuild the question array from flat form keys.
 *
 * The subtlety is option compaction. The builder renders six option inputs per question
 * and the author typically fills three; the API stores only the non-empty ones, so the
 * stored indices are 0,1,2. If the author instead filled slots 1, 2 and 4 and marked
 * slot 4 as correct, submitting `correctOptionIndex: 3` against a three-item list would
 * be rejected as out of range — or worse, quietly point at the wrong answer. So the
 * options are compacted here and the correct index is remapped to its new position.
 */
function readQuestions(form: FormData): DraftQuestion[] {
  const count = Math.max(0, num(form, "questionCount"));
  const questions: DraftQuestion[] = [];

  for (let index = 0; index < count; index += 1) {
    const text = str(form, `q-${index}-text`);
    const markedCorrect = num(form, `q-${index}-correct`, 0);

    const options: { text: string }[] = [];
    let correctOptionIndex = 0;

    for (let slot = 0; slot < MAX_OPTIONS; slot += 1) {
      const optionText = str(form, `q-${index}-opt-${slot}`);
      if (!optionText) continue;
      // The correct answer's new index is however many kept options precede it.
      if (slot === markedCorrect) correctOptionIndex = options.length;
      options.push({ text: optionText });
    }

    // A wholly blank block is an option slot the author added and then left alone —
    // dropping it silently is friendlier than a validation error about a row they
    // never meant to fill in.
    if (!text && options.length === 0) continue;

    questions.push({
      text,
      options,
      correctOptionIndex,
      explanation: optionalStr(form, `q-${index}-explanation`),
    });
  }

  return questions;
}

/**
 * Check the question set before spending a round-trip.
 *
 * These rules duplicate `normaliseQuestions` in the quiz controller, and that
 * duplication is intentional here in a way it is not for permissions: the backend
 * copy is the one that protects the data, and this one exists so the author sees
 * "Question 3 needs at least two options" next to the form instead of a bare 400.
 */
function describeProblem(questions: DraftQuestion[]): string | null {
  if (questions.length === 0) return "Add at least one question.";

  for (let index = 0; index < questions.length; index += 1) {
    const question = questions[index];
    const label = `Question ${index + 1}`;
    if (!question.text) return `${label}: write the question text.`;
    if (question.options.length < 2) return `${label}: give at least two answer options.`;
  }

  return null;
}

function quizPayload(form: FormData) {
  return {
    title: str(form, "title"),
    description: optionalStr(form, "description"),
    // Clamped rather than validated: a passing score outside 0–100 is a typo, and the
    // controller clamps identically, so there is nothing to tell the author about.
    passingScore: Math.min(100, Math.max(0, num(form, "passingScore", 70))),
  };
}

export async function createQuiz(_prev: FormState, form: FormData): Promise<FormState> {
  await requireAuthor();
  const courseId = str(form, "courseId");
  const payload = quizPayload(form);
  const questions = readQuestions(form);

  if (!courseId) return { error: "Missing course reference." };
  if (!payload.title) return { error: "Give the quiz a title." };

  const problem = describeProblem(questions);
  if (problem) return { error: problem };

  const result = await apiFetch<ApiItem<QuizWithAnswers>>("/api/quizzes", {
    method: "POST",
    body: { ...payload, course: courseId, questions },
  });

  if (!result.ok) return { error: result.error };

  finish(coursePaths(courseId), `/manage/courses/${courseId}`, "quiz-created");
}

export async function updateQuiz(_prev: FormState, form: FormData): Promise<FormState> {
  await requireAuthor();
  const courseId = str(form, "courseId");
  const quizId = str(form, "quizId");
  const payload = quizPayload(form);
  const questions = readQuestions(form);

  if (!quizId) return { error: "Missing quiz reference." };
  if (!payload.title) return { error: "Give the quiz a title." };

  const problem = describeProblem(questions);
  if (problem) return { error: problem };

  const result = await apiFetch(`/api/quizzes/${quizId}`, {
    method: "PUT",
    body: { ...payload, questions },
  });

  if (!result.ok) return { error: result.error };

  finish(coursePaths(courseId), `/manage/courses/${courseId}`, "quiz-saved");
}

export async function deleteQuiz(form: FormData) {
  await requireAuthor();
  const courseId = str(form, "courseId");
  const quizId = str(form, "quizId");
  if (!quizId) return;

  const result = await apiFetch(`/api/quizzes/${quizId}`, { method: "DELETE" });

  finish(
    coursePaths(courseId),
    `/manage/courses/${courseId}`,
    result.ok ? "quiz-deleted" : "forbidden",
    !result.ok,
  );
}

/**
 * The graded result, handed back to the quiz runner.
 *
 * This action returns instead of redirecting, and that is the one place in the app
 * where that choice is load-bearing: the per-question `breakdown` — which answer was
 * wrong, and why — only exists in the response to the `POST`. Redirecting to a results
 * page would mean re-reading the attempt from history, where the breakdown is not
 * included, and the student would see a bare score with no explanations.
 */
export type AttemptState = { error?: string; attempt?: QuizAttempt } | undefined;

export async function submitQuizAttempt(_prev: AttemptState, form: FormData): Promise<AttemptState> {
  await requireStudent();

  const quizId = str(form, "quizId");
  const courseId = str(form, "courseId");
  const questionCount = Math.max(0, num(form, "questionCount"));

  if (!quizId) return { error: "Missing quiz reference." };

  const answers: { questionIndex: number; selectedOptionIndex: number }[] = [];
  for (let index = 0; index < questionCount; index += 1) {
    // `optionalNum`, not `num`: a skipped question has no radio checked, and defaulting
    // it to 0 would answer it with the first option on the student's behalf. Skipped
    // questions are simply omitted — the API still divides by the full question count,
    // so they score as wrong, which is the honest result.
    const selected = optionalNum(form, `answer-${index}`);
    if (selected === null) continue;
    answers.push({ questionIndex: index, selectedOptionIndex: selected });
  }

  if (answers.length === 0) {
    return { error: "Answer at least one question before submitting." };
  }

  const result = await apiFetch<ApiItem<QuizAttempt>>("/api/quiz-attempts", {
    method: "POST",
    body: { quiz: quizId, answers },
  });

  if (!result.ok) return { error: result.error };

  // Nothing is sent about the score: the payload above carries answers only. Anything
  // this form claimed about `score` or `passed` would be ignored by the API, which
  // recomputes both from the stored answer key.
  refresh([...coursePaths(courseId), "/results"]);

  return { attempt: result.data.data };
}

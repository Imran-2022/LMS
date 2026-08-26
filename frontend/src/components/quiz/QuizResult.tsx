import Link from "next/link";

import type { Quiz, QuizAttempt } from "@/lib/types";

export function QuizResult({
  attempt,
  quiz,
  courseId,
}: {
  attempt: QuizAttempt;
  quiz: Quiz;
  courseId: number | string;
}) {
  return (
    <section className="rounded border border-ink-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold text-brand-600">Quiz complete</p>
      <h2 className="mt-2 text-2xl font-bold text-ink-950">{quiz.title}</h2>
      <p className="mt-3 text-ink-600">
        Score: <strong className="text-ink-900">{attempt.score}%</strong>
      </p>
      <Link className="mt-6 inline-flex font-semibold text-brand-700 hover:text-brand-900" href={`/my-courses/${courseId}`}>
        Back to course
      </Link>
    </section>
  );
}
"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import { submitQuiz } from "@/app/actions";
export default function QuizPage() {
  const { quizId } = useParams<{ quizId: string }>();
  const [answer, setAnswer] = useState<number>();
  const [score, setScore] = useState<{ score: number; total: number }>();
  const submit = async () => {
    if (answer === undefined) return;
    const result = await submitQuiz(Number(quizId), [answer]);
    setScore(result);
  };
  return (
    <main className="min-h-screen bg-[#263d31] px-6 py-10 text-[#f5f7f2] lg:px-10">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[.2em] text-[#d7f36b]">
          Knowledge check
        </p>
        <h1 className="mt-5 text-5xl font-semibold tracking-[-.05em]">
          What makes a useful question?
        </h1>
        <fieldset className="mt-12 space-y-4">
          <label className="block border border-white/20 p-5">
            <input
              type="radio"
              name="answer"
              value="0"
              onChange={() => setAnswer(0)}
              className="mr-4"
            />{" "}
            It gives the work a direction
          </label>
          <label className="block border border-white/20 p-5">
            <input
              type="radio"
              name="answer"
              value="1"
              onChange={() => setAnswer(1)}
              className="mr-4"
            />{" "}
            It has the longest possible wording
          </label>
        </fieldset>
        <button
          onClick={submit}
          className="mt-10 rounded-full bg-[#d7f36b] px-6 py-4 text-sm font-bold text-[#14221b]"
        >
          Submit answer
        </button>
        {score && (
          <p className="mt-8 text-xl text-[#d7f36b]">
            Score: {score.score} / {score.total}
          </p>
        )}
      </div>
    </main>
  );
}

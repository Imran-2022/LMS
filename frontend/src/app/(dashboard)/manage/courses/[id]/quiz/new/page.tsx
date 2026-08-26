import { QuizForm } from "@/components/quiz/QuizForm";
import { BackButton } from "@/components/ui/BackButton";

export default async function NewQuizPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <>
      <header>
        <p className="mb-2 text-[11.5px] font-bold uppercase tracking-[0.1em] text-brand-500">
          Course {id}
        </p>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="min-w-0 text-[26px] font-bold leading-tight tracking-tight text-ink-900 sm:text-[30px]">
            Add quiz
          </h1>
          <BackButton />
        </div>
        <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-ink-500">
          Create a quiz to help students practice and check their understanding.
        </p>
      </header>
      <div className="mt-8 max-w-4xl rounded border border-ink-200 bg-white p-6 sm:p-8">
        <QuizForm courseId={id} />
      </div>
    </>
  );
}

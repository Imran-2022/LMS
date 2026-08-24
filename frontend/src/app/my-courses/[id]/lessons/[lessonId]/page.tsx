import Link from "next/link";
import { completeLesson } from "@/app/actions";
export default async function LessonPage({
  params,
}: {
  params: Promise<{ id: string; lessonId: string }>;
}) {
  const { id, lessonId } = await params;
  return (
    <main className="min-h-screen bg-[#263d31] px-6 py-10 text-[#f5f7f2] lg:px-10">
      <article className="mx-auto max-w-3xl">
        <Link
          href={`/courses/${id}`}
          className="text-sm font-bold text-[#d7f36b]"
        >
          ← Course overview
        </Link>
        <p className="mt-24 text-xs font-bold uppercase tracking-[.2em] text-[#d7f36b]">
          Lesson {lessonId}
        </p>
        <h1 className="mt-5 text-5xl font-semibold tracking-[-.05em]">
          Start with the question
        </h1>
        <p className="mt-8 text-xl leading-9 text-[#b4c1b4]">
          The strongest projects begin with a question precise enough to guide
          you, but open enough to surprise you.
        </p>
        <form action={completeLesson.bind(null, Number(lessonId), Number(id))}>
          <button className="mt-12 rounded-full bg-[#d7f36b] px-6 py-4 text-sm font-bold text-[#14221b]">
            Mark lesson complete
          </button>
        </form>
      </article>
    </main>
  );
}

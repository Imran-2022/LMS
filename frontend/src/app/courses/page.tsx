import Link from "next/link";
import { strapiFetch, Course } from "@/lib/api";

export default async function CoursesPage() {
  let courses: Course[] = [];
  try {
    const result = await strapiFetch<{ data: Course[] }>(
      "/api/courses?populate=lessons",
    );
    courses = result.data;
  } catch {
    courses = [];
  }
  const fallback = [
    {
      id: 1,
      title: "Creative systems",
      description: "Build a repeatable practice for better ideas.",
      lessons: [],
    },
    {
      id: 2,
      title: "The thoughtful project",
      description: "Turn a loose ambition into a finished body of work.",
      lessons: [],
    },
    {
      id: 3,
      title: "Writing with clarity",
      description: "Make complicated things easier to understand.",
      lessons: [],
    },
  ];
  const visible = courses.length ? courses : fallback;
  return (
    <main className="min-h-screen bg-[#f5f7f2] px-6 py-10 text-[#14221b] lg:px-10">
      <div className="mx-auto max-w-7xl">
        <Link href="/" className="text-sm font-bold">
          ← LumaLearn
        </Link>
        <div className="mt-20 max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-[#e58c5a]">
            The library
          </p>
          <h1 className="mt-4 text-5xl font-semibold tracking-[-.05em]">
            Courses with somewhere to go.
          </h1>
          <p className="mt-6 text-lg leading-8 text-[#607066]">
            Follow a considered path, or dip into a single lesson when that is
            what today needs.
          </p>
        </div>
        <div className="mt-16 grid gap-5 md:grid-cols-3">
          {visible.map((course) => (
            <Link
              key={course.id}
              href={`/courses/${course.id}`}
              className="group border-t-2 border-[#dce3d8] py-6 transition-colors hover:border-[#e58c5a]"
            >
              <span className="font-mono text-xs text-[#e58c5a]">
                COURSE {String(course.id).padStart(2, "0")}
              </span>
              <h2 className="mt-12 text-2xl font-semibold tracking-[-.03em] group-hover:underline">
                {course.title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-[#708074]">
                {course.description}
              </p>
              <p className="mt-8 text-xs font-bold uppercase tracking-[.14em] text-[#708074]">
                {course.lessons?.length || 6} lessons{" "}
                <span className="ml-3 text-[#e58c5a]">→</span>
              </p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}

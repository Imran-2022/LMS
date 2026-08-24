import Link from "next/link";
export default function ManageCoursesPage() {
  return (
    <main className="min-h-screen bg-[#f5f7f2] px-6 py-10 text-[#14221b] lg:px-10">
      <div className="mx-auto max-w-6xl">
        <Link href="/" className="text-sm font-bold">
          ← LumaLearn
        </Link>
        <h1 className="mt-20 text-5xl font-semibold tracking-[-.05em]">
          Manage courses
        </h1>
        <p className="mt-5 text-[#607066]">
          Create and shape the learning paths your students need.
        </p>
        <button className="mt-8 rounded-full bg-[#14221b] px-5 py-3 text-sm font-bold text-[#f5f7f2]">
          New course +
        </button>
        <div className="mt-14 border-t border-[#dce3d8] py-6">
          <Link
            href="/manage/courses/1"
            className="flex justify-between border-b border-[#dce3d8] pb-6 font-semibold"
          >
            Creative systems <span>→</span>
          </Link>
        </div>
      </div>
    </main>
  );
}

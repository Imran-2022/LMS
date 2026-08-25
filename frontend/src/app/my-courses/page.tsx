import Link from "next/link";
import { signOut } from "@/app/actions";
export default function MyCoursesPage() {
  return (
    <main className="min-h-screen bg-[#f5f7f2] px-6 py-10 text-[#14221b] lg:px-10">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between">
          <Link href="/courses" className="text-sm font-bold">
            ← Course library
          </Link>
          <form action={signOut}>
            <button type="submit" className="text-sm font-semibold underline">
              Sign out
            </button>
          </form>
        </div>
        <h1 className="mt-20 text-5xl font-semibold tracking-[-.05em]">
          Your learning space.
        </h1>
        <div className="mt-14 border-t border-[#dce3d8] py-8">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-[#e58c5a]">
            In progress
          </p>
          <h2 className="mt-4 text-2xl font-semibold">Creative systems</h2>
          <p className="mt-2 text-[#607066]">2 / 6 lessons · 33%</p>
          <div className="mt-5 h-2 bg-[#dce3d8]">
            <div className="h-2 w-1/3 bg-[#e58c5a]" />
          </div>
          <Link
            href="/my-courses/1/lessons/1"
            className="mt-8 inline-block rounded-full bg-[#14221b] px-5 py-3 text-sm font-bold text-[#f5f7f2]"
          >
            Continue lesson →
          </Link>
        </div>
      </div>
    </main>
  );
}

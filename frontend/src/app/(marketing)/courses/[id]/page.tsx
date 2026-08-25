import { BookOpen, Clock, Users } from "lucide-react";
import { notFound } from "next/navigation";

import { EnrollButton } from "@/components/courses/EnrollButton";
import { CoverImage } from "@/components/courses/CoverImage";
import { LessonRail } from "@/components/courses/LessonRail";
import { Footer } from "@/components/layout/Footer";
import { PublicNav } from "@/components/layout/PublicNav";
import { PageHeader } from "@/components/ui/PageHeader";
import { Avatar } from "@/components/ui/Avatar";
import { apiFetch } from "@/lib/api";
import { formatDuration } from "@/lib/format";
import { getSession } from "@/lib/session";
import { roleOf } from "@/lib/roles";
import type { ApiItem, Course, LessonSummary } from "@/lib/types";

type CourseDetail = Course & {
  lessons: LessonSummary[];
  quizzes: { id: number; title: string; description: string | null; questionCount?: number }[];
};

export default async function CoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await apiFetch<ApiItem<CourseDetail>>(`/api/courses/${id}`);

  if (!result.ok) {
    if (result.status === 404) notFound();
    return (
      <main className="grid min-h-dvh place-items-center bg-ink-50 px-6 text-center">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Course unavailable</h1>
          <p className="mt-2 text-ink-600">{result.error}</p>
        </div>
      </main>
    );
  }

  const course = result.data.data;
  const user = await getSession();
  const role = roleOf(user);

  return (
    <div className="min-h-dvh bg-ink-50">
      <PublicNav />
      <main className="mx-auto w-full max-w-[1180px] px-4 py-12 sm:px-6 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
          <div>
            <PageHeader
              eyebrow={course.category ?? "Course"}
              title={course.title}
              description={course.summary ?? undefined}
            />
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink-500">
              <span className="inline-flex items-center gap-1.5"><BookOpen size={16} /> {course.lessonCount} lessons</span>
              <span className="inline-flex items-center gap-1.5"><Clock size={16} /> {formatDuration(course.durationMinutes)}</span>
              <span className="inline-flex items-center gap-1.5"><Users size={16} /> {course.enrollmentCount} enrolled</span>
            </div>
            <div className="mt-6 flex items-center gap-3">
              <Avatar
                name={course.owner?.fullName ?? course.owner?.username ?? "Lumen LMS"}
                src={course.owner?.avatarUrl}
                size="md"
              />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Instructor</p>
                <p className="mt-0.5 font-semibold text-ink-800">
                  {course.owner?.fullName ?? course.owner?.username ?? "Lumen LMS"}
                </p>
              </div>
            </div>
            <section className="mt-10">
              <h2 className="text-xl font-bold text-ink-900">About this course</h2>
              <p className="mt-3 whitespace-pre-line text-[15px] leading-8 text-ink-600">
                {course.description ?? course.summary ?? "Course description coming soon."}
              </p>
            </section>
            <section className="mt-10">
              <h2 className="mb-4 text-xl font-bold text-ink-900">Lessons</h2>
              <LessonRail
                lessons={course.lessons ?? []}
                mode={course.isEnrolled ? "learn" : "locked"}
                courseId={course.id}
                completedIds={course.progress?.completedLessonIds}
              />
            </section>
          </div>

          <aside className="overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-[0_14px_40px_rgba(15,23,42,0.06)] lg:sticky lg:top-24">
            <CoverImage src={course.coverImageUrl} alt={course.title} />
            <div className="p-5">
              <p className="mb-4 text-sm font-semibold text-ink-700">Ready to learn?</p>
              <EnrollButton course={course} role={role} enrolled={course.isEnrolled === true} />
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}
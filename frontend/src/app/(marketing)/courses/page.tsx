import { BookOpen } from "lucide-react";

import { CourseCard } from "@/components/courses/CourseCard";
import { CourseFilters } from "@/components/courses/CourseFilters";
import { Footer } from "@/components/layout/Footer";
import { PublicNav } from "@/components/layout/PublicNav";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { apiFetch } from "@/lib/api";
import type { ApiList, Course } from "@/lib/types";

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; level?: string }>;
}) {
  const filters = await searchParams;
  const query = new URLSearchParams();
  if (filters.q) query.set("q", filters.q);
  if (filters.category) query.set("category", filters.category);
  if (filters.level) query.set("level", filters.level);

  const result = await apiFetch<ApiList<Course>>(
    `/api/courses${query.size ? `?${query.toString()}` : ""}`,
    { anonymous: true },
  );
  const courses = result.ok ? (result.data.data ?? []) : [];
  const categories = [
    ...new Set(courses.map((course) => course.category).filter(Boolean)),
  ].sort((first, second) => first!.localeCompare(second!)) as string[];

  return (
    <div className="min-h-dvh bg-ink-50">
      <PublicNav />
      <main className="mx-auto w-full max-w-[1180px] px-4 py-12 sm:px-6 lg:py-16">
        <PageHeader
          eyebrow="Learn something useful"
          title="Course catalogue"
          description="Explore published courses and find your next useful skill."
        />
        <div className="mt-8">
          <CourseFilters categories={categories} />
        </div>

        {!result.ok ? (
          <EmptyState
            className="mt-8"
            icon={<BookOpen size={24} />}
            title="Courses are temporarily unavailable"
            description={result.error}
          />
        ) : courses.length === 0 ? (
          <EmptyState
            className="mt-8"
            icon={<BookOpen size={24} />}
            title="No courses found"
            description="Try a different search or filter, or check back when new courses are published."
          />
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

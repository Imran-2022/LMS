import { BookOpen } from "lucide-react";
import { CourseCard } from "@/components/courses/CourseCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { ButtonLink } from "@/components/ui/Button";
import { fetchItem, fetchList } from "@/lib/api";
import type { Enrollment } from "@/lib/types";

export default async function MyCoursesPage() {
  const enrollments = await fetchList<Enrollment>("/api/enrollments/mine");
  const courses = await Promise.all(
    enrollments.map(async (enrollment) => {
      if (!enrollment.course) return null;
      // Enrollment rows contain a lightweight course summary. Fetch the detail payload
      // so card totals come from the same authoritative counts as the catalogue.
      const course = await fetchItem<typeof enrollment.course>(
        `/api/courses/${enrollment.course.id}`,
      );
      return { enrollment, course: course ?? enrollment.course };
    }),
  );

  const enrolledCourses = courses.filter(Boolean);

  return (
    <>
      <PageHeader
        eyebrow="Learning workspace"
        title="My courses"
        description="Continue your enrolled courses and keep your momentum moving."
      />

      <div className="mt-8">
        {enrolledCourses.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((item) =>
              item ? (
                <CourseCard
                  key={item.enrollment.id}
                  course={{
                    ...item.course,
                    isEnrolled: true,
                    progress: item.enrollment.progress,
                  }}
                  href={`/my-courses/${item.course.id}`}
                />
              ) : null,
            )}
          </div>
        ) : (
          <EmptyState
            icon={<BookOpen size={24} />}
            title="No enrolled courses"
            description="Browse the catalogue and enrol in a course to begin learning."
            action={<ButtonLink href="/courses">Explore courses</ButtonLink>}
          />
        )}
      </div>
    </>
  );
}

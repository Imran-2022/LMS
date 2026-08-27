import { BookOpen } from "lucide-react";

import { CourseAuthoringDialog } from "./CourseAuthoringDialog";
import { CourseCard } from "./CourseCard";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Course } from "@/lib/types";

export function CourseListView({ courses }: { courses: Course[] }) {
  return courses.length ? (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} showStatus href={`/manage/courses/${course.id}`} />
      ))}
    </div>
  ) : (
    <EmptyState
      icon={<BookOpen size={24} />}
      title="No courses yet"
      description="Create your first course to start building a learning path."
      action={<CourseAuthoringDialog />}
    />
  );
}

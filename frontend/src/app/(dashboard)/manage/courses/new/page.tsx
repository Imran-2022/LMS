import { CourseForm } from "@/components/courses/CourseForm";
import { PageHeader } from "@/components/ui/PageHeader";

export default function NewCoursePage() {
  return <><PageHeader eyebrow="Teaching workspace" title="Create a course" description="Start a new course and add lessons and quizzes as it takes shape." /><div className="mt-8 max-w-3xl rounded border border-ink-200 bg-white p-6 sm:p-8"><CourseForm /></div></>;
}
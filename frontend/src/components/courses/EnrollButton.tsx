/**
 * EnrollButton — the primary call to action on a course page.
 *
 * A Server Component that renders one of four things depending on who is looking, and
 * the branching is worth reading as a summary of the permission matrix:
 *
 *   • Not signed in     → "Sign in to enrol", carrying `next` so they come back here.
 *   • Signed-in student → the enrol form, or "Continue learning" if already enrolled.
 *   • Staff             → nothing to click, and an explanation of why. Staff cannot
 *                         enrol (the API's `is-student` policy refuses), so offering
 *                         the button would be offering a guaranteed 403.
 *
 * It is a real `<form>` posting to a Server Action rather than an onClick handler, so
 * it works with JavaScript disabled and needs no client bundle at all.
 */
import { ArrowRight, Check, Lock } from "lucide-react";

import { enroll } from "@/lib/actions/enrollment";
import { ButtonLink } from "@/components/ui/Button";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { roleLabel } from "@/lib/roles";
import type { Course, RoleType } from "@/lib/types";

export function EnrollButton({
  course,
  role,
  enrolled,
}: {
  course: Course;
  role: RoleType | null;
  enrolled: boolean;
}) {
  if (!role) {
    return (
      <ButtonLink
        href={`/login?next=${encodeURIComponent(`/courses/${course.id}`)}`}
        size="lg"
        fullWidth
      >
        Sign in to enrol
        <ArrowRight className="h-4 w-4" />
      </ButtonLink>
    );
  }

  if (role !== "student") {
    return (
      <div className="rounded border border-ink-200 bg-ink-50/70 px-4 py-3.5">
        <p className="flex items-center gap-2 text-[13px] font-semibold text-ink-700">
          <Lock className="h-4 w-4 text-ink-400" />
          Enrolment is for students
        </p>
        <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-500">
          You&apos;re signed in as {roleLabel(role)}. The API refuses enrolment for any
          role but Student, so staff accounts stay out of course rosters and completion
          statistics.
        </p>
      </div>
    );
  }

  if (enrolled) {
    return (
      <div className="space-y-3">
        <ButtonLink href={`/my-courses/${course.id}`} size="lg" fullWidth>
          Continue learning
          <ArrowRight className="h-4 w-4" />
        </ButtonLink>
        <p className="flex items-center justify-center gap-1.5 text-[12.5px] font-medium text-success-600">
          <Check className="h-3.5 w-3.5" />
          You&apos;re enrolled in this course
        </p>
      </div>
    );
  }

  const lessonsReady = course.lessonCount > 0;

  return (
    <form action={enroll} className="space-y-3">
      <input type="hidden" name="courseId" value={course.id} />
      <SubmitButton size="lg" fullWidth pendingLabel="Enrolling…" disabled={!lessonsReady}>
        Enrol for free
        <ArrowRight className="h-4 w-4" />
      </SubmitButton>
      <p className="text-center text-[12.5px] text-ink-500">
        {lessonsReady
          ? "Free to enrol. Your progress is saved as you go."
          : "This course has no lessons yet — check back soon."}
      </p>
    </form>
  );
}

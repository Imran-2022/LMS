/**
 * CourseCard — one course in the catalogue grid.
 *
 * The whole card is a single `<Link>` rather than a div with a button inside it. That
 * gives one tab stop instead of three, a real URL to middle-click, and no nested-
 * interactive-element problem for a screen reader. Anything that needed its own action
 * (enrol, edit) lives on the detail page instead, which is also where the server can
 * check whether this person may do it.
 *
 * For a signed-in student the backend attaches `isEnrolled` and `progress` per card, so
 * the grid can show a progress bar without the client making N extra requests.
 */
import { BookOpen, Clock, Users } from "lucide-react";
import Link from "next/link";

import { LevelBadge, StatusBadge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { ProgressBar } from "@/components/ui/Progress";
import { formatDuration } from "@/lib/format";
import type { Course } from "@/lib/types";

import { CoverImage } from "./CoverImage";

export function CourseCard({
  course,
  href,
  showStatus = false,
}: {
  course: Course;
  /** Defaults to the public detail page; the student dashboard points at its own. */
  href?: string;
  /** Drafts only appear in staff lists, so the badge is opt-in. */
  showStatus?: boolean;
}) {
  const enrolled = course.isEnrolled === true;
  const percent = course.progress?.percent ?? 0;

  return (
    <Link
      href={href ?? `/courses/${course.id}`}
      className="group flex flex-col overflow-hidden rounded border border-ink-200/70 bg-white shadow-[0_14px_40px_rgba(15,23,42,0.05)] transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-[0_22px_55px_rgba(15,23,42,0.09)] focus-visible:-translate-y-0.5"
    >
      <div className="relative">
        <CoverImage src={course.coverImageUrl} alt="" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {showStatus ? <StatusBadge status={course.status} /> : null}
          {enrolled ? (
            <span className="inline-flex items-center rounded-full bg-white/95 px-2.5 py-1 text-[11.5px] font-semibold text-brand-700 shadow-sm backdrop-blur">
              Enrolled
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2.5 flex items-center gap-2">
          <LevelBadge level={course.level} />
          {course.category ? (
            <span className="truncate text-[12px] font-medium text-ink-400">
              {course.category}
            </span>
          ) : null}
        </div>

        <h3 className="text-[15.5px] font-semibold leading-snug tracking-tight text-ink-900 transition-colors group-hover:text-brand-700">
          {course.title}
        </h3>

        <div className="mt-3 flex items-center gap-2 text-[12.5px] text-ink-500">
          <Avatar
            name={
              course.owner?.fullName ??
              course.owner?.username ??
              "CPS Academy LMS"
            }
            src={course.owner?.avatarUrl}
            size="xs"
          />
          <span className="truncate">
            By{" "}
            <span className="font-semibold text-ink-700">
              {course.owner?.fullName ??
                course.owner?.username ??
                "CPS Academy LMS"}
            </span>
          </span>
        </div>

        {course.summary ? (
          <p className="mt-2 line-clamp-2 text-[13.5px] leading-relaxed text-ink-500">
            {course.summary}
          </p>
        ) : null}

        {/* Push the meta row to the bottom so cards with shorter summaries still line
            up their footers across the grid. */}
        <div className="mt-auto pt-4">
          {enrolled ? (
            <div className="mb-3.5">
              <div className="mb-1.5 flex items-baseline justify-between">
                <span className="text-[12px] font-medium text-ink-500">
                  Your progress
                </span>
                <span className="text-[12px] font-bold tabular-nums text-brand-600">
                  {percent}%
                </span>
              </div>
              <ProgressBar percent={percent} size="sm" />
            </div>
          ) : null}

          <div className="flex items-center gap-3.5 border-t border-ink-100 pt-3.5 text-[12px] text-ink-500">
            <Meta icon={<BookOpen className="h-3.5 w-3.5" />}>
              {course.lessonCount}{" "}
              {course.lessonCount === 1 ? "lesson" : "lessons"}
            </Meta>
            <Meta icon={<Clock className="h-3.5 w-3.5" />}>
              {formatDuration(course.durationMinutes)}
            </Meta>
            <Meta icon={<Users className="h-3.5 w-3.5" />}>
              {course.enrollmentCount}
            </Meta>
          </div>
        </div>
      </div>
    </Link>
  );
}

function Meta({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 tabular-nums">
      <span className="text-ink-400">{icon}</span>
      {children}
    </span>
  );
}

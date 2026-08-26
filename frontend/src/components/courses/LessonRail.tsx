/**
 * LessonRail — the numbered lesson list on a course page.
 *
 * Renders in three modes from one component, because they are the same list with
 * different affordances and splitting them would mean three copies of the numbering,
 * the duration formatting and the completion styling:
 *
 *   `locked`   — public course page, viewer not enrolled. Titles and durations only.
 *                Deliberately not a tease: the API does not send lesson bodies to a
 *                non-enrolled viewer, so there is nothing here to reveal.
 *   `learn`    — enrolled student. Each row links into the lesson and shows a tick.
 *   `manage`   — author. Each row links into the editor.
 *
 * The tick marks come from `completedLessonIds` on the progress payload rather than
 * from a per-lesson flag, which is what lets one request colour the whole list.
 */
import { Check, Clock, FileText, Lock, Pencil } from "lucide-react";
import Link from "next/link";

import { cx, formatDuration } from "@/lib/format";
import type { LessonSummary } from "@/lib/types";

export function LessonRail({
  lessons,
  mode,
  courseId,
  completedIds = [],
}: {
  lessons: LessonSummary[];
  mode: "locked" | "learn" | "manage";
  courseId: number | string;
  completedIds?: number[];
}) {
  if (lessons.length === 0) {
    return (
      <p className="rounded border border-dashed border-ink-200 px-4 py-8 text-center text-[13.5px] text-ink-500">
        No lessons have been added yet.
      </p>
    );
  }

  // A Set rather than `.includes()` in the loop: O(1) per row instead of O(n), which
  // matters not at all for six lessons and costs nothing to do properly.
  const done = new Set(completedIds);

  return (
    <ol className="space-y-2">
      {lessons.map((lesson, index) => {
        const complete = done.has(lesson.id);
        const position = lesson.position ?? index + 1;

        const inner = (
          <>
            <span
              className={cx(
                "grid h-8 w-8 shrink-0 place-items-center rounded text-[12.5px] font-bold tabular-nums transition-colors",
                complete
                  ? "bg-success-500 text-white"
                  : mode === "locked"
                    ? "bg-ink-100 text-ink-400"
                    : "bg-brand-50 text-brand-600 group-hover:bg-brand-100",
              )}
            >
              {complete ? <Check className="h-4 w-4" strokeWidth={3} /> : position}
            </span>

            <span className="min-w-0 flex-1">
              <span
                className={cx(
                  "block truncate text-[14px] font-semibold transition-colors",
                  complete ? "text-ink-500" : "text-ink-900",
                  mode !== "locked" && "group-hover:text-brand-700",
                )}
              >
                {lesson.title}
              </span>
              {lesson.summary ? (
                <span className="mt-0.5 block truncate text-[12.5px] text-ink-500">
                  {lesson.summary}
                </span>
              ) : null}
            </span>

            <span className="flex shrink-0 items-center gap-3 text-[12px] text-ink-400">
              <span className="inline-flex items-center gap-1 tabular-nums">
                <Clock className="h-3.5 w-3.5" />
                {formatDuration(lesson.durationMinutes)}
              </span>
              {mode === "locked" ? <Lock className="h-3.5 w-3.5" /> : null}
              {mode === "manage" ? <Pencil className="h-3.5 w-3.5" /> : null}
              {mode === "learn" ? <FileText className="h-3.5 w-3.5" /> : null}
            </span>
          </>
        );

        const shell =
          "group flex items-center gap-3.5 rounded border px-3.5 py-3 transition-all";

        if (mode === "locked") {
          return (
            <li key={lesson.id}>
              <div className={cx(shell, "border-ink-200/70 bg-white/70")}>{inner}</div>
            </li>
          );
        }

        const href =
          mode === "learn"
            ? `/my-courses/${courseId}/lessons/${lesson.id}`
            : `/manage/courses/${courseId}/lessons/${lesson.id}`;

        return (
          <li key={lesson.id}>
            <Link
              href={href}
              className={cx(
                shell,
                "border-ink-200/70 bg-white hover:-translate-y-px hover:border-brand-200 hover:shadow-[0_10px_26px_rgba(15,23,42,0.06)]",
                complete && "bg-success-50/40",
              )}
            >
              {inner}
            </Link>
          </li>
        );
      })}
    </ol>
  );
}

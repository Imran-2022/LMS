/**
 * EmptyState.
 *
 * Every list in this app can legitimately be empty — a new student has no courses,
 * a new instructor has no drafts, a fresh install has no blog posts. An empty table
 * with no explanation reads as a bug, so each empty list says what would fill it and
 * offers the action that does.
 */
import type { ReactNode } from "react";

import { cx } from "@/lib/format";

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cx(
        "flex flex-col items-center justify-center rounded-[20px] border border-dashed border-ink-200 bg-white/60 px-6 py-14 text-center",
        className,
      )}
    >
      {icon ? (
        <span className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-500">
          {icon}
        </span>
      ) : null}
      <h3 className="text-[15.5px] font-semibold text-ink-800">{title}</h3>
      {description ? (
        <p className="mt-2 max-w-md text-[13.5px] leading-relaxed text-ink-500">{description}</p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

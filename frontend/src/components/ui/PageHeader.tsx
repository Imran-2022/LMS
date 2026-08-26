/**
 * Section header — the title block that opens most screens.
 */
import type { ReactNode } from "react";

import { cx } from "@/lib/format";

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
  className,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cx("flex flex-col gap-4", className)}>
      <div className="min-w-0">
        {eyebrow ? (
          <div className="mb-2 text-[11.5px] font-bold uppercase tracking-[0.1em] text-brand-500">
            {eyebrow}
          </div>
        ) : null}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
          <h1 className="text-[26px] font-bold leading-tight tracking-tight text-ink-900 sm:text-[30px]">
            {title}
          </h1>
          {action ? (
            <div className="flex shrink-0 items-center gap-2">{action}</div>
          ) : null}
        </div>
        {description ? (
          <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-ink-500">
            {description}
          </p>
        ) : null}
      </div>
    </header>
  );
}

/** Divider with a label, used inside long forms. */
export function FieldsetLegend({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-ink-400">
        {children}
      </span>
      <span className="h-px flex-1 bg-ink-200" />
    </div>
  );
}

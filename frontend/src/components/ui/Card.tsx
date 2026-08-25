/**
 * Card — the surface almost everything in this app sits on.
 *
 * White, large radius, hairline border, wide soft shadow. `interactive` adds the
 * lift-on-hover used by clickable cards in the catalogue; static cards do not get
 * it, because a card that rises under the cursor but does nothing when clicked is
 * a small lie about what is interactive.
 */
import type { ReactNode } from "react";

import { cx } from "@/lib/format";

export function Card({
  children,
  className,
  interactive = false,
  padded = true,
}: {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
  padded?: boolean;
}) {
  return (
    <div
      className={cx(
        "rounded-[20px] border border-ink-200/70 bg-white shadow-[0_14px_40px_rgba(15,23,42,0.05)]",
        padded && "p-6",
        interactive &&
          "transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-[0_22px_55px_rgba(15,23,42,0.09)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Card heading with an optional right-hand slot for actions. */
export function CardHeader({
  title,
  subtitle,
  icon,
  action,
  className,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cx("flex items-start justify-between gap-4", className)}>
      <div className="flex items-start gap-3">
        {icon ? (
          <span className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
            {icon}
          </span>
        ) : null}
        <div>
          <h2 className="text-[15px] font-semibold tracking-tight text-ink-900">{title}</h2>
          {subtitle ? <p className="mt-1 text-[13px] text-ink-500">{subtitle}</p> : null}
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

/**
 * The big numbers on the dashboards.
 *
 * `tabular-nums` on the value so a counter changing from 9 to 10 does not shift
 * the layout — small thing, but it is the difference between a dashboard that
 * feels solid and one that twitches.
 */
export function StatCard({
  label,
  value,
  hint,
  icon,
  tone = "brand",
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
  tone?: "brand" | "accent" | "success" | "ink";
}) {
  const tones = {
    brand: "bg-brand-50 text-brand-600",
    accent: "bg-accent-50 text-accent-600",
    success: "bg-success-50 text-success-600",
    ink: "bg-ink-100 text-ink-600",
  } as const;

  return (
    <Card className="relative overflow-hidden">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-ink-400">
            {label}
          </p>
          <p className="mt-2 text-[28px] font-bold leading-none tracking-tight text-ink-900 tabular-nums">
            {value}
          </p>
          {hint ? <p className="mt-2 text-[12.5px] text-ink-500">{hint}</p> : null}
        </div>
        {icon ? (
          <span className={cx("grid h-11 w-11 shrink-0 place-items-center rounded-xl", tones[tone])}>
            {icon}
          </span>
        ) : null}
      </div>
    </Card>
  );
}

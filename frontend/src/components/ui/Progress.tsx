/**
 * ProgressBar.
 *
 * The percentage is computed on the server (`GET /api/courses/:id/progress`) — this
 * component only draws it. It never derives a percentage from lesson counts of its
 * own, because then two screens could disagree about how far along a student is.
 *
 * `clampPercent` guards the width so a bad value cannot paint outside the track,
 * and the `role="progressbar"` attributes mean the number is available to a screen
 * reader rather than only visible as a coloured strip.
 */
import { clampPercent, cx } from "@/lib/format";

export function ProgressBar({
  percent,
  size = "md",
  tone = "brand",
  className,
  label,
}: {
  percent: number | null | undefined;
  size?: "sm" | "md" | "lg";
  tone?: "brand" | "success";
  className?: string;
  label?: string;
}) {
  const value = clampPercent(percent);
  const complete = value >= 100;

  const heights = { sm: "h-1.5", md: "h-2", lg: "h-2.5" } as const;
  const fills = {
    brand: "bg-gradient-to-r from-brand-500 to-brand-400",
    success: "bg-gradient-to-r from-success-600 to-success-500",
  } as const;

  return (
    <div
      className={cx("w-full overflow-hidden rounded-full bg-ink-100", heights[size], className)}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label ?? `${value}% complete`}
    >
      <div
        className={cx(
          "h-full rounded-full transition-[width] duration-500 ease-out",
          complete ? fills.success : fills[tone],
        )}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

/** Progress bar with the "4 of 6 lessons · 67%" caption above it. */
export function ProgressMeter({
  percent,
  completed,
  total,
  className,
}: {
  percent: number | null | undefined;
  completed?: number;
  total?: number;
  className?: string;
}) {
  const value = clampPercent(percent);
  return (
    <div className={className}>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <span className="text-[12.5px] font-medium text-ink-500">
          {typeof completed === "number" && typeof total === "number"
            ? `${completed} of ${total} lesson${total === 1 ? "" : "s"}`
            : "Progress"}
        </span>
        <span
          className={cx(
            "text-[13px] font-bold tabular-nums",
            value >= 100 ? "text-success-600" : "text-brand-600",
          )}
        >
          {value}%
        </span>
      </div>
      <ProgressBar percent={value} />
    </div>
  );
}

/**
 * The circular progress dial used on the student dashboard header.
 *
 * Drawn with a stroked SVG circle whose `stroke-dashoffset` is the remaining
 * fraction of its circumference — no extra dependency for one shape.
 */
export function ProgressRing({
  percent,
  size = 96,
  stroke = 8,
}: {
  percent: number | null | undefined;
  size?: number;
  stroke?: number;
}) {
  const value = clampPercent(percent);
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - value / 100);
  const done = value >= 100;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          className="stroke-ink-100"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cx(
            "transition-[stroke-dashoffset] duration-700 ease-out",
            done ? "stroke-success-500" : "stroke-brand-500",
          )}
        />
      </svg>
      <span className="absolute inset-0 grid place-items-center text-[17px] font-bold tabular-nums text-ink-900">
        {value}%
      </span>
    </div>
  );
}

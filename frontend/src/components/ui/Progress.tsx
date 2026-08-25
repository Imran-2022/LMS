/**
 * Progress indicators.
 *
 * `ProgressBar` is the one used everywhere — course cards, the lesson rail, the roster
 * table. It carries real ARIA progressbar semantics rather than being a coloured div,
 * because "62% complete" is information, and a screen reader announcing "progress bar,
 * 62 percent" is the whole point of the feature being trackable.
 *
 * `ProgressRing` is the larger SVG version for the course header, where the percentage
 * is the headline number rather than a footnote.
 */
import { clampPercent, cx } from "@/lib/format";

const SIZES = {
  sm: "h-1.5",
  md: "h-2",
  lg: "h-2.5",
} as const;

export function ProgressBar({
  percent,
  size = "md",
  label,
  className,
}: {
  percent: number | null | undefined;
  size?: keyof typeof SIZES;
  /** Overrides the announced label; defaults to a plain "N% complete". */
  label?: string;
  className?: string;
}) {
  const value = clampPercent(percent);
  const complete = value === 100;

  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label ?? `${value}% complete`}
      className={cx("w-full overflow-hidden rounded-full bg-ink-200/70", SIZES[size], className)}
    >
      <div
        className={cx(
          "h-full rounded-full transition-[width] duration-500 ease-out",
          // Finished courses go green: it reads as "done" at a glance, where more
          // violet just reads as "further along".
          complete
            ? "bg-gradient-to-r from-success-500 to-success-600"
            : "bg-gradient-to-r from-brand-400 to-brand-600",
        )}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

/**
 * Progress bar with the "4 of 6 lessons · 67%" caption above it.
 *
 * The caption takes `completed` and `total` rather than deriving them from the
 * percentage, because 67% could be 2/3 or 4/6 and the student wants to know which one
 * — "4 of 6 lessons" tells them how much is actually left to do.
 */
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
            ? `${completed} of ${total} lesson${total === 1 ? "" : "s"} complete`
            : "Progress"}
        </span>
        <span
          className={cx(
            "text-[13px] font-bold tabular-nums",
            value === 100 ? "text-success-600" : "text-brand-600",
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
 * The circular variant for course headers.
 *
 * Drawn with a single stroked circle and `stroke-dasharray`: the dash length is the
 * arc to fill and the gap is the remainder, so the offset trick that usually needs
 * two elements collapses into one. Rotated -90° so it starts at twelve o'clock.
 */
export function ProgressRing({
  percent,
  size = 92,
  stroke = 8,
  className,
}: {
  percent: number | null | undefined;
  size?: number;
  stroke?: number;
  className?: string;
}) {
  const value = clampPercent(percent);
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const filled = (value / 100) * circumference;
  const complete = value === 100;

  return (
    <div className={cx("relative inline-flex shrink-0", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          className="stroke-ink-200/80"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circumference - filled}`}
          className={cx(
            "transition-[stroke-dasharray] duration-700 ease-out",
            complete ? "stroke-success-500" : "stroke-brand-500",
          )}
        />
      </svg>
      {/* The number is the accessible text, so the SVG itself needs no ARIA. */}
      <span className="absolute inset-0 flex items-center justify-center text-[15px] font-bold tabular-nums text-ink-900">
        {value}%
      </span>
    </div>
  );
}

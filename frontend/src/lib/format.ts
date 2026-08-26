/**
 * Small formatting helpers, shared so the same value never renders two ways.
 */

/** "1h 45m" / "45m" / "—". Course and lesson durations are stored in minutes. */
export function formatDuration(minutes: number | null | undefined): string {
  if (!minutes || minutes <= 0) return "—";
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (!hours) return `${rest}m`;
  if (!rest) return `${hours}h`;
  return `${hours}h ${rest}m`;
}

/**
 * "24 Aug 2026".
 *
 * The locale is pinned to en-GB rather than left to the runtime. Server and browser
 * can otherwise resolve different locales and React logs a hydration mismatch for a
 * date that renders "24/08/2026" on one and "8/24/2026" on the other.
 */
export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

/** "3 days ago" — used where recency matters more than the exact date. */
export function formatRelative(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  const seconds = Math.round((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";

  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["minute", 60],
    ["hour", 3600],
    ["day", 86400],
    ["week", 604800],
    ["month", 2592000],
    ["year", 31536000],
  ];

  let chosen: Intl.RelativeTimeFormatUnit = "minute";
  let size = 60;
  for (const [unit, unitSeconds] of units) {
    if (seconds >= unitSeconds) {
      chosen = unit;
      size = unitSeconds;
    }
  }

  return new Intl.RelativeTimeFormat("en-GB", { numeric: "auto" }).format(
    -Math.round(seconds / size),
    chosen,
  );
}

/** Initials for an avatar fallback: "Priya Raman" → "PR". */
export function initialsOf(
  name: string | null | undefined,
  fallback = "?",
): string {
  if (!name) return fallback;
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return fallback;
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Splits plain-text content into paragraphs on blank lines.
 *
 * Lesson bodies and blog posts are authored as plain text with blank lines between
 * paragraphs. Rendering that string directly would collapse every break into one
 * run-on wall of text, and using `dangerouslySetInnerHTML` to preserve it would
 * mean any author could inject a script into a page every enrolled student loads.
 * Splitting and emitting real `<p>` elements keeps the formatting and keeps React's
 * escaping, which is the trade I want on content other people can write.
 */
export function toParagraphs(text: string | null | undefined): string[] {
  if (!text) return [];
  return text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

/** "javascript, react" → ["javascript", "react"], tolerating either shape. */
export function toTags(value: string[] | string | null | undefined): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

/** Joins class names, dropping the falsy ones. Keeps conditional classes readable. */
export function cx(...values: (string | false | null | undefined)[]): string {
  return values.filter(Boolean).join(" ");
}

/** Clamps a percentage to 0–100 so a stray value cannot overflow a progress bar. */
export function clampPercent(value: number | null | undefined): number {
  if (typeof value !== "number" || Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

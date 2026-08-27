/**
 * IconButton — a square, icon-only button with a mandatory accessible name.
 *
 * Extracted because the same class string ("grid h-9 w-9 place-items-center rounded
 * text-ink-500 hover:bg-brand-50 hover:text-brand-700") had been pasted into the blog
 * management table, the admin blog table and the user actions menu, and two of the three
 * copies had drifted. More importantly: `label` is required, not optional. An icon-only
 * button with no accessible name is announced as "button" and nothing else, and making
 * the prop required is the only version of that rule a reviewer cannot forget.
 */
import type { ComponentProps, ReactNode } from "react";

import { cx } from "@/lib/format";

type Tone = "ghost" | "danger" | "solid";
type Size = "sm" | "md";

const TONES: Record<Tone, string> = {
  ghost: "text-ink-500 hover:bg-brand-50 hover:text-brand-700",
  danger: "text-ink-500 hover:bg-danger-50 hover:text-danger-600",
  solid: "bg-brand-500 text-white hover:bg-brand-600",
};

const SIZES: Record<Size, string> = {
  sm: "h-8 w-8",
  md: "h-9 w-9",
};

export function IconButton({
  label,
  tone = "ghost",
  size = "md",
  className,
  children,
  ...rest
}: {
  /** Announced by a screen reader and shown as the tooltip. Required on purpose. */
  label: string;
  tone?: Tone;
  size?: Size;
  children: ReactNode;
} & Omit<ComponentProps<"button">, "children">) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cx(
        "grid shrink-0 cursor-pointer place-items-center rounded transition-colors",
        "focus-visible:ring-4 focus-visible:ring-brand-500/15",
        "disabled:pointer-events-none disabled:opacity-50",
        TONES[tone],
        SIZES[size],
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

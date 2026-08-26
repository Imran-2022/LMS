/**
 * Button.
 *
 * Renders a `<button>` or, with `href`, a `<Link>` — because a "View course" action
 * is a navigation and should be a real anchor (middle-clickable, copyable) even
 * though it looks identical to a button.
 *
 * Variants map to intent, not colour: `primary` for the one action a screen is
 * about, `secondary` for everything alongside it, `ghost` for toolbar actions,
 * `danger` for destructive ones. Naming them by intent is what stops a screen
 * ending up with three equally-loud violet buttons.
 */
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

import { cx } from "@/lib/format";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "subtle";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-brand-500 !text-white  hover:bg-brand-600",
  secondary:
    "bg-white text-ink-700 border border-ink-200 hover:border-brand-300 hover:text-brand-700 hover:bg-brand-50/60",
  ghost: "text-ink-600 hover:bg-ink-100 hover:text-ink-900",
  danger:
    "bg-danger-500 !text-white  hover:bg-danger-600",
  subtle: "bg-brand-50 text-brand-700 border border-brand-100 hover:bg-brand-100",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-3.5 text-[13px] gap-1.5 rounded",
  md: "h-11 px-5 text-sm gap-2 rounded",
  lg: "h-12 px-6 text-[15px] gap-2 rounded",
};

const BASE =
  "inline-flex cursor-pointer items-center justify-center font-semibold transition-all duration-150 " +
  "active:translate-y-px disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-55 whitespace-nowrap focus-visible:ring-4 focus-visible:ring-brand-500/15";

type BaseProps = {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  children: ReactNode;
  className?: string;
};

type ButtonProps = BaseProps & Omit<ComponentProps<"button">, keyof BaseProps>;
type LinkProps = BaseProps & { href: string } & Omit<
    ComponentProps<typeof Link>,
    keyof BaseProps | "href"
  >;

export function Button({
  variant = "primary",
  size = "md",
  fullWidth,
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={cx(BASE, VARIANTS[variant], SIZES[size], fullWidth && "w-full", className)}
      {...rest}
    >
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  fullWidth,
  className,
  children,
  href,
  ...rest
}: LinkProps) {
  return (
    <Link
      href={href}
      className={cx(BASE, VARIANTS[variant], SIZES[size], fullWidth && "w-full", className)}
      {...rest}
    >
      {children}
    </Link>
  );
}

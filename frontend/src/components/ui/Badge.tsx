/**
 * Badges.
 *
 * Three specialised badges rather than one generic component with a colour prop,
 * because each encodes a rule that should live in exactly one place:
 *
 *   RoleBadge   — every role always gets the same colour, everywhere.
 *   StatusBadge — draft is amber, published is green. Never negotiable per screen.
 *   ScoreBadge  — pass/fail colouring driven by the quiz's own passing score, not
 *                 by a hardcoded 50%.
 */
import type { ReactNode } from "react";

import { cx } from "@/lib/format";
import { ROLE_LABELS } from "@/lib/roles";
import type { ContentStatus, RoleType } from "@/lib/types";

const TONES = {
  brand: "bg-brand-50 text-brand-700 border-brand-100",
  accent: "bg-accent-50 text-accent-700 border-accent-100",
  success: "bg-success-50 text-success-600 border-success-100",
  danger: "bg-danger-50 text-danger-600 border-danger-100",
  neutral: "bg-ink-100 text-ink-600 border-ink-200",
} as const;

export type BadgeTone = keyof typeof TONES;

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11.5px] font-semibold leading-none",
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Admin violet, Content Manager amber, Instructor green, Student neutral. */
const ROLE_TONES: Record<RoleType, BadgeTone> = {
  admin: "brand",
  content_manager: "accent",
  instructor: "success",
  student: "neutral",
};

export function RoleBadge({ role, className }: { role: RoleType | null; className?: string }) {
  if (!role) return <Badge className={className}>Guest</Badge>;
  return (
    <Badge tone={ROLE_TONES[role]} className={className}>
      {ROLE_LABELS[role]}
    </Badge>
  );
}

export function StatusBadge({
  status,
  className,
}: {
  status: ContentStatus;
  className?: string;
}) {
  return (
    <Badge tone={status === "published" ? "success" : "accent"} className={className}>
      <span
        className={cx(
          "h-1.5 w-1.5 rounded-full",
          status === "published" ? "bg-success-500" : "bg-accent-500",
        )}
      />
      {status === "published" ? "Published" : "Draft"}
    </Badge>
  );
}

/** Green at or above the pass mark, red below it. */
export function ScoreBadge({
  score,
  passingScore = 70,
  className,
}: {
  score: number;
  passingScore?: number;
  className?: string;
}) {
  const passed = score >= passingScore;
  return (
    <Badge tone={passed ? "success" : "danger"} className={cx("tabular-nums", className)}>
      {score}% {passed ? "Passed" : "Failed"}
    </Badge>
  );
}

const LEVEL_LABELS = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
} as const;

export function LevelBadge({ level }: { level: keyof typeof LEVEL_LABELS }) {
  return <Badge tone="brand">{LEVEL_LABELS[level] ?? level}</Badge>;
}

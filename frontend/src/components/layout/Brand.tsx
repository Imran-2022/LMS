/**
 * Wordmark. One component so the logo cannot drift between the marketing header,
 * the dashboard sidebar and the login screen.
 */
import Link from "next/link";
import { GraduationCap } from "lucide-react";

import { cx } from "@/lib/format";

export function Brand({
  href = "/",
  compact = false,
  className,
}: {
  href?: string;
  compact?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cx("group inline-flex items-center gap-2.5", className)}
      aria-label="Lumen LMS home"
    >
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-[0_8px_20px_rgba(124,58,237,0.35)] transition-transform group-hover:scale-105">
        <GraduationCap size={19} strokeWidth={2.2} />
      </span>
      {compact ? null : (
        <span className="text-[17px] font-bold tracking-tight text-ink-900">
          Lumen<span className="text-brand-500">LMS</span>
        </span>
      )}
    </Link>
  );
}

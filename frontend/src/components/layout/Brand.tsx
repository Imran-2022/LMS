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
  collapsed = false,
  className,
}: {
  href?: string;
  compact?: boolean;
  collapsed?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cx("group inline-flex items-center gap-2.5 transition-[gap] duration-500 ease-in-out", collapsed && "gap-0", className)}
      aria-label="CPS Academy LMS home"
    >
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded bg-gradient-to-br from-brand-500 to-brand-700 text-white">
        <GraduationCap size={19} strokeWidth={2.2} />
      </span>
      {compact ? null : (
        <span className={cx("overflow-hidden whitespace-nowrap text-[17px] font-bold tracking-tight text-ink-900 transition-[max-width,opacity,transform] duration-500 ease-in-out", collapsed ? "max-w-0 -translate-x-2 opacity-0" : "max-w-[180px] opacity-100")}>
          CPS Academy<span className="text-brand-500"> LMS</span>
        </span>
      )}
    </Link>
  );
}

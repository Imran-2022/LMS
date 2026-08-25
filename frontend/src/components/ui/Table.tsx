/**
 * Table.
 *
 * A thin set of styled wrappers over real `<table>` elements rather than a grid of
 * divs. The admin user list and the course roster are genuinely tabular data, and a
 * real table gets row/column semantics, header association and keyboard table
 * navigation in screen readers that a div grid would have to reimplement badly.
 *
 * The horizontal scroll wrapper is on the outside so a wide table scrolls inside its
 * card on a phone instead of stretching the whole page.
 */
import type { ReactNode } from "react";

import { cx } from "@/lib/format";

export function TableWrap({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cx(
        "scroll-slim overflow-x-auto rounded-[20px] border border-ink-200/70 bg-white shadow-[0_14px_40px_rgba(15,23,42,0.05)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function Table({ children }: { children: ReactNode }) {
  return <table className="w-full min-w-[640px] border-collapse text-left">{children}</table>;
}

export function Th({
  children,
  className,
  align = "left",
}: {
  children?: ReactNode;
  className?: string;
  align?: "left" | "right" | "center";
}) {
  return (
    <th
      scope="col"
      className={cx(
        "border-b border-ink-200/70 bg-ink-50/60 px-5 py-3.5 text-[11.5px] font-bold uppercase tracking-[0.06em] text-ink-500",
        align === "right" && "text-right",
        align === "center" && "text-center",
        className,
      )}
    >
      {children}
    </th>
  );
}

export function Td({
  children,
  className,
  align = "left",
}: {
  children?: ReactNode;
  className?: string;
  align?: "left" | "right" | "center";
}) {
  return (
    <td
      className={cx(
        "border-b border-ink-100 px-5 py-4 align-middle text-[13.5px] text-ink-700",
        align === "right" && "text-right",
        align === "center" && "text-center",
        className,
      )}
    >
      {children}
    </td>
  );
}

export function Tr({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <tr className={cx("transition-colors last:[&>td]:border-b-0 hover:bg-brand-50/30", className)}>
      {children}
    </tr>
  );
}

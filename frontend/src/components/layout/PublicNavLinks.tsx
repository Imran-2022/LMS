"use client";

/**
 * The two public links in the header, split into their own client component so the
 * header itself can stay a Server Component. Only the active-link highlight needs
 * `usePathname`, and that is the only thing that crosses into the client bundle.
 */
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cx } from "@/lib/format";

const LINKS = [
  { href: "/courses", label: "Courses" },
  { href: "/blog", label: "Blog" },
];

export function PublicNavLinks() {
  const pathname = usePathname();

  return (
    <nav className="hidden items-center gap-1 sm:flex">
      {LINKS.map((link) => {
        const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={cx(
              "rounded-lg px-3 py-2 text-[13.5px] font-medium transition-colors",
              active ? "bg-brand-50 text-brand-700" : "text-ink-600 hover:bg-ink-100 hover:text-ink-900",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

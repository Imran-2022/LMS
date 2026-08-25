import Link from "next/link";

import { Brand } from "./Brand";

/**
 * Footer. Also the honest place to say what this is — a portfolio build for a
 * technical assessment, not a live product taking real enrolments.
 */
export function Footer() {
  return (
    <footer className="border-t border-ink-200/70 bg-white">
      <div className="mx-auto w-full max-w-[1180px] px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          <div className="max-w-sm">
            <Brand />
            <p className="mt-4 text-[13.5px] leading-relaxed text-ink-500">
              A role-based learning platform: four roles, per-lesson progress tracking
              and auto-graded quizzes, with every permission enforced by the API rather
              than by the interface.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            <FooterColumn
              heading="Learn"
              links={[
                { href: "/courses", label: "Course catalogue" },
                { href: "/blog", label: "Blog" },
                { href: "/signup", label: "Create an account" },
              ]}
            />
            <FooterColumn
              heading="Account"
              links={[
                { href: "/login", label: "Sign in" },
                { href: "/my-courses", label: "My courses" },
                { href: "/results", label: "My quiz results" },
              ]}
            />
            <FooterColumn
              heading="Built with"
              links={[
                { href: "https://nextjs.org", label: "Next.js", external: true },
                { href: "https://strapi.io", label: "Strapi", external: true },
                { href: "https://tailwindcss.com", label: "Tailwind CSS", external: true },
              ]}
            />
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-ink-100 pt-6 text-[12.5px] text-ink-400 sm:flex-row sm:items-center sm:justify-between">
          {/* Year is a literal, not `new Date().getFullYear()`. That would be computed
              once on the server and again on the client, which is one more chance for
              a hydration warning than a copyright line is worth. */}
          <p>© 2026 Lumen LMS. Built by MD Imranul Haque.</p>
          <p>Next.js on Vercel · Strapi on Railway · PostgreSQL</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  heading,
  links,
}: {
  heading: string;
  links: { href: string; label: string; external?: boolean }[];
}) {
  return (
    <div>
      <p className="mb-3 text-[11.5px] font-bold uppercase tracking-[0.1em] text-ink-400">
        {heading}
      </p>
      <ul className="space-y-2.5">
        {links.map((link) => (
          <li key={link.href}>
            {link.external ? (
              <a
                href={link.href}
                target="_blank"
                rel="noreferrer noopener"
                className="text-[13.5px] text-ink-600 transition-colors hover:text-brand-600"
              >
                {link.label}
              </a>
            ) : (
              <Link
                href={link.href}
                className="text-[13.5px] text-ink-600 transition-colors hover:text-brand-600"
              >
                {link.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

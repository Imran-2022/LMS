/**
 * Root layout — the one HTML document the whole app renders into.
 *
 * Deliberately thin. It sets the font, the metadata and the page background, and
 * nothing else: the three route groups underneath it (`(marketing)`, `(auth)`,
 * `(dashboard)`) each supply their own chrome, because a marketing page with a
 * top nav, a centred login screen, and a sidebar dashboard have almost nothing
 * structural in common. Putting a shared header here would mean every group then
 * had to work around it.
 *
 * Inter is loaded through `next/font`, which self-hosts the files at build time —
 * no runtime request to Google, no flash of unstyled text, and it satisfies the
 * "no third-party font CDN at request time" instinct without extra config. The
 * variable it exposes is wired to `--font-sans` in globals.css.
 */
import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "CPS Academy LMS",
  description:
    "A role-based learning platform: publish courses, track lesson-by-lesson progress, and auto-grade quizzes.",
  applicationName: "CPS Academy LMS",
  authors: [{ name: "MD Imranul Haque" }],
  // Search engines should index the public catalogue and blog; everything behind a
  // login is unreachable to a crawler anyway.
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-dvh bg-ink-50 font-sans text-ink-800 antialiased">
        {children}
      </body>
    </html>
  );
}

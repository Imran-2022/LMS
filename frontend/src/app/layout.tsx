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
 *
 * The two providers are the exception to "thin". Toasts and confirmations have to be
 * mounted above every route group — a confirmation raised from the dashboard renders into
 * `document.body`, and marketing pages report sign-out through the same toast stack — and
 * mounting them per group would give the app two independent toast stacks that could
 * both be on screen at once. They are client components, but only their own subtree is
 * client-rendered: `children` stays a server-rendered tree passed straight through.
 */
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";

import { ConfirmProvider } from "@/components/ui/ConfirmDialog";
import { FlashToasts } from "@/components/ui/FlashToasts";
import { ToastProvider } from "@/components/ui/Toast";

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
        <ToastProvider>
          <ConfirmProvider>
            {children}
            {/*
              Suspended because `useSearchParams()` inside it would otherwise opt every
              route into client rendering, and the marketing pages are worth prerendering.
            */}
            <Suspense fallback={null}>
              <FlashToasts />
            </Suspense>
          </ConfirmProvider>
        </ToastProvider>
      </body>
    </html>
  );
}

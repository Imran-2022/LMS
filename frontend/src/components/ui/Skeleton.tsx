/**
 * Skeleton placeholders for `loading.tsx` files.
 *
 * The dashboard pages fetch from Strapi on the server, so there is a real gap between
 * navigation and first paint. A skeleton in the shape of the content that is coming
 * makes that gap read as loading rather than as a blank screen, and — because it
 * mirrors the real layout — nothing jumps when the data lands.
 */
import { cx } from "@/lib/format";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cx("animate-pulse rounded bg-ink-100", className)} />;
}

export function SkeletonCard() {
  return (
    <div className="rounded border border-ink-200/70 bg-white p-6 shadow-[0_14px_40px_rgba(15,23,42,0.05)]">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="mt-4 h-6 w-3/4" />
      <Skeleton className="mt-3 h-3.5 w-full" />
      <Skeleton className="mt-2 h-3.5 w-5/6" />
      <Skeleton className="mt-6 h-2 w-full rounded-full" />
    </div>
  );
}

export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }, (_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 6 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded border border-ink-200/70 bg-white shadow-[0_14px_40px_rgba(15,23,42,0.05)]">
      <div className="border-b border-ink-200/70 bg-ink-50/60 px-5 py-4">
        <Skeleton className="h-3.5 w-40" />
      </div>
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="flex items-center gap-4 border-b border-ink-100 px-5 py-4">
          <Skeleton className="h-9 w-9 rounded-full" />
          <Skeleton className="h-3.5 flex-1" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonHeader() {
  return (
    <div>
      <Skeleton className="h-3 w-28" />
      <Skeleton className="mt-3 h-8 w-72" />
      <Skeleton className="mt-3 h-4 w-full max-w-xl" />
    </div>
  );
}

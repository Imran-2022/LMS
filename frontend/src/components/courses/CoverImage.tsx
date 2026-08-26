/**
 * CoverImage — the 16:9 header image on course cards and blog posts.
 *
 * A plain `<img>`, not `next/image`, and that is a deliberate call rather than an
 * oversight. `coverImageUrl` is a free-text field an author types, so the host is not
 * known ahead of time. `next/image` only optimises hosts listed in
 * `next.config.ts#images.remotePatterns`, and the two ways to satisfy that are both
 * bad: allowlist a fixed host and every other URL an author pastes renders as a broken
 * config error, or allowlist `**` and the optimiser becomes an open image proxy anyone
 * can point at any URL on the internet and have our server fetch and cache.
 *
 * So: a plain element with `loading="lazy"`, explicit dimensions to reserve the box and
 * avoid layout shift, and `referrerPolicy` so we are not leaking the reader's location
 * to whatever host the author chose. What is given up is automatic resizing — worth it.
 */
import { cx } from "@/lib/format";

export function CoverImage({
  src,
  alt,
  className,
  ratio = "aspect-[16/9]",
}: {
  src: string | null | undefined;
  alt: string;
  className?: string;
  ratio?: string;
}) {
  return (
    <div
      className={cx("relative overflow-hidden bg-ink-100", ratio, className)}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- see the note above
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover transition-transform duration-500 will-change-transform group-hover:scale-[1.04]"
        />
      ) : (
        // No cover set: a tinted gradient rather than a grey box or a broken-image
        // icon, so a course without artwork still looks finished.
        <div className="h-full w-full bg-gradient-to-br from-brand-500/85 via-brand-400/70 to-accent-500/60" />
      )}
    </div>
  );
}

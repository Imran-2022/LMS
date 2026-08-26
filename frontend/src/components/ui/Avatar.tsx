/**
 * Avatar.
 *
 * Falls back to initials on a colour derived from the name, so a list of users
 * without profile pictures still reads as a list of distinct people rather than a
 * column of identical grey circles. The colour is picked by summing the name's
 * char codes — deterministic, so the same person is the same colour on every
 * screen and every render, server and client alike.
 */
import { cx, initialsOf } from "@/lib/format";

const PALETTE = [
  "bg-brand-100 text-brand-700",
  "bg-accent-100 text-accent-700",
  "bg-success-100 text-success-600",
  "bg-sky-100 text-sky-700",
  "bg-rose-100 text-rose-700",
  "bg-teal-100 text-teal-700",
];

function toneFor(seed: string): string {
  let sum = 0;
  for (let i = 0; i < seed.length; i += 1) sum += seed.charCodeAt(i);
  return PALETTE[sum % PALETTE.length];
}

const SIZES = {
  xs: "h-7 w-7 text-[10.5px]",
  sm: "h-9 w-9 text-[12px]",
  md: "h-11 w-11 text-[14px]",
  lg: "h-16 w-16 text-[19px]",
} as const;

export function Avatar({
  name,
  src,
  size = "sm",
  className,
}: {
  name: string | null | undefined;
  src?: string | null;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const label = name ?? "Unknown";

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- avatar URLs are arbitrary
      // external strings entered by users; next/image would need every possible host
      // whitelisted in next.config to render them.
      <img
        src={src}
        alt={label}
        className={cx(
          "shrink-0 rounded-full object-cover",
          SIZES[size],
          className,
        )}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      title={label}
      className={cx(
        "grid shrink-0 place-items-center rounded-full font-bold uppercase",
        toneFor(label),
        SIZES[size],
        className,
      )}
    >
      {initialsOf(label)}
    </span>
  );
}

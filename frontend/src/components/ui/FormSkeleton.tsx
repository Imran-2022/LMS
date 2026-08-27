/**
 * The shape of a form, while its record is still loading.
 *
 * A spinner in the middle of an empty drawer tells the user nothing about what is
 * arriving; label-and-field bars in roughly the right proportions mean the panel does not
 * visibly rearrange itself when the data lands. `fields` is tuned per call site so the
 * placeholder matches the form that replaces it.
 */
import { Skeleton } from "./Skeleton";

export function FormSkeleton({ fields = 5 }: { fields?: number }) {
  return (
    <div className="space-y-5" aria-hidden="true">
      {Array.from({ length: fields }, (_, index) => (
        <div key={index}>
          <Skeleton className="h-3 w-24" />
          <Skeleton
            className={
              // One taller block partway down stands in for the long-text field every
              // one of these forms has.
              index === 2 ? "mt-2 h-28 w-full" : "mt-2 h-10 w-full"
            }
          />
        </div>
      ))}
    </div>
  );
}

/**
 * The loader failed. Offered with a retry, because the usual cause is a dropped
 * connection rather than anything the user can fix by closing and reopening.
 */
export function FormLoadError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div
      role="alert"
      className="rounded border border-danger-500/25 bg-danger-50 px-4 py-4 text-[13px] text-danger-600"
    >
      <p className="font-semibold">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-3 cursor-pointer font-bold underline underline-offset-2 hover:text-danger-700"
      >
        Try again
      </button>
    </div>
  );
}

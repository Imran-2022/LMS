import { AlertCircle, Check, X } from "lucide-react";

export function AnswerMark({
  state,
}: {
  state: "correct" | "wrong" | "missed";
}) {
  if (state === "correct") {
    return (
      <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-success-500 text-white">
        <Check className="h-3 w-3" strokeWidth={3} />
      </span>
    );
  }
  if (state === "wrong") {
    return (
      <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-danger-500 text-white">
        <X className="h-3 w-3" strokeWidth={3} />
      </span>
    );
  }
  return (
    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-accent-500 text-white">
      <AlertCircle className="h-3 w-3" strokeWidth={3} />
    </span>
  );
}

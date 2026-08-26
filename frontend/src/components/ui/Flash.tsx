/**
 * Flash — the confirmation strip after a redirect.
 *
 * Server Actions in this app finish with `redirect()`, which means the action's own
 * return value is thrown away. To still tell the user what happened, the action
 * appends `?ok=` or `?err=` to the destination and the page renders this from its
 * `searchParams`. The message survives the redirect, survives a refresh, and needs no
 * client state or toast provider.
 *
 * Codes rather than free text in the URL: the message copy lives here, so a crafted
 * link cannot make the app display arbitrary text of someone else's choosing.
 */
import { cx } from "@/lib/format";

const MESSAGES: Record<
  string,
  { tone: "success" | "danger" | "info"; text: string }
> = {
  // Success
  enrolled: {
    tone: "success",
    text: "You're enrolled. Your first lesson is ready below.",
  },
  unenrolled: {
    tone: "info",
    text: "You've left that course. Your progress is kept if you return.",
  },
  "course-created": {
    tone: "success",
    text: "Course created. Add lessons to make it worth taking.",
  },
  "course-updated": { tone: "success", text: "Course saved." },
  "course-deleted": {
    tone: "info",
    text: "Course deleted, along with its lessons and quizzes.",
  },
  "lesson-created": { tone: "success", text: "Lesson added." },
  "lesson-saved": { tone: "success", text: "Lesson saved." },
  "lesson-deleted": { tone: "info", text: "Lesson deleted." },
  "lesson-done": {
    tone: "success",
    text: "Lesson marked complete. Your progress is saved.",
  },
  "quiz-created": { tone: "success", text: "Quiz created." },
  "quiz-saved": { tone: "success", text: "Quiz saved." },
  "quiz-deleted": { tone: "info", text: "Quiz deleted." },
  "post-created": {
    tone: "success",
    text: "Post created as a draft. Publish it when you're ready.",
  },
  "post-saved": { tone: "success", text: "Post saved." },
  "post-deleted": { tone: "info", text: "Post deleted." },
  "post-published": {
    tone: "success",
    text: "Post published — it's now on the public blog.",
  },
  "post-unpublished": {
    tone: "info",
    text: "Post moved back to draft. It's hidden from the public blog.",
  },
  published: {
    tone: "success",
    text: "Published — it's now visible to everyone.",
  },
  unpublished: {
    tone: "info",
    text: "Moved back to draft. Only staff can see it now.",
  },
  "role-updated": {
    tone: "success",
    text: "Role updated. It applies on their next request.",
  },
  "user-blocked": {
    tone: "info",
    text: "Account blocked. Their existing session stops working immediately.",
  },
  "user-unblocked": { tone: "success", text: "Account unblocked." },
  "user-deleted": {
    tone: "info",
    text: "Account deleted. Courses they authored were kept.",
  },
  registered: { tone: "success", text: "Account created. Welcome aboard." },
  "signed-out": { tone: "info", text: "You're signed out." },

  // Failures that arrive via redirect rather than an inline form error
  denied: {
    tone: "danger",
    text: "Your role doesn't have access to that page. The API enforces the same rule.",
  },
  "auth-required": { tone: "info", text: "Sign in to continue." },
  forbidden: {
    tone: "danger",
    text: "The server rejected that action for your role.",
  },
  failed: { tone: "danger", text: "That didn't work. Please try again." },
  "enroll-failed": {
    tone: "danger",
    text: "Enrolment didn't go through. Only students can enrol.",
  },
  "progress-failed": {
    tone: "danger",
    text: "Couldn't save that. You need to be enrolled in this course.",
  },
  "reorder-failed": {
    tone: "danger",
    text: "Couldn't reorder the lessons. Reload and try again.",
  },
  "role-failed": {
    tone: "danger",
    text: "Role change refused — you can't change your own role.",
  },
  "status-failed": {
    tone: "danger",
    text: "Couldn't change that account's status.",
  },
  "delete-failed": {
    tone: "danger",
    text: "Couldn't delete that account — you can't delete your own.",
  },
};

const TONES = {
  success: "border-success-500/25 bg-success-50 text-success-600",
  danger: "border-danger-500/25 bg-danger-50 text-danger-600",
  info: "border-brand-500/20 bg-brand-50 text-brand-700",
} as const;

export function Flash({
  ok,
  err,
  className,
}: {
  ok?: string | string[];
  err?: string | string[];
  className?: string;
}) {
  // `searchParams` values are `string | string[]` — a repeated query key gives an
  // array. Take the first entry so `?ok=a&ok=b` cannot crash the page.
  const code = first(ok) ?? first(err);
  if (!code) return null;

  const entry = MESSAGES[code];
  if (!entry) return null;

  const tone = first(err)
    ? entry.tone === "success"
      ? "danger"
      : entry.tone
    : entry.tone;

  return (
    <div
      role="status"
      className={cx(
        "animate-rise rounded border px-4 py-3 text-[13.5px] font-medium",
        TONES[tone],
        className,
      )}
    >
      {entry.text}
    </div>
  );
}

function first(value: string | string[] | undefined): string | undefined {
  if (!value) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

"use client";

/**
 * LessonForm — create and edit a lesson.
 *
 * `order` is not a field. Position is managed by the up/down controls in the lesson
 * rail, which send the whole ordering at once; exposing a number input here would let
 * two lessons claim position 3 and there would be no obvious way for the author to see
 * that they had done it.
 */
import { useActionState } from "react";
import { errorOf } from "@/lib/form";
import { useActionResult } from "@/components/ui/useActionResult";

import {
  createLesson,
  deleteLesson,
  updateLesson,
} from "@/lib/actions/lessons";
import { DangerousSubmit } from "@/components/ui/DangerousSubmit";
import { Input, FormError, Textarea } from "@/components/ui/Input";
import { SubmitButton } from "@/components/ui/SubmitButton";
import type { LessonDetail } from "@/lib/types";

export function LessonForm({
  courseId,
  lesson,
  onDone,
}: {
  courseId: number | string;
  /** Absent when adding a new lesson. */
  lesson?: LessonDetail;
  onDone?: () => void;
}) {
  const editing = Boolean(lesson);
  const [state, action] = useActionState(
    editing ? updateLesson : createLesson,
    undefined,
  );
  useActionResult(state, onDone);

  return (
    <>
      <form id="lesson-form" action={action} className="space-y-5">
        <FormError>{errorOf(state)}</FormError>

        <input type="hidden" name="courseId" value={courseId} />
        {lesson ? (
          <input type="hidden" name="lessonId" value={lesson.id} />
        ) : null}

        <Input
          label="Lesson title"
          name="title"
          required
          maxLength={160}
          defaultValue={lesson?.title ?? ""}
          placeholder="e.g. Understanding the render cycle"
        />

        <Input
          label="One-line summary"
          name="summary"
          maxLength={220}
          defaultValue={lesson?.summary ?? ""}
          placeholder="What the student will take away from this lesson."
          hint="Shown under the title in the lesson list."
        />

        <Textarea
          label="Lesson content"
          name="content"
          rows={16}
          defaultValue={lesson?.content ?? ""}
          placeholder={
            "The body of the lesson.\n\nSeparate paragraphs with a blank line."
          }
          hint="Plain text, rendered as paragraphs. HTML is escaped rather than rendered — an author can't inject a script into a page every enrolled student loads."
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label="Video URL"
            name="videoUrl"
            type="url"
            defaultValue={lesson?.videoUrl ?? ""}
            placeholder="https://…"
            hint="Optional. Shown as a link above the lesson body."
          />

          <Input
            label="Duration"
            name="durationMinutes"
            type="number"
            min={0}
            max={600}
            defaultValue={lesson?.durationMinutes ?? 0}
            hint="In minutes. Feeds the course's total running time."
          />
        </div>
      </form>

      <div className="flex flex-wrap items-center gap-3 border-t border-ink-100 pt-5">
        <SubmitButton
          form="lesson-form"
          size="lg"
          pendingLabel={editing ? "Saving…" : "Adding…"}
        >
          {editing ? "Save lesson" : "Add lesson"}
        </SubmitButton>
        {editing ? (
          <form action={deleteLesson} className="inline">
            <input type="hidden" name="courseId" value={courseId} />
            <input type="hidden" name="lessonId" value={lesson?.id} />
            <DangerousSubmit
              confirm="Delete this lesson? Student progress for it will also be removed."
              pendingLabel="Deleting..."
              size="lg"
            >
              Delete lesson
            </DangerousSubmit>
          </form>
        ) : null}
      </div>
    </>
  );
}

"use client";

import { cloneElement, useState, type ComponentProps, type ReactElement } from "react";

import { LessonForm } from "./LessonForm";
import { Button } from "@/components/ui/Button";
import { FormDialog } from "@/components/ui/FormDialog";
import { loadLesson } from "@/lib/actions/lessons";
import type { LessonDetail } from "@/lib/types";

export function LessonAuthoringDialog({ courseId, lesson, trigger }: { courseId: number | string; lesson?: LessonDetail; trigger?: ReactElement<ComponentProps<"button">> }) {
  const [open, setOpen] = useState(false);
  const editing = Boolean(lesson);
  return (
    <>
      {trigger ? cloneElement(trigger, { onClick: () => setOpen(true) }) : <Button type="button" size="sm" onClick={() => setOpen(true)}>{editing ? "Edit lesson" : "Add lesson"}</Button>}
      <FormDialog
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit lesson" : "Add lesson"}
        recordId={lesson?.id ?? null}
        load={editing ? loadLesson : undefined}
        render={(record) => editing && !record ? null : <LessonForm courseId={courseId} lesson={record as LessonDetail | undefined} onDone={() => setOpen(false)} />}
      />
    </>
  );
}
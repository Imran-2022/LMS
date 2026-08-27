"use client";

import { cloneElement, useState, type ComponentProps, type ReactElement } from "react";

import { QuizForm } from "./QuizForm";
import { Button } from "@/components/ui/Button";
import { FormDialog } from "@/components/ui/FormDialog";
import { loadQuiz } from "@/lib/actions/quiz";
import type { QuizWithAnswers } from "@/lib/types";

export function QuizAuthoringDialog({ courseId, quiz, trigger }: { courseId: number | string; quiz?: Pick<QuizWithAnswers, "id">; trigger?: ReactElement<ComponentProps<"button">> }) {
  const [open, setOpen] = useState(false);
  const editing = Boolean(quiz);
  return (
    <>
      {trigger ? cloneElement(trigger, { onClick: () => setOpen(true) }) : <Button type="button" size="sm" onClick={() => setOpen(true)}>{editing ? "Edit quiz" : "Add quiz"}</Button>}
      <FormDialog
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit quiz" : "Add quiz"}
        recordId={quiz?.id ?? null}
        load={editing ? loadQuiz : undefined}
        render={(record) => editing && !record ? null : <QuizForm courseId={courseId} quiz={record as QuizWithAnswers | undefined} onDone={() => setOpen(false)} />}
      />
    </>
  );
}
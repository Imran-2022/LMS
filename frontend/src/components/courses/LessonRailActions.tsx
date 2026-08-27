"use client";

import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";

import { deleteLesson, moveLesson } from "@/lib/actions/lessons";
import { Button } from "@/components/ui/Button";
import { DangerousSubmit } from "@/components/ui/DangerousSubmit";

export function LessonRailActions({
  courseId,
  lessonId,
  lessonIds,
  index,
}: {
  courseId: number | string;
  lessonId: number;
  lessonIds: number[];
  index: number;
}) {
  const first = index === 0;
  const last = index === lessonIds.length - 1;
  return (
    <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1 border-l border-ink-100 bg-white pl-2">
      <form action={moveLesson}>
        <input type="hidden" name="courseId" value={courseId} />
        <input type="hidden" name="lessonId" value={lessonId} />
        <input type="hidden" name="direction" value="up" />
        <input type="hidden" name="lessonIds" value={lessonIds.join(",")} />
        <Button type="submit" variant="ghost" size="sm" disabled={first} aria-label="Move lesson up" title="Move up" className="h-9 w-9 px-0 text-ink-600"><ArrowUp className="h-4 w-4" /></Button>
      </form>
      <form action={moveLesson}>
        <input type="hidden" name="courseId" value={courseId} />
        <input type="hidden" name="lessonId" value={lessonId} />
        <input type="hidden" name="direction" value="down" />
        <input type="hidden" name="lessonIds" value={lessonIds.join(",")} />
        <Button type="submit" variant="ghost" size="sm" disabled={last} aria-label="Move lesson down" title="Move down" className="h-9 w-9 px-0 text-ink-600"><ArrowDown className="h-4 w-4" /></Button>
      </form>
      <form action={deleteLesson}>
        <input type="hidden" name="courseId" value={courseId} />
        <input type="hidden" name="lessonId" value={lessonId} />
        <DangerousSubmit variant="ghost" size="sm" confirm="Delete this lesson? Student progress for it will also be removed." aria-label="Delete lesson" title="Delete lesson" className="h-9 w-9 px-0 text-danger-600 hover:bg-danger-50 hover:text-danger-700"><Trash2 className="h-4 w-4" /></DangerousSubmit>
      </form>
    </div>
  );
}

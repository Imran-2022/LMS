"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { CourseForm } from "./CourseForm";
import { Button } from "@/components/ui/Button";
import { FormDialog } from "@/components/ui/FormDialog";
import { loadCourse } from "@/lib/actions/courses";
import type { Course, InstructorOption } from "@/lib/types";

export function CourseAuthoringDialog({
  course,
  instructors = [],
  canAssignInstructor = false,
}: {
  course?: Course;
  instructors?: InstructorOption[];
  canAssignInstructor?: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const editing = Boolean(course);

  return (
    <>
      <Button type="button" size="sm" onClick={() => setOpen(true)}>
        {editing ? "Edit details" : "Create course"}
      </Button>
      <FormDialog
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit course" : "Create course"}
        recordId={course?.id ?? null}
        load={editing ? loadCourse : undefined}
        render={(record) => {
          if (editing && !record) return null;
          return (
            <CourseForm
              course={(record as Course | undefined) ?? undefined}
              instructors={instructors}
              canAssignInstructor={canAssignInstructor}
              onDone={(id) => {
                setOpen(false);
                if (!editing && id) router.push(`/manage/courses/${id}`);
              }}
            />
          );
        }}
      />
    </>
  );
}

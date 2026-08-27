"use client";

/**
 * CourseForm — create and edit, one component.
 *
 * A client component only because of `useActionState`: the action returns a validation
 * message on failure and the form re-renders with it, keeping everything the author
 * typed. A plain `<form action={...}>` in a Server Component would lose the input on
 * every rejected submit, which on a long form is the difference between a hiccup and
 * retyping a description.
 *
 * All inputs are uncontrolled `defaultValue` — the values go to the server as `FormData`
 * so React never needs to hold them in state.
 */
import { useActionState } from "react";
import { errorOf } from "@/lib/form";
import { useActionResult } from "@/components/ui/useActionResult";

import {
  createCourse,
  deleteCourse,
  updateCourse,
} from "@/lib/actions/courses";
import { Button } from "@/components/ui/Button";
import { DangerousSubmit } from "@/components/ui/DangerousSubmit";
import {
  Checkbox,
  FormError,
  Input,
  Select,
  Textarea,
} from "@/components/ui/Input";
import { FieldsetLegend } from "@/components/ui/PageHeader";
import { SubmitButton } from "@/components/ui/SubmitButton";
import type { Course, InstructorOption } from "@/lib/types";

export function CourseForm({
  course,
  categories = [],
  instructors = [],
  canAssignInstructor = false,
  onDone,
}: {
  /** Absent when creating. */
  course?: Course;
  /** Existing categories, offered as a datalist so they stay consistent. */
  categories?: string[];
  instructors?: InstructorOption[];
  canAssignInstructor?: boolean;
  onDone?: (id?: number) => void;
}) {
  const editing = Boolean(course);
  const [state, action] = useActionState(
    editing ? updateCourse : createCourse,
    undefined,
  );
  useActionResult(state, onDone ? (result) => onDone(result.id) : undefined);

  return (
    <>
      <form id="course-form" action={action} className="space-y-5">
        <FormError>{errorOf(state)}</FormError>

        {course ? (
          <input type="hidden" name="courseId" value={course.id} />
        ) : null}

        <Input
          label="Course title"
          name="title"
          required
          maxLength={160}
          defaultValue={course?.title ?? ""}
          placeholder="e.g. Modern React Patterns"
          hint="Shown on the catalogue card and the course page."
        />

        <Textarea
          label="Short summary"
          name="summary"
          rows={2}
          maxLength={280}
          defaultValue={course?.summary ?? ""}
          placeholder="One or two lines describing who this course is for."
          hint="Appears on the catalogue card. Keep it under about 160 characters to avoid being clipped."
        />

        <Textarea
          label="Full description"
          name="description"
          rows={7}
          defaultValue={course?.description ?? ""}
          placeholder={
            "What the course covers.\n\nLeave a blank line between paragraphs — they're rendered as separate paragraphs."
          }
          hint="Plain text. Blank lines become paragraph breaks; no HTML is rendered."
        />

        <FieldsetLegend>Classification</FieldsetLegend>

        {canAssignInstructor ? (
          <Select
            label="Course instructor"
            name="owner"
            required
            defaultValue={course?.owner?.id ?? ""}
            hint="The selected instructor will own the course and its teaching content."
          >
            <option value="" disabled>
              Select an instructor
            </option>
            {instructors.map((instructor) => (
              <option key={instructor.id} value={instructor.id}>
                {instructor.fullName || instructor.username}
              </option>
            ))}
          </Select>
        ) : null}

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <Input
              label="Category"
              name="category"
              list="course-categories"
              maxLength={60}
              defaultValue={course?.category ?? ""}
              placeholder="e.g. Frontend"
              hint="Used by the catalogue filter."
            />
            {/* A datalist rather than a fixed select: it suggests the categories already
              in use without preventing an author from starting a new one. */}
            <datalist id="course-categories">
              {categories.map((category) => (
                <option key={category} value={category} />
              ))}
            </datalist>
          </div>

          <Select
            label="Level"
            name="level"
            defaultValue={course?.level ?? "beginner"}
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </Select>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label="Estimated duration"
            name="durationMinutes"
            type="number"
            min={0}
            max={10000}
            defaultValue={course?.durationMinutes ?? 0}
            hint="In minutes. Displayed as “2h 30m”."
          />

          <Input
            label="Cover image URL"
            name="coverImageUrl"
            type="url"
            defaultValue={course?.coverImageUrl ?? ""}
            placeholder="https://…"
            hint="Optional. A 16:9 image works best; a gradient is used if left empty."
          />
        </div>

        {editing ? (
          <Input
            label="URL slug"
            name="slug"
            defaultValue={course?.slug ?? ""}
            hint="Changing this changes the course's public URL. Leave it alone unless you mean to."
          />
        ) : null}

        <FieldsetLegend>Visibility</FieldsetLegend>

        <Checkbox
          name="publishNow"
          label="Publish this course"
          defaultChecked={course?.status === "published"}
          hint="Drafts are invisible in the public catalogue — the API filters them out for anyone who can't edit the course, not just the UI."
        />
      </form>

      <div className="flex flex-wrap items-center gap-3 border-t border-ink-100 pt-5">
        <SubmitButton
          form="course-form"
          size="lg"
          pendingLabel={editing ? "Saving…" : "Creating…"}
        >
          {editing ? "Save changes" : "Create course"}
        </SubmitButton>
        {/* A real reset rather than a link back: on the create form there is nowhere
            useful to go back to, and on the edit form the author may just want to undo. */}
        <Button form="course-form" type="reset" variant="ghost" size="lg">
          Reset
        </Button>
        {editing ? (
          <form action={deleteCourse} className="inline">
            <input type="hidden" name="courseId" value={course?.id} />
            <DangerousSubmit
              confirm="Delete this course and all of its lessons, quizzes, and student progress?"
              pendingLabel="Deleting..."
              size="lg"
            >
              Delete course
            </DangerousSubmit>
          </form>
        ) : null}
      </div>
    </>
  );
}

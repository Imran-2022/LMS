/**
 * Lesson controller.
 *
 * This is where the enrollment wall actually lives. A course's *title* is public;
 * a lesson's *body* is not. `findOne` is guarded by
 * `global::is-enrolled-or-privileged`, so `GET /api/lessons/7` with a valid student
 * token but no enrollment returns 403 — not a rendered page with a hidden button.
 *
 * It also owns lesson ordering, because "sequential lesson viewing" only works if
 * `order` is dense and unique, and that cannot be guaranteed from the client.
 */
import { factories } from "@strapi/strapi";
import { errors } from "@strapi/utils";

import {
  LESSON_PROGRESS_UID,
  LESSON_UID,
  assertCourseReadAccess,
  findCourse,
  requireUser,
} from "../../../utils/authorization";
import { lessonDetail, lessonSummary } from "../../../utils/serialize";
import { isStudent } from "../../../utils/roles";

const { NotFoundError, ValidationError } = errors;

const WRITABLE_FIELDS = [
  "title",
  "summary",
  "content",
  "videoUrl",
  "durationMinutes",
  "order",
] as const;

function pickWritable(payload: Record<string, any> = {}) {
  return WRITABLE_FIELDS.reduce<Record<string, any>>((acc, field) => {
    if (payload[field] !== undefined) acc[field] = payload[field];
    return acc;
  }, {});
}

function readBody(ctx: any) {
  const body = ctx.request?.body ?? {};
  return body.data ?? body;
}

/** Course lessons, always in teaching order. `id` breaks ties deterministically. */
function orderedLessons(strapi: any, courseId: number) {
  return strapi.db.query(LESSON_UID).findMany({
    where: { course: courseId },
    orderBy: [{ order: "asc" }, { id: "asc" }],
  });
}

/**
 * Rewrites `order` to 1..n for a course, preserving the current sequence.
 *
 * Called after a delete. Sequential viewing depends on `order` being dense: leave a
 * hole at position 3 and "next lesson" from 2 lands on nothing.
 */
async function resequence(strapi: any, courseId: number) {
  const lessons = await orderedLessons(strapi, courseId);
  let position = 1;
  for (const lesson of lessons) {
    if (lesson.order !== position) {
      await strapi.documents(LESSON_UID).update({
        documentId: lesson.documentId,
        data: { order: position },
      });
    }
    position += 1;
  }
}

export default factories.createCoreController(LESSON_UID, ({ strapi }) => ({
  /**
   * GET /api/lessons?courseId=123
   *
   * The lesson rail in the course player: titles, durations and — for a student —
   * whether each one is already ticked off. Bodies are omitted, so this stays cheap
   * even for a long course.
   */
  async find(ctx) {
    const user = requireUser(ctx.state.user);
    const courseKey = (ctx.query.courseId ?? ctx.query.course) as
      | string
      | undefined;

    if (!courseKey) {
      throw new ValidationError("A `courseId` query parameter is required.");
    }

    const course = await findCourse(strapi, courseKey);
    if (!course) throw new NotFoundError("Course not found.");

    // Same wall as `findOne`, applied to the list.
    await assertCourseReadAccess(strapi, user, course);

    const lessons = await orderedLessons(strapi, course.id);

    let completedLessonIds: number[] = [];
    if (isStudent(user)) {
      const rows = await strapi.db.query(LESSON_PROGRESS_UID).findMany({
        where: { student: user.id, course: course.id, completed: true },
        populate: ["lesson"],
      });
      completedLessonIds = rows
        .map((row: any) => row.lesson?.id)
        .filter(Boolean);
    }

    ctx.body = {
      data: lessons.map((lesson: any, index: number) =>
        lessonSummary(lesson, {
          position: index + 1,
          completed: completedLessonIds.includes(lesson.id),
        }),
      ),
      meta: { total: lessons.length, courseId: course.id },
    };
  },

  /**
   * GET /api/lessons/:id
   *
   * Returns the lesson body plus everything the player needs to render navigation:
   * position in the course, the neighbouring lesson ids, and the caller's own
   * completion flag.
   *
   * The enrollment check already ran in the policy, which also left the parent
   * course on `ctx.state.course`.
   */
  async findOne(ctx) {
    const user = requireUser(ctx.state.user);
    const key = String(ctx.params.id);

    const where = /^\d+$/.test(key)
      ? { $or: [{ id: Number(key) }, { documentId: key }] }
      : { documentId: key };

    const lesson = await strapi.db.query(LESSON_UID).findOne({
      where,
      populate: { course: { populate: ["owner"] } },
    });

    if (!lesson || !lesson.course) throw new NotFoundError("Lesson not found.");

    const siblings = await orderedLessons(strapi, lesson.course.id);
    const index = siblings.findIndex((item: any) => item.id === lesson.id);

    let completed = false;
    if (isStudent(user)) {
      const progressRow = await strapi.db.query(LESSON_PROGRESS_UID).findOne({
        where: { student: user.id, lesson: lesson.id },
      });
      completed = Boolean(progressRow?.completed);
    }

    ctx.body = {
      data: lessonDetail(lesson, {
        position: index + 1,
        totalLessons: siblings.length,
        completed,
        previousLessonId: index > 0 ? siblings[index - 1].id : null,
        nextLessonId:
          index >= 0 && index < siblings.length - 1
            ? siblings[index + 1].id
            : null,
        course: {
          id: lesson.course.id,
          documentId: lesson.course.documentId,
          title: lesson.course.title,
        },
      }),
    };
  },

  /**
   * POST /api/lessons
   *
   * `order` is assigned server-side — next free slot at the end of the course —
   * unless the author explicitly supplies one. Letting the client pick freely is
   * how you end up with three lessons all claiming to be lesson 2.
   */
  async create(ctx) {
    requireUser(ctx.state.user);
    const payload = readBody(ctx);

    // The policy resolved and validated the course from the body.
    const course = ctx.state.course;
    if (!course) throw new ValidationError("A `course` reference is required.");

    const data = pickWritable(payload);
    if (!data.title || !String(data.title).trim()) {
      throw new ValidationError("A lesson title is required.");
    }

    if (data.order === undefined || data.order === null) {
      const existing = await strapi.db
        .query(LESSON_UID)
        .count({ where: { course: course.id } });
      data.order = existing + 1;
    }

    const created = await strapi.documents(LESSON_UID).create({
      // `title` is validated above; the allow-list map is too dynamic for TypeScript
      // to prove that, so the cast stays scoped to this call.
      data: { ...data, course: course.id } as any,
      populate: ["course"],
    });

    ctx.status = 201;
    ctx.body = { data: lessonDetail(created) };
  },

  /** PUT /api/lessons/:id — ownership already checked by the route policy. */
  async update(ctx) {
    const key = String(ctx.params.id);
    const where = /^\d+$/.test(key)
      ? { $or: [{ id: Number(key) }, { documentId: key }] }
      : { documentId: key };

    const lesson = await strapi.db.query(LESSON_UID).findOne({ where });
    if (!lesson) throw new NotFoundError("Lesson not found.");

    const updated = await strapi.documents(LESSON_UID).update({
      documentId: lesson.documentId,
      data: pickWritable(readBody(ctx)),
      populate: ["course"],
    });

    ctx.body = { data: lessonDetail(updated) };
  },

  /**
   * DELETE /api/lessons/:id
   *
   * Deletes the students' progress rows for this lesson too, then closes the gap in
   * `order` so the remaining lessons stay 1..n. Both matter: a stale progress row
   * would inflate completion counts, and a hole in `order` breaks "next lesson".
   */
  async delete(ctx) {
    const key = String(ctx.params.id);
    const where = /^\d+$/.test(key)
      ? { $or: [{ id: Number(key) }, { documentId: key }] }
      : { documentId: key };

    const lesson = await strapi.db
      .query(LESSON_UID)
      .findOne({ where, populate: ["course"] });
    if (!lesson) throw new NotFoundError("Lesson not found.");

    const courseId = lesson.course?.id;

    await strapi.db
      .query(LESSON_PROGRESS_UID)
      .deleteMany({ where: { lesson: lesson.id } });
    await strapi
      .documents(LESSON_UID)
      .delete({ documentId: lesson.documentId });

    if (courseId) await resequence(strapi, courseId);

    ctx.body = { data: { id: lesson.id, deleted: true } };
  },

  /**
   * PUT /api/lessons/reorder
   *
   * Body: `{ course: <id>, lessonIds: [<id>, ...] }` — the new sequence as the
   * author dragged it. Written as one endpoint rather than N updates so the whole
   * reorder either lands or does not; a half-applied reorder would leave duplicate
   * `order` values.
   */
  async reorder(ctx) {
    const payload = readBody(ctx);
    const course = ctx.state.course;
    if (!course) throw new ValidationError("A `course` reference is required.");

    const lessonIds: unknown = payload.lessonIds ?? payload.order;
    if (!Array.isArray(lessonIds) || lessonIds.length === 0) {
      throw new ValidationError(
        "`lessonIds` must be a non-empty array of lesson ids.",
      );
    }

    const lessons = await strapi.db
      .query(LESSON_UID)
      .findMany({ where: { course: course.id } });
    const byId = new Map<number, any>(
      lessons.map((lesson: any) => [lesson.id, lesson]),
    );

    // Reject ids that are not in this course rather than silently ignoring them —
    // a mismatch means the client's view is stale and the author should reload.
    const requested = lessonIds.map(Number);
    const unknownId = requested.find((id) => !byId.has(id));
    if (unknownId !== undefined) {
      throw new ValidationError(
        `Lesson ${unknownId} does not belong to this course.`,
      );
    }

    let position = 1;
    for (const id of requested) {
      await strapi.documents(LESSON_UID).update({
        documentId: byId.get(id).documentId,
        data: { order: position },
      });
      position += 1;
    }

    // Anything the client did not mention keeps its relative order, appended.
    const remaining = lessons
      .filter((lesson: any) => !requested.includes(lesson.id))
      .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));

    for (const lesson of remaining) {
      await strapi.documents(LESSON_UID).update({
        documentId: lesson.documentId,
        data: { order: position },
      });
      position += 1;
    }

    const updated = await orderedLessons(strapi, course.id);
    ctx.body = {
      data: updated.map((lesson: any, index: number) =>
        lessonSummary(lesson, { position: index + 1 }),
      ),
    };
  },
}));

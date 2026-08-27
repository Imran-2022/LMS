/**
 * Quiz controller.
 *
 * A stock Strapi `GET /api/quizzes/1` would return every question *with*
 * `correctOptionIndex` — i.e. hand the answer key to the student about to sit the
 * quiz. That single fact is why this controller exists.
 *
 * The rule: `quizForStudent()` is the default shape, and the answer key is only
 * added (`quizWithAnswers()`) for a caller who could edit the course anyway. The
 * decision is made here, on the server, not by the frontend choosing what to render.
 */
import { factories } from "@strapi/strapi";
import { errors } from "@strapi/utils";

import {
  QUIZ_ATTEMPT_UID,
  QUIZ_UID,
  assertCourseReadAccess,
  canWriteCourse,
  findCourse,
  requireUser,
} from "../../../utils/authorization";
import { quizForStudent, quizWithAnswers } from "../../../utils/serialize";

const { NotFoundError, ValidationError } = errors;

function readBody(ctx: any) {
  const body = ctx.request?.body ?? {};
  return body.data ?? body;
}

function reviewAttempt(quiz: any, attempt: any) {
  const answers = new Map(
    (Array.isArray(attempt.answers) ? attempt.answers : []).map(
      (answer: any) => [
        Number(answer.questionIndex),
        answer.selectedOptionIndex ?? null,
      ],
    ),
  );

  return (quiz.questions ?? []).map((question: any, questionIndex: number) => {
    const selectedOptionIndex = answers.has(questionIndex)
      ? answers.get(questionIndex)
      : null;
    const correctOptionIndex = Number(question.correctOptionIndex ?? 0);

    return {
      questionIndex,
      questionText: question.text,
      selectedOptionIndex,
      correctOptionIndex,
      isCorrect:
        selectedOptionIndex !== null &&
        selectedOptionIndex === correctOptionIndex,
      explanation: question.explanation ?? null,
      options: (question.options ?? []).map((option: any, index: number) => ({
        index,
        text: option.text,
      })),
    };
  });
}

/**
 * Validates the question set before it is stored.
 *
 * Grading assumes `correctOptionIndex` points at a real option. If a malformed quiz
 * were allowed in, every attempt against it would silently score 0 and the bug
 * would look like a grading bug rather than a data bug — so it is rejected at the
 * door instead.
 */
function normaliseQuestions(rawQuestions: unknown) {
  if (rawQuestions === undefined) return undefined;

  if (!Array.isArray(rawQuestions)) {
    throw new ValidationError("`questions` must be an array.");
  }

  return rawQuestions.map((question: any, index: number) => {
    const label = `Question ${index + 1}`;

    const text = String(question?.text ?? "").trim();
    if (!text)
      throw new ValidationError(`${label}: question text is required.`);

    const options = Array.isArray(question?.options) ? question.options : [];
    const cleanOptions = options
      .map((option: any) => ({ text: String(option?.text ?? "").trim() }))
      .filter((option: { text: string }) => option.text.length > 0);

    if (cleanOptions.length < 2) {
      throw new ValidationError(
        `${label}: at least two answer options are required.`,
      );
    }

    const correctOptionIndex = Number(question?.correctOptionIndex ?? 0);
    if (
      !Number.isInteger(correctOptionIndex) ||
      correctOptionIndex < 0 ||
      correctOptionIndex >= cleanOptions.length
    ) {
      throw new ValidationError(
        `${label}: the correct answer must be one of the ${cleanOptions.length} options provided.`,
      );
    }

    return {
      text,
      options: cleanOptions,
      correctOptionIndex,
      explanation: question?.explanation ? String(question.explanation) : null,
    };
  });
}

export default factories.createCoreController(QUIZ_UID, ({ strapi }) => ({
  /**
   * GET /api/quizzes?courseId=123
   *
   * Quiz list for a course. Metadata only — never the questions — so this is safe
   * to render on a course page before the student opens the quiz.
   */
  async find(ctx) {
    const user = requireUser(ctx.state.user);
    const courseKey = (ctx.query.courseId ?? ctx.query.course) as
      | string
      | undefined;

    if (!courseKey)
      throw new ValidationError("A `courseId` query parameter is required.");

    const course = await findCourse(strapi, courseKey);
    if (!course) throw new NotFoundError("Course not found.");

    await assertCourseReadAccess(strapi, user, course);

    const quizzes = await strapi.db.query(QUIZ_UID).findMany({
      where: { course: course.id },
      populate: ["questions"],
      orderBy: [{ id: "asc" }],
    });

    // How the caller has done so far, so the course page can show "Best: 80%".
    const attempts = await strapi.db.query(QUIZ_ATTEMPT_UID).findMany({
      where: { student: user.id, course: course.id },
      populate: ["quiz"],
    });

    ctx.body = {
      data: quizzes.map((quiz: any) => {
        const quizAttempts = attempts.filter(
          (attempt: any) => attempt.quiz?.id === quiz.id,
        );
        return {
          id: quiz.id,
          documentId: quiz.documentId,
          title: quiz.title,
          description: quiz.description ?? null,
          passingScore: quiz.passingScore ?? 70,
          questionCount: quiz.questions?.length ?? 0,
          attemptCount: quizAttempts.length,
          bestScore: quizAttempts.length
            ? Math.max(...quizAttempts.map((a: any) => a.score ?? 0))
            : null,
        };
      }),
      meta: { total: quizzes.length, courseId: course.id },
    };
  },

  /**
   * GET /api/quizzes/:id
   *
   * Enrollment is checked by the route policy. What differs by role is the *shape*:
   * a student gets questions and options with no indication of which is right; an
   * author gets the answer key so they can edit it.
   */
  async findOne(ctx) {
    const user = requireUser(ctx.state.user);
    const key = String(ctx.params.id);
    const where = /^\d+$/.test(key)
      ? { $or: [{ id: Number(key) }, { documentId: key }] }
      : { documentId: key };

    const quiz = await strapi.db.query(QUIZ_UID).findOne({
      where,
      populate: {
        questions: { populate: ["options"] },
        course: { populate: ["owner"] },
      },
    });

    if (!quiz || !quiz.course) throw new NotFoundError("Quiz not found.");

    const isAuthor = canWriteCourse(user, quiz.course);

    // The student's own attempt history travels with the quiz so the results screen
    // can be shown again later, as the brief requires.
    const attempts = await strapi.db.query(QUIZ_ATTEMPT_UID).findMany({
      where: { student: user.id, quiz: quiz.id },
      orderBy: [{ createdAt: "desc" }],
    });
    const latestAttempt = attempts[0];

    ctx.body = {
      data: {
        ...(isAuthor ? quizWithAnswers(quiz) : quizForStudent(quiz)),
        course: {
          id: quiz.course.id,
          documentId: quiz.course.documentId,
          title: quiz.course.title,
        },
        canEdit: isAuthor,
        myAttempts: attempts.map((attempt: any) => ({
          id: attempt.id,
          score: attempt.score ?? 0,
          correctCount: attempt.correctCount ?? 0,
          totalQuestions: attempt.totalQuestions ?? 0,
          currentQuestionCount: quiz.questions?.length ?? 0,
          passed: Boolean(attempt.passed),
          submittedAt: attempt.submittedAt ?? attempt.createdAt,
        })),
        myAttempt:
          !isAuthor && latestAttempt
            ? {
                id: latestAttempt.id,
                documentId: latestAttempt.documentId,
                score: latestAttempt.score ?? 0,
                correctCount: latestAttempt.correctCount ?? 0,
                totalQuestions: latestAttempt.totalQuestions ?? 0,
                currentQuestionCount: quiz.questions?.length ?? 0,
                passed: Boolean(latestAttempt.passed),
                answers: latestAttempt.answers ?? [],
                submittedAt:
                  latestAttempt.submittedAt ?? latestAttempt.createdAt,
                quiz: {
                  id: quiz.id,
                  documentId: quiz.documentId,
                  title: quiz.title,
                  passingScore: quiz.passingScore ?? 70,
                },
                course: { id: quiz.course.id, title: quiz.course.title },
                student: null,
                breakdown: Array.isArray(latestAttempt.questionSnapshot)
                  ? latestAttempt.questionSnapshot
                  : reviewAttempt(quiz, latestAttempt),
              }
            : undefined,
      },
    };
  },

  /** POST /api/quizzes — course ownership checked by the route policy. */
  async create(ctx) {
    requireUser(ctx.state.user);
    const payload = readBody(ctx);
    const course = ctx.state.course;

    if (!course) throw new ValidationError("A `course` reference is required.");

    const title = String(payload.title ?? "").trim();
    if (!title) throw new ValidationError("A quiz title is required.");

    const questions = normaliseQuestions(payload.questions) ?? [];

    const created = await strapi.documents(QUIZ_UID).create({
      data: {
        title,
        description: payload.description ?? null,
        passingScore: this.clampPassingScore(payload.passingScore),
        course: course.id,
        questions,
      },
      populate: { questions: { populate: ["options"] }, course: true },
    });

    ctx.status = 201;
    ctx.body = { data: quizWithAnswers(created) };
  },

  /**
   * PUT /api/quizzes/:id
   *
   * Questions are replaced wholesale rather than patched. Repeatable components have
   * no stable client-side identity once an author reorders or deletes one, so a
   * partial update is guesswork; sending the full set is unambiguous.
   */
  async update(ctx) {
    requireUser(ctx.state.user);
    const key = String(ctx.params.id);
    const where = /^\d+$/.test(key)
      ? { $or: [{ id: Number(key) }, { documentId: key }] }
      : { documentId: key };

    const quiz = await strapi.db.query(QUIZ_UID).findOne({ where });
    if (!quiz) throw new NotFoundError("Quiz not found.");

    const payload = readBody(ctx);
    const data: Record<string, any> = {};

    if (payload.title !== undefined) {
      const title = String(payload.title).trim();
      if (!title) throw new ValidationError("A quiz title is required.");
      data.title = title;
    }
    if (payload.description !== undefined)
      data.description = payload.description;
    if (payload.passingScore !== undefined)
      data.passingScore = this.clampPassingScore(payload.passingScore);

    const questions = normaliseQuestions(payload.questions);
    if (questions !== undefined) data.questions = questions;

    const updated = await strapi.documents(QUIZ_UID).update({
      documentId: quiz.documentId,
      data,
      populate: { questions: { populate: ["options"] }, course: true },
    });

    ctx.body = { data: quizWithAnswers(updated) };
  },

  /** DELETE /api/quizzes/:id — takes the attempt history with it. */
  async delete(ctx) {
    const key = String(ctx.params.id);
    const where = /^\d+$/.test(key)
      ? { $or: [{ id: Number(key) }, { documentId: key }] }
      : { documentId: key };

    const quiz = await strapi.db.query(QUIZ_UID).findOne({ where });
    if (!quiz) throw new NotFoundError("Quiz not found.");

    await strapi.db
      .query(QUIZ_ATTEMPT_UID)
      .deleteMany({ where: { quiz: quiz.id } });
    await strapi.documents(QUIZ_UID).delete({ documentId: quiz.documentId });

    ctx.body = { data: { id: quiz.id, deleted: true } };
  },

  /** `passingScore` is a percentage; anything outside 0–100 is a client bug. */
  clampPassingScore(value: unknown) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return 70;
    return Math.min(100, Math.max(0, Math.round(parsed)));
  },
}));

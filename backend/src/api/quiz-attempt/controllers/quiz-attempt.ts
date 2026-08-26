/**
 * Quiz attempt controller — the auto-grading differentiator.
 *
 * The whole feature turns on one decision: **the browser sends choices, the server
 * sends back a score.** Never the other way round.
 *
 * A submission looks like `{ quiz: 3, answers: [{ questionIndex: 0,
 * selectedOptionIndex: 2 }, ...] }`. There is no `score` field in the payload, and
 * even if a client invented one it would be ignored — `grade()` below is the only
 * thing that can produce a score, and it reads `correctOptionIndex` from the
 * database, which the student's copy of the quiz never contained.
 *
 * Each student may submit a quiz once. The stored attempt is the student's review
 * record, while the answer key is only released in the immediate graded response.
 */
import { factories } from "@strapi/strapi";
import { errors } from "@strapi/utils";

import {
  QUIZ_ATTEMPT_UID,
  QUIZ_UID,
  canWriteCourse,
  findCourse,
  findEnrollment,
  requireUser,
} from "../../../utils/authorization";
import { quizAttemptSummary } from "../../../utils/serialize";
import { isPrivileged, isStudent, type AuthUser } from "../../../utils/roles";

const { ForbiddenError, NotFoundError, ValidationError } = errors;

function readBody(ctx: any) {
  const body = ctx.request?.body ?? {};
  return body.data ?? body;
}

/**
 * Turns whatever the client sent into a clean `questionIndex → selectedOptionIndex`
 * map.
 *
 * A `Map` rather than an array because it makes "unanswered" unambiguous: if the key
 * is missing, the student skipped it, and a skipped question is wrong. Iterating the
 * *quiz's* questions rather than the *submission's* answers is also what stops a
 * client from shortening the quiz by omitting the questions it does not know.
 */
function toAnswerMap(rawAnswers: unknown): Map<number, number | null> {
  if (!Array.isArray(rawAnswers)) {
    throw new ValidationError(
      "`answers` must be an array of { questionIndex, selectedOptionIndex }.",
    );
  }

  const map = new Map<number, number | null>();

  for (const answer of rawAnswers as any[]) {
    const questionIndex = Number(answer?.questionIndex);
    if (!Number.isInteger(questionIndex) || questionIndex < 0) continue;

    const raw = answer?.selectedOptionIndex;
    const selected =
      raw === null || raw === undefined || raw === "" ? null : Number(raw);

    map.set(
      questionIndex,
      Number.isInteger(selected as number) ? (selected as number) : null,
    );
  }

  return map;
}

/**
 * The grading function. This is the whole auto-grader.
 *
 * Reads `correctOptionIndex` straight off the stored question, compares, counts,
 * and rounds once at the end. Nothing here touches the request body except through
 * `answerMap`, which is why the client cannot influence the outcome beyond
 * choosing answers.
 *
 * Note the iteration: over `questions`, the server's copy — not over the submitted
 * answers. A client that omits the questions it does not know still gets marked on
 * all of them.
 */
function grade(
  questions: any[],
  answerMap: Map<number, number | null>,
  passingScore: number,
) {
  const breakdown = questions.map((question: any, questionIndex: number) => {
    const selectedOptionIndex = answerMap.has(questionIndex)
      ? answerMap.get(questionIndex)!
      : null;
    const correctOptionIndex = Number(question.correctOptionIndex ?? 0);

    // An unanswered question is simply wrong — no partial credit, no skipping.
    const isCorrect =
      selectedOptionIndex !== null &&
      selectedOptionIndex === correctOptionIndex;

    return {
      questionIndex,
      questionText: question.text,
      selectedOptionIndex,
      correctOptionIndex,
      isCorrect,
      explanation: question.explanation ?? null,
      options: (question.options ?? []).map((option: any, index: number) => ({
        index,
        text: option.text,
      })),
    };
  });

  const totalQuestions = breakdown.length;
  const correctCount = breakdown.filter((row) => row.isCorrect).length;

  // Round once, at the end. Rounding per-question would let a 2/3 quiz report 67%
  // in one place and 66% in another.
  const score =
    totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  return {
    breakdown,
    totalQuestions,
    correctCount,
    score,
    passed: score >= passingScore,
  };
}

export default factories.createCoreController(
  QUIZ_ATTEMPT_UID,
  ({ strapi }) => ({
    /**
     * POST /api/quiz-attempts
     *
     * Grade, store, respond. The response includes a per-question breakdown — the
     * correct answer is revealed *after* submission, which is safe and makes the quiz
     * a teaching tool rather than just a gate.
     */
    async create(ctx) {
      const user = requireUser(ctx.state.user);
      const payload = readBody(ctx);

      const quizRef = payload.quiz ?? payload.quizId;
      const quizKey = quizRef?.id ?? quizRef?.documentId ?? quizRef;
      if (!quizKey)
        throw new ValidationError("A `quiz` reference is required.");

      const key = String(quizKey);
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

      // Same wall as opening the quiz: you cannot submit to a course you never joined.
      const enrollment = await findEnrollment(strapi, user.id, quiz.course.id);
      if (!enrollment) {
        throw new ForbiddenError(
          "Enroll in this course before taking its quizzes.",
        );
      }

      const existingAttempt = await strapi.db.query(QUIZ_ATTEMPT_UID).findOne({
        where: { student: user.id, quiz: quiz.id },
      });
      if (existingAttempt) {
        throw new ValidationError("You have already submitted this quiz.");
      }

      const questions = Array.isArray(quiz.questions) ? quiz.questions : [];
      if (questions.length === 0) {
        throw new ValidationError("This quiz has no questions yet.");
      }

      const answerMap = toAnswerMap(payload.answers);
      const graded = grade(questions, answerMap, quiz.passingScore ?? 70);

      const attempt = await strapi.documents(QUIZ_ATTEMPT_UID).create({
        data: {
          student: user.id,
          quiz: quiz.id,
          course: quiz.course.id,
          // Store what they actually chose, normalised — useful for review screens and
          // for an instructor diagnosing a badly-worded question.
          answers: graded.breakdown.map(
            ({ questionIndex, selectedOptionIndex }) => ({
              questionIndex,
              selectedOptionIndex,
            }),
          ),
          score: graded.score,
          correctCount: graded.correctCount,
          totalQuestions: graded.totalQuestions,
          passed: graded.passed,
          submittedAt: new Date(),
        },
        populate: { quiz: true, course: true },
      });

      ctx.status = 201;
      ctx.body = {
        data: {
          ...quizAttemptSummary(attempt),
          // The review payload — correct answers and explanations, released only now.
          breakdown: graded.breakdown,
        },
      };
    },

    /**
     * GET /api/quiz-attempts/mine
     *
     * "Viewable later": a student's full attempt history, newest first, optionally
     * filtered to one course.
     */
    async mine(ctx) {
      const user = requireUser(ctx.state.user);
      const where: Record<string, any> = { student: user.id };

      if (ctx.query.courseId) {
        const course = await findCourse(strapi, String(ctx.query.courseId));
        if (!course) throw new NotFoundError("Course not found.");
        where.course = course.id;
      }
      if (ctx.query.quizId) where.quiz = Number(ctx.query.quizId);

      const attempts = await strapi.db.query(QUIZ_ATTEMPT_UID).findMany({
        where,
        populate: ["quiz", "course"],
        orderBy: [{ createdAt: "desc" }],
      });

      ctx.body = {
        data: attempts.map((attempt: any) => quizAttemptSummary(attempt)),
        meta: {
          total: attempts.length,
          bestScore: attempts.length
            ? Math.max(...attempts.map((a: any) => a.score ?? 0))
            : null,
        },
      };
    },

    /**
     * GET /api/quiz-attempts?courseId=…&quizId=…
     *
     * The staff/instructor view of results. An instructor may only read attempts inside
     * a course they own — enforced by loading the course and running the same
     * `canWriteCourse` rule used everywhere else, rather than trusting the filter.
     */
    async find(ctx) {
      const user = requireUser(ctx.state.user) as AuthUser;

      if (isStudent(user)) {
        throw new ForbiddenError("Students can only view their own attempts.");
      }

      const where: Record<string, any> = {};

      if (ctx.query.courseId) {
        const course = await findCourse(strapi, String(ctx.query.courseId));
        if (!course) throw new NotFoundError("Course not found.");

        if (!canWriteCourse(user, course)) {
          throw new ForbiddenError(
            "You can only review results for your own courses.",
          );
        }
        where.course = course.id;
      } else if (!isPrivileged(user)) {
        // An instructor with no course filter would otherwise see the whole platform.
        // Scope them to every course they own instead of refusing outright.
        const owned = await strapi.db.query("api::course.course").findMany({
          where: { owner: user.id },
        });
        const ownedIds = owned.map((course: any) => course.id);
        if (ownedIds.length === 0) {
          ctx.body = { data: [], meta: { total: 0 } };
          return;
        }
        where.course = { $in: ownedIds };
      }

      if (ctx.query.quizId) where.quiz = Number(ctx.query.quizId);
      if (ctx.query.studentId) where.student = Number(ctx.query.studentId);

      const attempts = await strapi.db.query(QUIZ_ATTEMPT_UID).findMany({
        where,
        populate: ["quiz", "course", "student"],
        orderBy: [{ createdAt: "desc" }],
        limit: 200,
      });

      ctx.body = {
        data: attempts.map((attempt: any) => quizAttemptSummary(attempt)),
        meta: {
          total: attempts.length,
          averageScore: attempts.length
            ? Math.round(
                attempts.reduce(
                  (sum: number, a: any) => sum + (a.score ?? 0),
                  0,
                ) / attempts.length,
              )
            : 0,
          passRate: attempts.length
            ? Math.round(
                (attempts.filter((a: any) => a.passed).length /
                  attempts.length) *
                  100,
              )
            : 0,
        },
      };
    },
  }),
);

/**
 * Response shaping.
 *
 * The controllers in this project query the database directly (`strapi.db.query`)
 * rather than leaning on the core controllers' implicit sanitisation, because the
 * authorization rules need the raw rows before deciding what to return. The
 * trade-off is that *we* become responsible for what leaves the server — so every
 * response goes through one of the mappers below.
 *
 * Rule of thumb applied here: build the payload from an allow-list of fields. A
 * new column added to a content type never leaks by accident, because nothing
 * spreads a raw row into a response.
 */
import { ROLE_LABELS, type RoleType } from './roles';

/**
 * A user as the rest of the platform is allowed to see them.
 *
 * `password`, `resetPasswordToken` and `confirmationToken` exist on the row and
 * must never appear in a response — naming the six fields we *do* want is the
 * cheapest way to guarantee that.
 */
export function publicUser(user: any) {
  if (!user) return null;

  const roleType = user.role?.type as RoleType | undefined;

  return {
    id: user.id,
    documentId: user.documentId,
    username: user.username,
    email: user.email,
    fullName: user.fullName ?? null,
    mobileNumber: user.mobileNumber ?? null,
    avatarUrl: user.avatarUrl ?? null,
    bio: user.bio ?? null,
    blocked: Boolean(user.blocked),
    confirmed: Boolean(user.confirmed),
    createdAt: user.createdAt,
    role: roleType
      ? { id: user.role.id, type: roleType, name: user.role.name ?? ROLE_LABELS[roleType] }
      : null,
  };
}

/** Author byline — even less than `publicUser`, since a blog reader is anonymous. */
export function authorSummary(user: any) {
  if (!user) return null;
  return {
    id: user.id,
    username: user.username,
    fullName: user.fullName ?? null,
    avatarUrl: user.avatarUrl ?? null,
  };
}

export function courseCard(course: any, extra: Record<string, unknown> = {}) {
  if (!course) return null;

  return {
    id: course.id,
    documentId: course.documentId,
    title: course.title,
    slug: course.slug,
    summary: course.summary ?? null,
    coverImageUrl: course.coverImageUrl ?? null,
    category: course.category ?? null,
    level: course.level ?? 'beginner',
    durationMinutes: course.durationMinutes ?? 0,
    status: course.status ?? 'draft',
    publishedAt: course.publishedAt ?? null,
    createdAt: course.createdAt,
    updatedAt: course.updatedAt,
    owner: authorSummary(course.owner),
    // Counts are attached by the controller when it has them; `??` keeps the
    // shape stable so the frontend never has to null-check.
    lessonCount: (extra.lessonCount as number) ?? course.lessons?.length ?? 0,
    quizCount: (extra.quizCount as number) ?? course.quizzes?.length ?? 0,
    enrollmentCount: (extra.enrollmentCount as number) ?? course.enrollments?.length ?? 0,
    ...extra,
  };
}

/** Full course view: card fields plus the long description. */
export function courseDetail(course: any, extra: Record<string, unknown> = {}) {
  const card = courseCard(course, extra);
  if (!card) return null;
  return { ...card, description: course.description ?? null };
}

/** Lesson without its body — safe for a table of contents shown before enrolling. */
export function lessonSummary(lesson: any, extra: Record<string, unknown> = {}) {
  if (!lesson) return null;

  return {
    id: lesson.id,
    documentId: lesson.documentId,
    title: lesson.title,
    summary: lesson.summary ?? null,
    order: lesson.order ?? 1,
    durationMinutes: lesson.durationMinutes ?? 0,
    ...extra,
  };
}

/** Lesson including `content` — only ever returned behind an enrollment check. */
export function lessonDetail(lesson: any, extra: Record<string, unknown> = {}) {
  const summary = lessonSummary(lesson, extra);
  if (!summary) return null;

  return {
    ...summary,
    content: lesson.content ?? null,
    videoUrl: lesson.videoUrl ?? null,
    courseId: lesson.course?.id ?? null,
    ...extra,
  };
}

/**
 * A quiz with every `correctOptionIndex` removed.
 *
 * This is the whole reason quizzes are not served by the default core controller:
 * `GET /api/quizzes/1` on a stock Strapi install returns the answer key. Students
 * always get this shape; staff get `quizWithAnswers`.
 */
export function quizForStudent(quiz: any) {
  if (!quiz) return null;

  return {
    id: quiz.id,
    documentId: quiz.documentId,
    title: quiz.title,
    description: quiz.description ?? null,
    passingScore: quiz.passingScore ?? 70,
    courseId: quiz.course?.id ?? null,
    questionCount: quiz.questions?.length ?? 0,
    questions: (quiz.questions ?? []).map((question: any, index: number) => ({
      index,
      id: question.id,
      text: question.text,
      options: (question.options ?? []).map((option: any, optionIndex: number) => ({
        index: optionIndex,
        id: option.id,
        text: option.text,
      })),
      // `correctOptionIndex` and `explanation` are deliberately absent.
    })),
  };
}

/** Authoring view: the answer key included, for staff and owning instructors. */
export function quizWithAnswers(quiz: any) {
  const base = quizForStudent(quiz);
  if (!base) return null;

  return {
    ...base,
    questions: base.questions.map((question, index) => ({
      ...question,
      correctOptionIndex: quiz.questions?.[index]?.correctOptionIndex ?? 0,
      explanation: quiz.questions?.[index]?.explanation ?? null,
    })),
  };
}

export function blogPostCard(post: any) {
  if (!post) return null;

  return {
    id: post.id,
    documentId: post.documentId,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt ?? null,
    coverImageUrl: post.coverImageUrl ?? null,
    tags: post.tags
      ? String(post.tags)
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean)
      : [],
    readingMinutes: post.readingMinutes ?? 3,
    status: post.status ?? 'draft',
    publishedDate: post.publishedDate ?? null,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    author: authorSummary(post.author),
  };
}

export function blogPostDetail(post: any) {
  const card = blogPostCard(post);
  if (!card) return null;
  return { ...card, body: post.body ?? null };
}

export function enrollmentSummary(enrollment: any, extra: Record<string, unknown> = {}) {
  if (!enrollment) return null;

  return {
    id: enrollment.id,
    documentId: enrollment.documentId,
    enrolledAt: enrollment.enrolledAt ?? enrollment.createdAt,
    completedAt: enrollment.completedAt ?? null,
    course: courseCard(enrollment.course),
    student: authorSummary(enrollment.student),
    ...extra,
  };
}

export function quizAttemptSummary(attempt: any) {
  if (!attempt) return null;

  return {
    id: attempt.id,
    documentId: attempt.documentId,
    score: attempt.score ?? 0,
    correctCount: attempt.correctCount ?? 0,
    totalQuestions: attempt.totalQuestions ?? 0,
    passed: Boolean(attempt.passed),
    answers: attempt.answers ?? [],
    submittedAt: attempt.submittedAt ?? attempt.createdAt,
    quiz: attempt.quiz
      ? {
          id: attempt.quiz.id,
          documentId: attempt.quiz.documentId,
          title: attempt.quiz.title,
          passingScore: attempt.quiz.passingScore ?? 70,
        }
      : null,
    course: attempt.course ? { id: attempt.course.id, title: attempt.course.title } : null,
    student: authorSummary(attempt.student),
  };
}

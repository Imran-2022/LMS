/**
 * Response types, mirroring the serializers in `backend/src/utils/serialize.ts`.
 *
 * These are written by hand rather than generated. Strapi can emit types for its
 * *content types*, but this frontend never talks to a generic Strapi endpoint — it
 * talks to purpose-built controllers that return reshaped payloads (a course with
 * `lessonCount` attached, a quiz with the answer key stripped). Generated schema
 * types would describe the database, not the API.
 *
 * The pairing worth noticing is `Quiz` vs `QuizWithAnswers`. Those are two distinct
 * types because they are two distinct payloads from the same URL: a student's copy
 * has no `correctOptionIndex`, and having the compiler know that means a student
 * screen physically cannot render the answer key — the field is not on the type.
 */

export type RoleType = "admin" | "content_manager" | "instructor" | "student";

export type ContentStatus = "draft" | "published";

export type CourseLevel = "beginner" | "intermediate" | "advanced";

/** Author byline: the least we can say about a user. */
export type UserSummary = {
  id: number;
  username: string;
  fullName: string | null;
  mobileNumber: string | null;
  avatarUrl: string | null;
};

/** The signed-in user, from `GET /api/me`. */
export type SessionUser = {
  id: number;
  documentId: string;
  username: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  blocked: boolean;
  confirmed: boolean;
  createdAt: string;
  role: { id: number; type: RoleType; name: string } | null;
};

/** Admin user table row: a session user plus the two counts the table shows. */
export type AdminUser = SessionUser & {
  enrollmentCount: number;
  ownedCourseCount: number;
};

export type Course = {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  summary: string | null;
  coverImageUrl: string | null;
  category: string | null;
  level: CourseLevel;
  durationMinutes: number;
  status: ContentStatus;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  owner: UserSummary | null;
  lessonCount: number;
  quizCount: number;
  enrollmentCount: number;
  /** Present on `GET /api/courses/:id`. */
  description?: string | null;
  /** Attached for a signed-in student on catalogue and detail responses. */
  isEnrolled?: boolean;
  progress?: CourseProgress;
};

export type CourseProgress = {
  completed: number;
  total: number;
  percent: number;
  completedLessonIds: number[];
  courseId?: number;
  studentId?: number;
};

export type LessonSummary = {
  id: number;
  documentId: string;
  title: string;
  summary: string | null;
  order: number;
  durationMinutes: number;
  /** Position in the course, 1-based — the rail's numbering. */
  position?: number;
  /** Only meaningful for a student. */
  completed?: boolean;
};

export type LessonDetail = LessonSummary & {
  content: string | null;
  videoUrl: string | null;
  courseId: number | null;
  totalLessons?: number;
  previousLessonId?: number | null;
  nextLessonId?: number | null;
  course?: { id: number; documentId: string; title: string };
};

export type QuizOption = { index: number; id: number; text: string };

/** A question as a *student* receives it. No answer key — see the note above. */
export type QuizQuestion = {
  index: number;
  id: number;
  text: string;
  options: QuizOption[];
};

export type Quiz = {
  id: number;
  documentId: string;
  title: string;
  description: string | null;
  passingScore: number;
  courseId: number | null;
  questionCount: number;
  questions: QuizQuestion[];
  myAttempt?: QuizAttempt;
};

export type CourseQuizSummary = Pick<Quiz, "id" | "documentId" | "title" | "description" | "passingScore" | "questionCount"> & {
  position: number;
  completed: boolean;
  score: number | null;
  passed: boolean | null;
};

/** The authoring view: same payload plus the key. Staff and owning instructors only. */
export type QuizWithAnswers = Omit<Quiz, "questions"> & {
  questions: (QuizQuestion & {
    correctOptionIndex: number;
    explanation: string | null;
  })[];
};

/** One graded question, returned only in the response to a submission. */
export type GradedAnswer = {
  questionIndex: number;
  questionText: string;
  selectedOptionIndex: number | null;
  correctOptionIndex: number;
  isCorrect: boolean;
  explanation: string | null;
  options: { index: number; text: string }[];
};

export type QuizAttempt = {
  id: number;
  documentId: string;
  score: number;
  correctCount: number;
  totalQuestions: number;
  passed: boolean;
  answers: { questionIndex: number; selectedOptionIndex: number | null }[];
  submittedAt: string;
  quiz: { id: number; documentId: string; title: string; passingScore: number } | null;
  course: { id: number; title: string } | null;
  student: UserSummary | null;
  /** Only on the response to `POST /api/quiz-attempts`, never on history reads. */
  breakdown?: GradedAnswer[];
};

export type Enrollment = {
  id: number;
  documentId: string;
  enrolledAt: string;
  completedAt: string | null;
  course: Course | null;
  student: UserSummary | null;
  progress?: CourseProgress;
};

/** A row of `GET /api/courses/:id/roster`. */
export type RosterRow = {
  enrollmentId: number;
  enrolledAt: string;
  completedAt: string | null;
  student: UserSummary;
  progress: CourseProgress;
  averageQuizScore: number | null;
  completedQuizCount: number;
  totalQuizCount: number;
};

export type BlogPost = {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  tags: string[];
  readingMinutes: number;
  status: ContentStatus;
  publishedDate: string | null;
  createdAt: string;
  updatedAt: string;
  author: UserSummary | null;
  /** Present on `GET /api/blog-posts/:slug`. */
  body?: string | null;
};

/** `GET /api/admin/stats` — everything the admin dashboard renders. */
export type PlatformStats = {
  users: { total: number; byRole: Record<RoleType, number>; blocked: number };
  courses: { total: number; published: number; drafts: number };
  content: { lessons: number; quizzes: number };
  learning: {
    enrollments: number;
    completedEnrollments: number;
    lessonsCompleted: number;
    completionRate: number;
  };
  quizzes: { attempts: number; averageScore: number; passRate: number };
  blog: { total: number; published: number; drafts: number };
  recent: {
    enrollments: { id: number; studentName: string; courseTitle: string; enrolledAt: string }[];
    posts: {
      id: number;
      title: string;
      slug: string;
      status: ContentStatus;
      authorName: string | null;
      createdAt: string;
    }[];
  };
};

/** A row of `GET /api/admin/courses` — includes drafts, unlike the catalogue. */
export type AdminCourse = {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  status: ContentStatus;
  level: CourseLevel;
  category: string | null;
  createdAt: string;
  updatedAt: string;
  owner: { id: number; username: string; fullName: string | null } | null;
  lessonCount: number;
  quizCount: number;
  enrollmentCount: number;
};

export type RoleOption = {
  id: number;
  type: RoleType;
  name: string;
  description: string | null;
};

/** Strapi wraps everything in `{ data, meta }`. */
export type ApiList<T> = { data: T[]; meta?: Record<string, unknown> };
export type ApiItem<T> = { data: T };

/**
 * Demo data seed.
 *
 * A reviewer with ten minutes should not have to create four accounts, write a course
 * and enrol themselves before the app shows anything. So on an empty database the
 * boot fills in a realistic slice of the platform: one account per role, a small
 * catalogue, some lessons and quizzes, a published-and-draft blog, and a student who
 * is already part-way through a course so progress bars are not all at 0%.
 *
 * Safety properties:
 *   - It only runs when the `courses` table is empty. It will never touch, overwrite
 *     or duplicate real data.
 *   - `SEED_DEMO_DATA=false` disables it entirely, which is what a real production
 *     deploy would set.
 *
 * The specific shape is chosen to make the permission rules demonstrable rather than
 * just present. Two instructors exist so "instructor B cannot edit instructor A's
 * course" can be shown live; one course is left in draft so a student's 404 can be
 * shown; two students are enrolled in the same course so the roster is not a list of one.
 */
import {
  BLOG_POST_UID,
  COURSE_UID,
  ENROLLMENT_UID,
  LESSON_PROGRESS_UID,
  LESSON_UID,
  QUIZ_ATTEMPT_UID,
  QUIZ_UID,
  USER_UID,
} from "../utils/authorization";
import { ROLES, type RoleType } from "../utils/roles";
import { slugify } from "../utils/slug";

const ROLE_UID = "plugin::users-permissions.role";

/**
 * Demo credentials. Documented in the README so a reviewer can sign in as each role.
 *
 * These exist to be shared, which is exactly why they are hard-coded here and not
 * treated as secrets: nothing else in the system depends on them, and a real
 * deployment sets `SEED_DEMO_DATA=false` so they are never created.
 */
const DEMO_PASSWORD = "Password123!";

type SeedUser = {
  key: string;
  username: string;
  email: string;
  fullName: string;
  mobileNumber: string;
  bio?: string;
  role: RoleType;
};

const USERS: SeedUser[] = [
  {
    key: "admin",
    username: "amara.admin",
    email: "admin@lms.dev",
    fullName: "Amara Okafor",
    mobileNumber: "+8801700000001",
    bio: "Platform administrator. Manages accounts, roles and everything published.",
    role: ROLES.ADMIN,
  },
  {
    key: "manager",
    username: "diego.manager",
    email: "manager@lms.dev",
    fullName: "Diego Alvarez",
    mobileNumber: "+8801700000002",
    bio: "Content manager. Curates the catalogue and writes for the blog.",
    role: ROLES.CONTENT_MANAGER,
  },
  {
    key: "instructor",
    username: "priya.instructor",
    email: "instructor@lms.dev",
    fullName: "Priya Raman",
    mobileNumber: "+8801700000003",
    bio: "Frontend engineer. Teaches React, Next.js and TypeScript.",
    role: ROLES.INSTRUCTOR,
  },
  {
    // The second instructor is the one that makes ownership demonstrable.
    key: "instructor2",
    username: "kwame.instructor",
    email: "instructor2@lms.dev",
    fullName: "Kwame Mensah",
    mobileNumber: "+8801700000004",
    bio: "Backend engineer. Teaches API design and databases.",
    role: ROLES.INSTRUCTOR,
  },
  {
    key: "student",
    username: "tom.student",
    email: "student@lms.dev",
    fullName: "Tom Whitfield",
    mobileNumber: "+8801700000005",
    bio: "Career switcher working through the frontend track.",
    role: ROLES.STUDENT,
  },
  {
    key: "student2",
    username: "lena.student",
    email: "student2@lms.dev",
    fullName: "Lena Fischer",
    mobileNumber: "+8801700000006",
    bio: "Computer science student.",
    role: ROLES.STUDENT,
  },
];

type SeedLesson = {
  title: string;
  summary: string;
  content: string;
  durationMinutes: number;
};

type SeedQuiz = {
  title: string;
  description: string;
  passingScore: number;
  questions: Array<{
    text: string;
    options: string[];
    correctOptionIndex: number;
    explanation?: string;
  }>;
};

type SeedCourse = {
  ownerKey: string;
  title: string;
  summary: string;
  description: string;
  category: string;
  level: "beginner" | "intermediate" | "advanced";
  status: "draft" | "published";
  coverImageUrl: string;
  lessons: SeedLesson[];
  quizzes: SeedQuiz[];
};

const COURSES: SeedCourse[] = [
  {
    ownerKey: "instructor",
    title: "Modern React with Next.js 15",
    summary:
      "Build a production app with the App Router: server components, server actions, caching and streaming.",
    description:
      "A practical tour of the React model Next.js 15 actually encourages. You will start from a blank App Router project and finish with data fetching on the server, mutations through server actions, and a mental model for when a component needs to be interactive at all.\n\nNo prior Next.js experience assumed; comfortable JavaScript is.",
    category: "Frontend",
    level: "intermediate",
    status: "published",
    coverImageUrl:
      "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=1200&q=80",
    lessons: [
      {
        title: "Server components are the default now",
        summary:
          "Why most of your tree should never ship JavaScript to the browser.",
        durationMinutes: 12,
        content:
          '## The shift\n\nIn the App Router every component is a **server component** until you say otherwise. That inverts the old default: instead of shipping a bundle and fetching data from it, you render on the server and ship HTML.\n\n### What that buys you\n\n- Data fetching without an API layer in the middle. A server component can talk to the database or, as in this project, straight to Strapi.\n- Secrets stay on the server. An API token used in a server component is never in the browser bundle.\n- Less JavaScript. A page of text and images can ship almost none.\n\n### When you still need `"use client"`\n\nReach for it when the component needs browser state or events: a form with local validation, a dropdown, anything using `useState` or `onClick`. The rule of thumb is to push `"use client"` as far down the tree as you can, so the interactive leaf is a client component but its layout is not.',
      },
      {
        title: "Fetching data where it belongs",
        summary:
          "async components, request deduplication, and the cache you get for free.",
        durationMinutes: 15,
        content:
          '## An async component\n\n```tsx\nexport default async function CoursesPage() {\n  const courses = await getCourses();\n  return <CourseGrid courses={courses} />;\n}\n```\n\nThat is the whole pattern. No `useEffect`, no loading flag, no `isMounted` guard.\n\n### Deduplication\n\nIf three components in one render ask for the same URL, Next.js issues one request. That means you can fetch what a component needs *in that component* instead of threading props down from the page.\n\n### Choosing a caching mode\n\n- `cache: "force-cache"` — static content. The blog index.\n- `cache: "no-store"` — anything personalised. A student\'s progress must never be cached, or two learners could see each other\'s numbers.\n\nGetting this wrong is the most common bug in an App Router project, and it is always the same bug: caching a per-user response.',
      },
      {
        title: "Mutations with server actions",
        summary:
          "Replacing the API-route-plus-fetch dance with a function call.",
        durationMinutes: 14,
        content:
          '## The old shape\n\nWrite an API route, write a fetch, manage the loading state, revalidate by hand.\n\n## The new shape\n\n```tsx\n"use server";\n\nexport async function enroll(courseId: string) {\n  await api.post("/enrollments", { course: courseId });\n  revalidatePath("/my-courses");\n}\n```\n\nThe function runs on the server; the client only gets a reference to it. Which means the auth token it uses is never exposed.\n\n### Still validate\n\nA server action is a public endpoint wearing a friendly costume. Anyone can invoke it with any arguments. Every action in this course validates its input and re-checks permissions — the same discipline you would apply to a REST handler.',
      },
      {
        title: "Route protection and middleware",
        summary: "Where middleware helps, and where it is only cosmetic.",
        durationMinutes: 10,
        content:
          "## What middleware is good at\n\nRedirecting. If there is no session cookie, bounce `/my-courses` to `/login` before rendering anything. Fast, and it avoids a flash of empty page.\n\n## What middleware is not\n\nSecurity. Middleware runs in *your* frontend, and your frontend is code the user controls the client half of. Anyone can call your backend directly with `curl` and never touch middleware at all.\n\nSo treat middleware as UX and put the real check in the API. In this project every rule is enforced by a Strapi policy; the Next.js middleware only decides which page to show first.",
      },
    ],
    quizzes: [
      {
        title: "App Router fundamentals",
        description:
          "Six questions on server components, data fetching and where to enforce rules.",
        passingScore: 70,
        questions: [
          {
            text: "In the Next.js App Router, what is a component by default?",
            options: [
              "A client component",
              "A server component",
              "A static HTML file",
              "An API route",
            ],
            correctOptionIndex: 1,
            explanation:
              'Everything is a server component until a file is marked "use client".',
          },
          {
            text: "Which caching option should you use for a response that differs per signed-in user?",
            options: [
              'cache: "force-cache"',
              'cache: "no-store"',
              "next: { revalidate: 3600 }",
              "No option needed",
            ],
            correctOptionIndex: 1,
            explanation:
              "Caching a personalised response can serve one user's data to another.",
          },
          {
            text: 'What does `"use client"` at the top of a file mean?',
            options: [
              "The file only runs in the browser and never on the server",
              "The component and its imports are included in the browser bundle",
              "Data fetching is disabled in that file",
              "The file is excluded from the production build",
            ],
            correctOptionIndex: 1,
            explanation:
              "It marks the boundary where client JavaScript starts. The component still server-renders for the initial HTML.",
          },
          {
            text: "Why is Next.js middleware not sufficient for authorization?",
            options: [
              "It runs too slowly",
              "It cannot read cookies",
              "It only guards your own pages, not direct calls to the API",
              "It only works in development",
            ],
            correctOptionIndex: 2,
            explanation:
              "A request straight to the backend never passes through frontend middleware.",
          },
          {
            text: "What is the main benefit of fetching data inside a server component?",
            options: [
              "It makes the page render twice",
              "Credentials and queries stay on the server",
              "It removes the need for a database",
              "It disables caching automatically",
            ],
            correctOptionIndex: 1,
          },
          {
            text: "A server action is best described as:",
            options: [
              "A private function only your UI can call",
              "A public endpoint that must validate its own input",
              "A compile-time macro",
              "A replacement for the database layer",
            ],
            correctOptionIndex: 1,
            explanation:
              "It is reachable by anyone, so it needs the same checks as a REST handler.",
          },
        ],
      },
    ],
  },
  {
    ownerKey: "instructor",
    title: "TypeScript Fundamentals",
    summary:
      "Types that describe what your code actually does — inference, narrowing and generics.",
    description:
      "TypeScript rewards you for describing your data honestly. This course works through inference, union narrowing, and just enough generics to type a real API client, using examples from an LMS codebase rather than toy shapes.",
    category: "Languages",
    level: "beginner",
    status: "published",
    coverImageUrl:
      "https://images.unsplash.com/photo-1587620962725-abab7fe55159?auto=format&fit=crop&w=1200&q=80",
    lessons: [
      {
        title: "Let inference do the work",
        summary:
          "Most annotations you write are noise the compiler already knew.",
        durationMinutes: 9,
        content:
          "## Annotate boundaries, infer the middle\n\n```ts\n// Unnecessary — TypeScript knows.\nconst total: number = items.length;\n\n// Worth writing — this is a contract.\nfunction gradeQuiz(answers: Answer[]): QuizResult { ... }\n```\n\nAnnotate function parameters, return types on exported functions, and the shape of anything crossing a network boundary. Let inference handle locals.\n\n### The one exception\n\nEmpty arrays. `const ids = []` infers `any[]`, which silently disables checking for everything you push into it. Write `const ids: number[] = []`.",
      },
      {
        title: "Unions and narrowing",
        summary:
          "Making illegal states unrepresentable, then proving to the compiler you handled them.",
        durationMinutes: 13,
        content:
          '## Model the states, not the flags\n\n```ts\n// Four booleans, sixteen combinations, twelve of them nonsense.\ntype Bad = { loading: boolean; error: boolean; data?: Course };\n\n// Three states, all of them real.\ntype Good =\n  | { status: "loading" }\n  | { status: "error"; message: string }\n  | { status: "ready"; data: Course };\n```\n\nWith the second shape the compiler stops you reading `data` before checking `status`.\n\n### Narrowing\n\n`if`, `typeof`, `in`, and a discriminant field all narrow a union. A `switch` on the discriminant plus a `never`-typed default gives you an exhaustiveness check: add a fourth state and the code stops compiling until you handle it.',
      },
      {
        title: "Generics without the headache",
        summary: "One type parameter, one job: relate an input to an output.",
        durationMinutes: 11,
        content:
          '## The rule\n\nA generic is only worth it when a type parameter appears in *two* places — otherwise you have written `any` with extra steps.\n\n```ts\n// Useful: the return type follows from the argument.\nasync function get<T>(path: string): Promise<ApiResponse<T>> { ... }\n\nconst { data } = await get<Course[]>("/courses");\n// data is Course[], no cast\n```\n\n### Constraints\n\n`<T extends { id: number }>` says "any shape, as long as it has an id". That is usually all the constraint you need. If you find yourself writing four type parameters and a conditional type, stop and ask whether a plain union would do.',
      },
    ],
    quizzes: [
      {
        title: "Types and narrowing",
        description: "Four questions on inference, unions and generics.",
        passingScore: 75,
        questions: [
          {
            text: "What does `const ids = []` infer as?",
            options: ["number[]", "unknown[]", "any[]", "never[]"],
            correctOptionIndex: 2,
            explanation:
              "Which is why an explicit annotation matters for empty arrays.",
          },
          {
            text: "What is the advantage of a discriminated union over a bag of optional fields?",
            options: [
              "It compiles faster",
              "Impossible combinations cannot be represented",
              "It produces smaller JavaScript",
              "It removes the need for tests",
            ],
            correctOptionIndex: 1,
          },
          {
            text: "When is a generic type parameter genuinely useful?",
            options: [
              "Whenever a function takes an object",
              "When the parameter appears in more than one position, relating input to output",
              "Only in class declarations",
              "When you want to silence a type error",
            ],
            correctOptionIndex: 1,
          },
          {
            text: "Which of these narrows a union type?",
            options: [
              "A `typeof` check",
              "A comment",
              "A type assertion with `as`",
              "Renaming the variable",
            ],
            correctOptionIndex: 0,
            explanation:
              "`as` overrides the compiler rather than proving anything to it.",
          },
        ],
      },
    ],
  },
  {
    ownerKey: "instructor2",
    title: "Designing REST APIs with Strapi",
    summary:
      "Content types, custom controllers, and authorization that holds up to a direct curl request.",
    description:
      "Strapi gives you CRUD in minutes. Everything after that — ownership rules, computed fields, endpoints that do not leak — is design work. This course covers the parts a headless CMS does not do for you, with authorization as the spine.",
    category: "Backend",
    level: "intermediate",
    status: "published",
    coverImageUrl:
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80",
    lessons: [
      {
        title: "Content types are a schema, not a UI",
        summary: "Modelling relations so your queries stay cheap.",
        durationMinutes: 12,
        content:
          "## Think in tables\n\nA content type is a table. A relation is a foreign key or a join table. The admin panel is a convenience on top of that, not the thing itself.\n\n### Denormalise deliberately\n\nIn this LMS a `lesson-progress` row stores `course` as well as `lesson`, even though the lesson already knows its course. That is a deliberate duplication: counting a student's completions in a course becomes one indexed lookup instead of a join through lessons.\n\nDuplicate data when you can name the query it makes cheap — and write down why, because the next reader will assume it was an accident.",
      },
      {
        title: "Policies versus controller checks",
        summary: "Role rules belong in policies; ownership rules need the row.",
        durationMinutes: 14,
        content:
          '## Two different questions\n\n**"Can this role call this endpoint?"** is answerable before any data is loaded. That is a policy: it runs first, and it is cheap.\n\n**"Is this row theirs?"** requires loading the row. That has to happen where the row is available.\n\n### Do not write the rule twice\n\nThe temptation is to check ownership in the policy *and* in the controller. Then the two copies drift and one of them is wrong. Put the rule in one function, and have both call it.\n\n```ts\nexport function assertCourseWriteAccess(user, course) {\n  if (isPrivileged(user)) return;\n  if (isInstructor(user) && course.owner?.id === user.id) return;\n  throw new ForbiddenError();\n}\n```\n\nOne definition of "yours", used everywhere.',
      },
      {
        title: "Endpoints that do not leak",
        summary: "The default response is usually too generous.",
        durationMinutes: 11,
        content:
          '## The quiz problem\n\n`GET /api/quizzes/1` on a stock install returns the questions *and* which answer is correct. The frontend "just does not render it" — and the student opens devtools.\n\nThe fix is to shape the response on the server, per role:\n\n```ts\nctx.body = isAuthor ? quizWithAnswers(quiz) : quizForStudent(quiz);\n```\n\n### Build responses from an allow-list\n\nName the fields you want rather than deleting the ones you do not. Add a column later and it stays out of the API until you decide otherwise — the failure mode is a missing field, not a leaked one.',
      },
    ],
    quizzes: [
      {
        title: "Authorization design",
        description: "Five questions on where each kind of rule belongs.",
        passingScore: 70,
        questions: [
          {
            text: "Which check belongs in a route policy rather than a controller?",
            options: [
              '"Is this course owned by the caller?"',
              '"Does this role have any access to this endpoint?"',
              '"Is the submitted score correct?"',
              '"Has this student completed lesson 4?"',
            ],
            correctOptionIndex: 1,
            explanation:
              "Role-only rules need no data, so they can run before anything is loaded.",
          },
          {
            text: "Why should a quiz response omit `correctOptionIndex` for students?",
            options: [
              "It makes the payload smaller",
              "The frontend cannot parse it",
              "Anyone can read the network response, so hiding it in the UI hides nothing",
              "Strapi forbids sending integers",
            ],
            correctOptionIndex: 2,
          },
          {
            text: "Where should a quiz score be calculated?",
            options: [
              "In the browser, then sent to the server",
              "On the server, from the stored answer key",
              "In the database as a generated column",
              "Either, as long as they agree",
            ],
            correctOptionIndex: 1,
          },
          {
            text: "What is the risk of duplicating an ownership rule in both a policy and a controller?",
            options: [
              "It doubles the number of database queries",
              "The two copies drift apart and one becomes wrong",
              "Strapi rejects duplicate checks",
              "There is no risk",
            ],
            correctOptionIndex: 1,
          },
          {
            text: "Building a response from an allow-list of fields protects against:",
            options: [
              "Slow queries",
              "A newly added column leaking into the API",
              "Invalid JSON",
              "Expired tokens",
            ],
            correctOptionIndex: 1,
          },
        ],
      },
    ],
  },
  {
    ownerKey: "instructor",
    title: "Advanced PostgreSQL Performance",
    summary:
      "Reading query plans, choosing indexes, and finding the query that is actually slow.",
    description:
      "Still being written — this course is intentionally left in draft so the draft/published rule can be demonstrated: a student cannot see it in the catalogue and gets a 404 on the direct URL, while its owner sees it in their dashboard.",
    category: "Databases",
    level: "advanced",
    status: "draft",
    coverImageUrl:
      "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=1200&q=80",
    lessons: [
      {
        title: "Reading EXPLAIN ANALYZE",
        summary: "What the numbers in a query plan actually mean.",
        durationMinutes: 16,
        content:
          "## Start at the bottom\n\nA plan is a tree and it executes leaves-first. Read from the innermost node outwards.\n\nThe number that matters is `actual time`, and the number that catches bugs is the gap between `rows` estimated and `rows` returned. A planner that expects 10 rows and gets 100,000 has chosen the wrong strategy, and the fix is usually statistics, not a hint.",
      },
      {
        title: "Indexes that get used",
        summary:
          "Column order, selectivity, and why your index is being ignored.",
        durationMinutes: 14,
        content:
          "## Leftmost prefix\n\nA composite index on `(student_id, course_id)` serves a query filtering on `student_id`, and a query filtering on both. It does *not* serve one filtering only on `course_id`.\n\nSo order the columns by how you query them, most-selective and always-present first.",
      },
    ],
    quizzes: [],
  },
];

type SeedPost = {
  authorKey: string;
  title: string;
  excerpt: string;
  body: string;
  tags: string;
  readingMinutes: number;
  status: "draft" | "published";
  coverImageUrl: string;
};

const POSTS: SeedPost[] = [
  {
    authorKey: "manager",
    title: "What we look for in a junior engineer",
    excerpt:
      'Less "knows every framework", more "can explain the decision they made and why the alternative was worse".',
    tags: "hiring, careers",
    readingMinutes: 5,
    status: "published",
    coverImageUrl:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80",
    body: '## It is not the stack\n\nWe have hired people who had never touched our framework and turned down people who knew it well. The difference was almost always the same thing: whether they could explain their own code.\n\n### What that sounds like in practice\n\n> "I put the ownership check in one function because I had it in two places and they drifted. The policy and the controller now call the same helper."\n\nThat is a junior engineer describing a bug they caused, the fix, and the reason. It tells us more than a perfect answer to a trivia question.\n\n### Three things that stand out\n\n1. **Deliberate scope.** Knowing what you deliberately did not build is a sign you thought about the shape of the problem.\n2. **Honest trade-offs.** "I denormalised this column and here is the query it makes cheap" beats "I followed best practice".\n3. **Working software.** A small thing that runs beats a large thing that almost does.\n\n### And one that does not\n\nA project you cannot walk through. If the explanation stops at "it works", the code is not really yours yet.',
  },
  {
    authorKey: "admin",
    title: "Enforce permissions on the server, not in the UI",
    excerpt:
      "Hiding a button is a design decision. Rejecting a request is a security decision. They are not substitutes.",
    tags: "security, architecture",
    readingMinutes: 6,
    status: "published",
    coverImageUrl:
      "https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=1200&q=80",
    body: '## The bug that keeps reappearing\n\nA dashboard hides the "Delete course" button unless you are an admin. The endpoint behind it checks nothing. One `curl` and any signed-in user can delete any course.\n\nThis is not an exotic failure. It is the most common authorization bug in application code, and it comes from treating the UI as the boundary.\n\n## Two layers, two questions\n\n**Coarse: can this role reach this endpoint at all?** Answerable with no data loaded, so it belongs before the handler runs — a policy or a permission row.\n\n**Row-level: is this particular record theirs?** Requires the record, so it happens in the handler.\n\nYou need both. The first without the second lets an instructor edit a colleague\'s course. The second without the first means every request pays for a database read before being told no.\n\n## Write the rule once\n\nIf "yours" is defined in a policy and again in a controller, the two definitions will disagree eventually, and the disagreement will be a vulnerability. One function, called from both.\n\n## Test it the way an attacker would\n\nNot by clicking. Take a student\'s token and call the admin endpoint directly:\n\n```bash\ncurl -H "Authorization: Bearer $STUDENT_TOKEN" \\\n  http://localhost:1337/api/admin/users\n```\n\nIf that returns anything other than 403, the UI was doing the work.',
  },
  {
    authorKey: "manager",
    title: "Progress tracking: store facts, derive numbers",
    excerpt:
      'Every "percentage out of sync" bug we have seen came from storing the percentage. So do not store it.',
    tags: "engineering, data-modelling",
    readingMinutes: 4,
    status: "published",
    coverImageUrl:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
    body: "## The tempting design\n\nAdd `progressPercent` to the enrollment row. Update it when a lesson is completed. Fast to read, easy to explain.\n\nThen an instructor adds a lesson to the course, and three hundred students are suddenly showing 100% on a course they have not finished. Nothing updated their stored number, because nothing knew to.\n\n## The alternative\n\nStore only facts:\n\n> student 4 completed lesson 11 at 14:32\n\nAnd compute the percentage on read: completed rows over lessons that currently exist.\n\nNow adding a lesson lowers everyone's percentage automatically. Deleting one raises it. There is no stored value to be stale, because there is no stored value.\n\n## The cost\n\nTwo queries per read instead of one. On a dashboard showing twelve courses that is twenty-four cheap indexed counts — measurable, but nowhere near the cost of a support ticket saying the numbers are wrong.\n\nCache it later if you need to, from a computation you know is correct. That is a much better position than trying to repair a stored number nobody trusts.",
  },
  {
    authorKey: "manager",
    title: "Course roadmap: what we are building next",
    excerpt:
      "An unpublished draft — visible to its author and to admins, invisible to everyone else.",
    tags: "announcements",
    readingMinutes: 2,
    status: "draft",
    coverImageUrl:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80",
    body: '## Draft\n\nThis post exists to demonstrate the draft/published rule. It is listed in the admin blog table with a "Draft" badge, and it is absent from `/blog` and returns 404 on its direct URL for anyone who cannot edit it.\n\nPlanned for next quarter:\n\n- Testing with Playwright\n- Docker for local development\n- Reading and writing SQL migrations',
  },
];

/** Creates a user if the email is free, and returns it either way. */
async function ensureUser(
  strapi: any,
  seed: SeedUser,
  roleIdByType: Record<string, number>,
) {
  const existing = await strapi.db
    .query(USER_UID)
    .findOne({ where: { email: seed.email } });
  if (existing) return existing;

  // `user.add` goes through the Document Service, which hashes `password` attributes.
  // Building the row with `strapi.db.query` directly would store the password in
  // plain text and the account would never be able to sign in.
  return strapi
    .plugin("users-permissions")
    .service("user")
    .add({
      username: seed.username,
      email: seed.email,
      password: DEMO_PASSWORD,
      fullName: seed.fullName,
      mobileNumber: seed.mobileNumber,
      bio: seed.bio ?? null,
      provider: "local",
      confirmed: true,
      blocked: false,
      role: roleIdByType[seed.role],
    });
}

export async function seedDemoData(strapi: any) {
  if (process.env.SEED_DEMO_DATA === "false") {
    strapi.log.info("[seed] SEED_DEMO_DATA=false — skipping demo data");
    return;
  }

  // The guard: any existing course means this is a real database, so leave it alone.
  const existingCourses = await strapi.db.query(COURSE_UID).count();
  if (existingCourses > 0) return;

  strapi.log.info(
    "[seed] empty database detected — creating demo accounts and content",
  );

  const roles = await strapi.db.query(ROLE_UID).findMany({
    where: { type: { $in: Object.values(ROLES) } },
  });
  const roleIdByType: Record<string, number> = {};
  for (const role of roles) {
    roleIdByType[role.type] = role.id;
  }

  // ---- accounts -----------------------------------------------------------
  const users: Record<string, any> = {};
  for (const seed of USERS) {
    users[seed.key] = await ensureUser(strapi, seed, roleIdByType);
  }

  // ---- courses, lessons, quizzes ------------------------------------------
  const createdCourses: Record<string, any> = {};

  for (const seed of COURSES) {
    const owner = users[seed.ownerKey];

    const course = await strapi.documents(COURSE_UID).create({
      data: {
        title: seed.title,
        slug: slugify(seed.title),
        summary: seed.summary,
        description: seed.description,
        category: seed.category,
        level: seed.level,
        status: seed.status,
        coverImageUrl: seed.coverImageUrl,
        // Total course length is the sum of its lessons rather than a number someone
        // typed, so it cannot disagree with the content.
        durationMinutes: seed.lessons.reduce(
          (sum, lesson) => sum + lesson.durationMinutes,
          0,
        ),
        publishedAt: seed.status === "published" ? new Date() : null,
        owner: owner.id,
      },
    });

    createdCourses[seed.title] = course;

    let order = 1;
    for (const lesson of seed.lessons) {
      await strapi.documents(LESSON_UID).create({
        data: {
          title: lesson.title,
          summary: lesson.summary,
          content: lesson.content,
          durationMinutes: lesson.durationMinutes,
          order,
          course: course.id,
        },
      });
      order += 1;
    }

    for (const quiz of seed.quizzes) {
      await strapi.documents(QUIZ_UID).create({
        data: {
          title: quiz.title,
          description: quiz.description,
          passingScore: quiz.passingScore,
          course: course.id,
          questions: quiz.questions.map((question) => ({
            text: question.text,
            options: question.options.map((text) => ({ text })),
            correctOptionIndex: question.correctOptionIndex,
            explanation: question.explanation ?? null,
          })),
        },
      });
    }
  }

  // ---- blog ---------------------------------------------------------------
  for (const post of POSTS) {
    await strapi.documents(BLOG_POST_UID).create({
      data: {
        title: post.title,
        slug: slugify(post.title),
        excerpt: post.excerpt,
        body: post.body,
        tags: post.tags,
        readingMinutes: post.readingMinutes,
        status: post.status,
        publishedDate: post.status === "published" ? new Date() : null,
        coverImageUrl: post.coverImageUrl,
        author: users[post.authorKey].id,
      },
    });
  }

  // ---- enrolments and a part-finished course ------------------------------
  // Tom is two lessons into React and has sat the quiz once; Lena has just started.
  // That gives the dashboard a non-zero, non-complete progress bar to render, which
  // is the only way to tell a working progress feature from a hard-coded 0%.
  const reactCourse = createdCourses["Modern React with Next.js 15"];
  const tsCourse = createdCourses["TypeScript Fundamentals"];

  await enrol(strapi, users.student, reactCourse, 2);
  await enrol(strapi, users.student, tsCourse, 0);
  await enrol(strapi, users.student2, reactCourse, 4);

  await recordQuizAttempt(strapi, users.student, reactCourse);

  strapi.log.info(
    `[seed] done: ${USERS.length} accounts, ${COURSES.length} courses, ${POSTS.length} posts. Demo password: ${DEMO_PASSWORD}`,
  );
}

/** Enrols a student and marks the first `completedLessons` lessons done. */
async function enrol(
  strapi: any,
  student: any,
  course: any,
  completedLessons: number,
) {
  if (!course) return;

  const enrollment = await strapi.documents(ENROLLMENT_UID).create({
    data: { student: student.id, course: course.id, enrolledAt: new Date() },
  });

  if (completedLessons <= 0) return;

  const lessons = await strapi.db.query(LESSON_UID).findMany({
    where: { course: course.id },
    orderBy: [{ order: "asc" }],
    limit: completedLessons,
  });

  for (const lesson of lessons) {
    await strapi.documents(LESSON_PROGRESS_UID).create({
      data: {
        student: student.id,
        lesson: lesson.id,
        course: course.id,
        completed: true,
        completedAt: new Date(),
      },
    });
  }

  // Mirror what the progress endpoint would have done had these been real clicks.
  const totalLessons = await strapi.db
    .query(LESSON_UID)
    .count({ where: { course: course.id } });
  if (totalLessons > 0 && lessons.length === totalLessons) {
    await strapi.documents(ENROLLMENT_UID).update({
      documentId: enrollment.documentId,
      data: { completedAt: new Date() },
    });
  }
}

/**
 * Records one graded attempt, using the same rules the live grader uses.
 *
 * The seeded answers get question 1 wrong on purpose — an attempt history where
 * everything is 100% would not show that grading actually compares anything.
 */
async function recordQuizAttempt(strapi: any, student: any, course: any) {
  if (!course) return;

  const quiz = await strapi.db.query(QUIZ_UID).findOne({
    where: { course: course.id },
    populate: { questions: { populate: ["options"] } },
  });

  if (!quiz?.questions?.length) return;

  const answers = quiz.questions.map((question: any, index: number) => ({
    questionIndex: index,
    // Deliberately wrong on the first question, correct on the rest.
    selectedOptionIndex:
      index === 0
        ? (Number(question.correctOptionIndex ?? 0) + 1) %
          (question.options?.length || 1)
        : Number(question.correctOptionIndex ?? 0),
  }));

  const correctCount = answers.filter(
    (answer: any, index: number) =>
      answer.selectedOptionIndex ===
      Number(quiz.questions[index].correctOptionIndex ?? 0),
  ).length;

  const score = Math.round((correctCount / quiz.questions.length) * 100);

  await strapi.documents(QUIZ_ATTEMPT_UID).create({
    data: {
      student: student.id,
      quiz: quiz.id,
      course: course.id,
      answers,
      score,
      correctCount,
      totalQuestions: quiz.questions.length,
      passed: score >= (quiz.passingScore ?? 70),
      submittedAt: new Date(),
    },
  });
}

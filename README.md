# CPS Academy LMS

CPS Academy LMS is a role-based Learning Management System built for the Junior Software Engineer project round.

Students can enrol in courses, complete lessons, track progress, and take auto-graded quizzes. Instructors and Content Managers can build course content, while Admins manage the platform and user roles.

## Live Deployment

| Service | URL |
| --- | --- |
| Frontend | [https://lms-nine-pink.vercel.app](https://lms-nine-pink.vercel.app) |
| Strapi Admin | [https://lms-production-d729.up.railway.app/admin](https://lms-production-d729.up.railway.app/admin) |
| Courses API | [https://lms-production-d729.up.railway.app/api/courses](https://lms-production-d729.up.railway.app/api/courses) |

The frontend is deployed on Vercel and the Strapi backend is deployed on Railway with PostgreSQL.

## Demo Accounts

The development seed creates the following accounts. The password for every account is `Password123!`.

| Role | Email | Username |
| --- | --- | --- |
| Admin | `admin@lms.dev` | `amara.admin` |
| Content Manager | `manager@lms.dev` | `diego.manager` |
| Instructor | `instructor@lms.dev` | `priya.instructor` |
| Instructor 2 | `instructor2@lms.dev` | `kwame.instructor` |
| Student | `student@lms.dev` | `tom.student` |
| Student 2 | `student2@lms.dev` | `lena.student` |

Use the LMS login page for these accounts. The Strapi Admin account at `/admin` is a separate account used only to manage the CMS.

## Role Permissions

| Capability | Admin | Content Manager | Instructor | Student |
| --- | :---: | :---: | :---: | :---: |
| Manage users and roles | Yes | No | No | No |
| Create, edit, and delete any course | Yes | Yes | Own only | No |
| Add, edit, and delete lessons | Yes | Yes | Own courses | No |
| Create and manage quizzes | Yes | Yes | Own courses | No |
| View student progress | Yes | Yes | Own courses | Own only |
| Write and manage blog posts | Yes | Yes | No | No |
| Enrol in courses | No | No | No | Yes |
| Take quizzes | No | No | No | Yes |

Permissions are enforced in two layers:

- Next.js middleware and server-side route guards provide fast navigation redirects.
- Strapi policies and controllers enforce the actual authorization, ownership, enrollment, and role rules. Direct API requests do not bypass these checks.

## Features

### Authentication

- Sign up and sign in using email or username.
- New signups receive the Student role.
- JWTs are stored in an `httpOnly` cookie by the Next.js server.
- Role information is loaded from the backend rather than trusted from the browser.
- Protected routes redirect users to the appropriate login or dashboard destination.

### Course Management

- Public course catalogue with search, category, and level filters.
- Course detail pages with descriptions, cover images, instructor information, lesson lists, and enrollment controls.
- Admins and Content Managers can manage all courses.
- Instructors can manage only courses they own.
- Course owners can create, edit, publish, unpublish, and delete lessons.
- Draft courses are hidden from public users and students.

### Enrollment and Progress

- Students can enrol in published courses.
- Enrolled courses appear under **My courses**.
- Enrolled students can open lessons in the learning workspace.
- Lessons can be marked complete or incomplete.
- Progress is calculated from completed lesson rows divided by total lessons.
- Progress persists across refreshes and devices because it is stored in the backend database.
- The percentage is derived rather than stored, so it remains accurate when lessons are added or removed.

### Quizzes

- Instructors, Content Managers, and Admins can create quizzes with multiple-choice questions.
- Correct answers are stored server-side and are not included in student quiz responses.
- Students can submit quiz attempts only for courses they are enrolled in.
- Scores are calculated by the Strapi controller from the stored answer key.
- Quiz results include score, correct answers, pass status, and feedback breakdown.
- Previous attempts can be reviewed from **My results**.

### Blog

- Anyone can read published posts at `/blog`.
- Public article pages are available at `/blog/[slug]`.
- Content Managers can write and manage their posts.
- Admins can manage every post.
- Posts support draft and published states.
- Draft posts are not exposed to public readers.

### Admin Panel

- Platform statistics for users, courses, enrollments, quizzes, and blog content.
- User list with role changes, block/unblock controls, and deletion.
- All-course overview, including drafts.
- Full blog-post overview and editing access.
- Admin-only access is enforced by both the frontend and backend.

## Routes

### Public and Authentication

| Route | Purpose |
| --- | --- |
| `/` | Public landing page |
| `/courses` | Published course catalogue |
| `/courses/[id]` | Course details and enrollment |
| `/blog` | Published blog posts |
| `/blog/[slug]` | Published blog article |
| `/login` | Sign in |
| `/signup` | Create a Student account |

### Student

| Route | Purpose |
| --- | --- |
| `/my-courses` | Enrolled courses and progress |
| `/my-courses/[id]` | Course learning workspace |
| `/my-courses/[id]/lessons/[lessonId]` | Lesson viewer and completion |
| `/my-courses/[id]/quiz/[quizId]` | Quiz attempt and result |
| `/results` | Quiz attempt history |

### Instructor and Content Manager

| Route | Purpose |
| --- | --- |
| `/manage/courses` | Owned or manageable courses |
| `/manage/courses/new` | Create a course |
| `/manage/courses/[id]` | Edit course, lessons, and quizzes |
| `/manage/courses/[id]/lessons/new` | Add a lesson |
| `/manage/courses/[id]/lessons/[lessonId]` | Edit a lesson |
| `/manage/courses/[id]/quiz/new` | Add a quiz |
| `/manage/courses/[id]/quiz/[quizId]` | Edit a quiz |
| `/manage/blog` | Manage blog posts, Content Manager/Admin only |
| `/manage/blog/new` | Create a blog post |
| `/manage/blog/[id]` | Edit a blog post |

### Admin

| Route | Purpose |
| --- | --- |
| `/admin` | Platform statistics |
| `/admin/users` | User and role management |
| `/admin/courses` | All courses, including drafts |
| `/admin/blog` | All blog posts |

## Technology Stack

| Layer | Technology | Hosting |
| --- | --- | --- |
| Frontend | Next.js 15, React 19, TypeScript | Vercel |
| Styling | Tailwind CSS v4 | Vercel |
| Icons | Lucide React | Vercel |
| Backend/CMS | Strapi 5, TypeScript | Railway |
| Database | PostgreSQL | Railway |
| Authentication | Strapi JWT with Next.js `httpOnly` cookie | Vercel/Railway |

## Project Structure

```text
lms-project/
├── backend/
│   ├── config/                 # Strapi server, database, CORS, and plugin config
│   ├── database/               # Database migrations
│   ├── public/uploads/         # Local upload directory
│   └── src/
│       ├── api/                # Courses, lessons, quizzes, blog, enrollment, admin APIs
│       ├── bootstrap/          # Role/permission sync and demo data seed
│       ├── policies/            # Backend authorization policies
│       └── utils/               # Authorization, serialization, progress, and roles
├── frontend/
│   ├── src/app/                # Next.js App Router pages and route groups
│   ├── src/components/         # Layout, course, quiz, auth, admin, and UI components
│   └── src/lib/                # API client, session helpers, roles, and server actions
├── README.md
└── .gitignore
```

## Local Setup

### Requirements

- Node.js 20 or newer
- npm
- PostgreSQL, or a local SQLite setup supported by Strapi

### Backend

Copy the example environment file:

```bash
cd backend
cp .env.example .env
```

For local PostgreSQL, configure `backend/.env` with database credentials and secure values for `APP_KEYS`, `JWT_SECRET`, `ADMIN_JWT_SECRET`, `API_TOKEN_SALT`, `TRANSFER_TOKEN_SALT`, and `ENCRYPTION_KEY`.

Install and start Strapi:

```bash
npm install
npm run develop
```

The backend runs at `http://localhost:1337` and the Strapi Admin panel runs at `http://localhost:1337/admin`.

On a fresh database, bootstrap creates the application roles, synchronizes permissions, and seeds demo users, courses, lessons, quizzes, and blog posts.

### Frontend

In a second terminal:

```bash
cd frontend
cp .env.example .env.local
```

Set:

```env
STRAPI_URL=http://localhost:1337
```

Install and start Next.js:

```bash
npm install
npm run dev
```

The frontend runs at `http://localhost:3000`.

## Validation Commands

Run these from `frontend`:

```bash
npm run typecheck
npm run lint
npm run build
```

Run these from `backend`:

```bash
npm run typecheck
npm run build
```

## Deployment

### Railway Backend

Create a Railway project with PostgreSQL and a backend service connected to this repository. Set the backend service root directory to `backend`, with `npm run build` as the build command and `npm run start` as the start command.

Required production variables include:

```env
NODE_ENV=production
HOST=0.0.0.0
PORT=1337
DATABASE_CLIENT=postgres
DATABASE_URL=${{Postgres.DATABASE_URL}}
PUBLIC_URL=https://lms-production-d729.up.railway.app
IS_PROXIED=true
FRONTEND_URLS=https://lms-nine-pink.vercel.app,http://localhost:3000
SEED_DEMO_DATA=true
APP_KEYS=<four comma-separated secure values>
JWT_SECRET=<secure value>
ADMIN_JWT_SECRET=<secure value>
API_TOKEN_SALT=<secure value>
TRANSFER_TOKEN_SALT=<secure value>
ENCRYPTION_KEY=<secure value>
```

`PUBLIC_URL` is the base Railway URL. Do not append `/admin` or `/api` to it.

### Vercel Frontend

Import the repository into Vercel and set the root directory to `frontend`. Use `npm install` and `npm run build` with the default Next.js output settings.

Add:

```env
STRAPI_URL=https://lms-production-d729.up.railway.app
```

Do not include `/admin` or `/api` in `STRAPI_URL`.

## End-to-End Test Flow

### Student

1. Sign in as `student@lms.dev`.
2. Open `/courses` and enrol in a published course.
3. Open `/my-courses`, then open a lesson.
4. Mark the lesson complete and refresh to verify persistence.
5. Take the course quiz and verify the score and feedback.
6. Open `/results` and verify the attempt is stored.

### Instructor

1. Sign in as `instructor@lms.dev`.
2. Create and publish a course from `/manage/courses`.
3. Add lessons and a quiz.
4. Open another instructor's course and confirm the edit form is not shown.
5. Confirm `/manage/blog` is inaccessible to instructors.

### Content Manager

1. Sign in as `manager@lms.dev`.
2. Create and manage courses.
3. Create a blog draft at `/manage/blog/new`.
4. Publish the post and confirm it appears at `/blog`.
5. Confirm `/admin/users` is inaccessible.

### Admin

1. Sign in as `admin@lms.dev`.
2. Open `/admin` and verify platform statistics.
3. Open `/admin/users` and change a user's role.
4. Open `/admin/courses` and verify drafts are visible.
5. Open `/admin/blog` and verify posts from all authors are visible.

## Important Security Decisions

- Frontend visibility is for usability; Strapi policies are the real authorization boundary.
- Course ownership and enrollment are checked on the backend.
- Quiz answer keys are stripped from student responses.
- Quiz scores and progress percentages are calculated server-side.
- JWTs are stored in an `httpOnly` cookie rather than localStorage.
- API serializers use allow-lists to avoid exposing sensitive database fields.

## Known Limitations

- Railway's local upload filesystem is ephemeral. Uploaded files can disappear after a restart or redeploy. Persistent production uploads should use S3, Cloudinary, or another object-storage provider.
- Demo data is intended for evaluation. Set `SEED_DEMO_DATA=false` for a real production environment after initial setup.
- The deployed Vercel frontend and Railway API must remain active for evaluation.

## Video Walkthrough

The assignment requires a screen recording of up to ten minutes covering the student flow, authoring flow, admin role management, frontend-to-Strapi data flow, backend authorization, progress calculation, quiz auto-grading, and Vercel/Railway deployment configuration.

Add the final Google Drive or unlisted YouTube link to the submission form.

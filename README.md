# LumaLearn LMS

A Next.js 15 App Router frontend backed by Strapi 5 and PostgreSQL.

## Setup

1. Copy `frontend/.env.example` to `frontend/.env.local` and set `STRAPI_URL`.
2. Configure PostgreSQL variables for Strapi in `backend/.env`.
3. From `backend`, run `npm install` and `npm run develop`.
4. From `frontend`, run `npm install` and `npm run dev`.
5. In Strapi admin, create the `admin`, `content_manager`, `instructor`, and `student` roles and assign route permissions.

The JWT is stored in an httpOnly cookie. Middleware provides navigation protection, while Strapi policies enforce authorization on the backend. Quiz scores and lesson percentages are computed server-side.

## Feature checklist

- Auth: login/register proxy routes and protected paths
- Courses, lessons, enrollment, progress, quizzes, and attempts
- Admin aggregate stats and user role management surface
- Blog posts with draft/published status
- Owner, enrollment, self, and admin policies

"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const API_URL = process.env.STRAPI_URL || "http://localhost:1337";
async function request(path: string, method: string, body?: unknown) {
  const token = (await cookies()).get("strapi_jwt")?.value;
  const response = await fetch(`${API_URL}${path}`, { method, headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: body ? JSON.stringify(body) : undefined, cache: "no-store" });
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
  return response.json();
}

export async function enroll(courseId: number) { await request("/api/enrollments", "POST", { courseId }); redirect("/my-courses"); }
export async function completeLesson(lessonId: number, courseId: number) { await request(`/api/lesson-progress/${lessonId}/complete`, "POST"); redirect(`/courses/${courseId}`); }
export async function submitQuiz(quizId: number, answers: number[]) { return request("/api/quiz-attempts", "POST", { quizId, answers }); }

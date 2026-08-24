const API_URL = process.env.STRAPI_URL || "http://localhost:1337";

export async function strapiFetch<T>(path: string, init: RequestInit = {}) {
  const response = await fetch(`${API_URL}${path}`, { ...init, headers: { "Content-Type": "application/json", ...init.headers }, cache: "no-store" });
  if (!response.ok) throw new Error(`Strapi request failed: ${response.status}`);
  return response.json() as Promise<T>;
}

export type Course = { id: number; title: string; description?: string; lessons?: { id: number; title: string; order: number }[] };
export type BlogPost = { id: number; title: string; body: string; coverImageUrl?: string; status: "draft" | "published" };

/**
 * The Strapi client. Server-side only.
 *
 * Two decisions shape this file.
 *
 * **1. The token never reaches the browser.** It is stored in an httpOnly cookie,
 * read here with `next/headers`, and attached to a `fetch` that runs on the server.
 * The alternative — localStorage plus a client-side fetch — puts a long-lived
 * credential somewhere any injected script can read it, and means the API URL and
 * every request are inspectable in the network tab. So: no `NEXT_PUBLIC_` API URL,
 * no `Authorization` header ever constructed in client code, and `import "server-only"`
 * to make a mistake a build error rather than a leak.
 *
 * **2. HTTP status is data, not an exception.** `apiFetch` returns a discriminated
 * result rather than throwing, because 403 is a *normal outcome* in an app whose
 * whole point is role enforcement. A page that asks for a course it turns out not
 * to own should render "you don't have access", and a try/catch around every call
 * to distinguish that from a real network failure gets unreadable fast. Callers
 * that genuinely cannot continue use the `mustFetch` wrapper, which throws.
 */
import "server-only";

import { cookies } from "next/headers";

import type { ApiItem, ApiList, SessionUser } from "./types";

/**
 * Server-side only, so no `NEXT_PUBLIC_` prefix.
 *
 * On Vercel this is set to the Railway URL; locally it defaults to the dev server.
 */
const API_URL = (process.env.STRAPI_URL ?? "http://localhost:1337").replace(/\/$/, "");

export const SESSION_COOKIE = "lms_token";

export type ApiResult<T> =
  | { ok: true; status: number; data: T }
  | { ok: false; status: number; error: string };

/** Strapi's error envelope: `{ error: { status, name, message } }`. */
function extractMessage(payload: unknown, status: number): string {
  if (payload && typeof payload === "object") {
    const error = (payload as { error?: { message?: string } }).error;
    if (error?.message) return error.message;
  }
  if (status === 401) return "You need to sign in to do that.";
  if (status === 403) return "You do not have permission to do that.";
  if (status === 404) return "Not found.";
  return `Request failed (${status}).`;
}

export async function getToken(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value;
}

type FetchOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  /** Skip the Authorization header even when a token exists (public reads). */
  anonymous?: boolean;
  /**
   * Seconds to cache. Default is no caching at all: almost every response here
   * varies by who is asking, and a cached "my courses" served to the next visitor
   * would be a data leak, not a slow page. Only genuinely public, identical-for-
   * everyone reads (the blog) pass a revalidate value.
   */
  revalidate?: number;
};

export async function apiFetch<T>(
  path: string,
  options: FetchOptions = {},
): Promise<ApiResult<T>> {
  const { method = "GET", body, anonymous = false, revalidate } = options;

  const headers: Record<string, string> = { "Content-Type": "application/json" };

  if (!anonymous) {
    const token = await getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      ...(revalidate === undefined
        ? { cache: "no-store" as const }
        : { next: { revalidate } }),
    });
  } catch {
    // The API being unreachable is a different failure from the API saying no, and
    // the UI should be able to tell the user which one happened.
    return {
      ok: false,
      status: 0,
      error: "Could not reach the API. Is the Strapi server running?",
    };
  }

  // 204 has no body to parse.
  if (response.status === 204) {
    return { ok: true, status: 204, data: undefined as T };
  }

  const text = await response.text();
  let payload: unknown = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = null;
    }
  }

  if (!response.ok) {
    return { ok: false, status: response.status, error: extractMessage(payload, response.status) };
  }

  return { ok: true, status: response.status, data: payload as T };
}

/**
 * For calls a page cannot render without. Throws, so the nearest error boundary
 * takes over instead of the page rendering something half-empty and confusing.
 */
export async function mustFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const result = await apiFetch<T>(path, options);
  if (!result.ok) throw new Error(result.error);
  return result.data;
}

/** `{ data: [...] }` unwrapped, with `[]` instead of an error. */
export async function fetchList<T>(path: string, options: FetchOptions = {}): Promise<T[]> {
  const result = await apiFetch<ApiList<T>>(path, options);
  return result.ok ? (result.data?.data ?? []) : [];
}

/** `{ data: {...} }` unwrapped, with `null` instead of an error. */
export async function fetchItem<T>(path: string, options: FetchOptions = {}): Promise<T | null> {
  const result = await apiFetch<ApiItem<T>>(path, options);
  return result.ok ? (result.data?.data ?? null) : null;
}

/** Like `fetchList` but keeps `meta`, which several screens need for totals. */
export async function fetchListWithMeta<T>(
  path: string,
  options: FetchOptions = {},
): Promise<{ data: T[]; meta: Record<string, unknown> }> {
  const result = await apiFetch<ApiList<T>>(path, options);
  if (!result.ok) return { data: [], meta: {} };
  return { data: result.data?.data ?? [], meta: result.data?.meta ?? {} };
}

/**
 * The current user, or null.
 *
 * Hits our own `GET /api/me` rather than the plugin's `/api/users/me`, which
 * sanitizes the `role` relation out of its response and so reports `role: null`
 * for everybody. The role is the one field every layout decision depends on.
 */
export async function getSession(): Promise<SessionUser | null> {
  const token = await getToken();
  if (!token) return null;

  const result = await apiFetch<ApiItem<SessionUser>>("/api/me");
  // A 401 here means the cookie is stale — the account was deleted or blocked, or
  // the JWT secret rotated. Treating it as "signed out" lets the user recover by
  // signing in again instead of seeing an error page.
  if (!result.ok) return null;

  return result.data?.data ?? null;
}

/** Exchange credentials for a JWT. Used by the login and signup server actions. */
export async function authenticate(
  identifier: string,
  password: string,
): Promise<ApiResult<{ jwt: string }>> {
  return apiFetch<{ jwt: string }>("/api/auth/local", {
    method: "POST",
    anonymous: true,
    body: { identifier, password },
  });
}

export async function registerAccount(input: {
  username: string;
  email: string;
  password: string;
}): Promise<ApiResult<{ jwt: string }>> {
  return apiFetch<{ jwt: string }>("/api/auth/local/register", {
    method: "POST",
    anonymous: true,
    body: input,
  });
}

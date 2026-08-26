"use server";

/**
 * Auth actions: sign in, sign up, sign out.
 *
 * Every export in a `"use server"` file is a callable HTTP endpoint, so these are
 * scoped deliberately narrowly and each one validates its own input rather than
 * trusting the form that called it.
 *
 * The shape is React 19's `useActionState`: `(prevState, formData) => state`. Returning
 * an error object instead of throwing means a wrong password re-renders the form with
 * the message and the email still filled in, rather than tripping an error boundary.
 * A *successful* sign-in does not return — it calls `redirect()`.
 */

import { redirect } from "next/navigation";

import { authenticate, getSession, registerAccount } from "@/lib/api";
import { homePathFor } from "@/lib/roles";
import { endSession, startSession } from "@/lib/session";

import { safePath } from "./shared";

export type AuthState = {
  error?: string;
  values?: { identifier?: string; email?: string; username?: string; fullName?: string; mobileNumber?: string };
};

function text(form: FormData, key: string): string {
  const value = form.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function signIn(_prev: AuthState, form: FormData): Promise<AuthState> {
  const identifier = text(form, "identifier");
  const password = String(form.get("password") ?? "");

  if (!identifier || !password) {
    return { error: "Enter your email and password.", values: { identifier } };
  }

  const result = await authenticate(identifier, password);
  if (!result.ok) {
    // Strapi's own message for bad credentials is "Invalid identifier or password",
    // which is the right level of vagueness: it does not confirm whether the email
    // exists, so this cannot be used to enumerate accounts. Passed through as-is.
    return { error: result.error, values: { identifier } };
  }

  // `POST /api/auth/local` returns a user object but Strapi strips the `role`
  // relation from it, so the role has to be read separately. The cookie is written
  // first because `getSession()` authenticates with it.
  await startSession(result.data.jwt, null);
  const user = await getSession();
  const role = user?.role?.type ?? null;
  await startSession(result.data.jwt, role);

  redirect(safePath(form.get("next"), homePathFor(role)));
}

export async function signUp(_prev: AuthState, form: FormData): Promise<AuthState> {
  const email = text(form, "email");
  const fullName = text(form, "fullName");
  const mobileNumber = text(form, "mobileNumber");
  const password = String(form.get("password") ?? "");
  const confirm = String(form.get("confirmPassword") ?? "");
  const values = { email, fullName, mobileNumber };

  if (!email || !fullName || !mobileNumber || !password) {
    return { error: "Fill in every field to create your account.", values };
  }
  // Mirrors Strapi's own minimum. Checking it here means the user finds out before
  // the round-trip, not after.
  if (password.length < 8) {
    return { error: "Use a password of at least 8 characters.", values };
  }
  if (fullName.length > 120) {
    return { error: "Your full name is too long.", values };
  }
  if (!/^[+\d][\d\s().-]{6,19}$/.test(mobileNumber)) {
    return { error: "Enter a valid mobile number.", values };
  }
  if (password !== confirm) {
    return { error: "Those two passwords do not match.", values };
  }

  // Strapi requires a unique username internally, but it is not useful to ask
  // learners to invent a second identifier. Derive one privately from the email
  // and add a short suffix so repeated local parts remain unique.
  const emailName = email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "").slice(0, 32) || "learner";
  const username = `${emailName}-${Date.now().toString(36)}`;
  const result = await registerAccount({ username, email, password, fullName, mobileNumber });
  if (!result.ok) {
    return { error: result.error, values };
  }

  // New accounts are Students. That is set by Strapi's `advanced.default_role`
  // setting, which the backend's bootstrap pins to `student` — the role is never
  // chosen by the signup form, because a form field is something the client controls
  // and self-assigning `admin` would be the whole permission model gone.
  await startSession(result.data.jwt, "student");
  redirect("/my-courses?ok=registered");
}

export async function signOut() {
  await endSession();
  redirect("/?ok=signed-out");
}

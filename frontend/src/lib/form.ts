/**
 * The result contract shared by every Server Action and every form that renders one.
 *
 * This file deliberately has no `"use server"` and no `import "server-only"`: the type
 * has to be importable from both sides of the boundary — the action returns it, the
 * client form narrows it. `lib/actions/shared.ts` re-exports it alongside the `done()`
 * and `fail()` constructors so action modules only need one import.
 *
 * The success variant is the point. Actions used to end in `redirect()`, which threw
 * away their return value and made a full page navigation the only way to report
 * "saved" — which is why every create and update used to be its own route. With a
 * success variant a form can close its own dialog and raise a toast instead.
 */

export type ActionSuccess = {
  ok: true;
  /** Human copy for the toast. Written by the action, never assembled in the URL. */
  message: string;
  /** Present on creates, so a caller can navigate to the new record if it wants to. */
  id?: number;
};

export type ActionFailure = { ok: false; error: string };

/** What `useActionState` holds. `undefined` is "nothing submitted yet". */
export type FormState = ActionSuccess | ActionFailure | undefined;

/**
 * Narrowing helpers.
 *
 * `state?.error` does not type-check against a discriminated union, and writing the
 * `state && state.ok === false` dance at forty call sites is how one of them ends up
 * subtly wrong. Two functions instead.
 */
export function errorOf(state: FormState): string | undefined {
  return state && state.ok === false ? state.error : undefined;
}

export function successOf(state: FormState): ActionSuccess | undefined {
  return state && state.ok === true ? state : undefined;
}

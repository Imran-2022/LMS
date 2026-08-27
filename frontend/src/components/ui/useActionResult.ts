"use client";

/**
 * Turn a Server Action's returned state into user-visible feedback.
 *
 * Every overlay form needs the same three lines after a submit resolves — toast the
 * success message, tell the parent to close and refresh, and do neither of those twice.
 * This is that, once.
 *
 * Two deliberate choices:
 *
 * - **Only success is toasted.** Failures render inline in the dialog footer, next to
 *   the button that failed. Doing both would announce the same sentence twice to a
 *   screen reader (the footer error is `role="alert"`, the toast is a live region) and
 *   would put the explanation of what went wrong in the corner of the screen, away from
 *   the field that needs fixing.
 *
 * - **Fires once per submission.** `useActionState` keeps returning the same state object
 *   on every subsequent render, so an effect keyed on it alone would re-toast whenever
 *   the parent re-rendered. Comparing object identity against the last state handled is
 *   enough: React returns a *new* object for each submission, and returns the same one
 *   for everything else.
 */
import { useEffect, useRef } from "react";

import type { ActionSuccess, FormState } from "@/lib/form";
import { useToast } from "./Toast";

export function useActionResult(
  state: FormState,
  onSuccess?: (result: ActionSuccess) => void,
) {
  const { toast } = useToast();
  const handled = useRef<FormState>(undefined);
  // Kept in a ref so a caller passing an inline arrow function does not make the effect
  // re-run on every render; the identity guard above would swallow it anyway, but this
  // keeps the dependency list honest instead of relying on that.
  const callback = useRef(onSuccess);
  callback.current = onSuccess;

  useEffect(() => {
    if (!state || state === handled.current) return;
    handled.current = state;
    if (!state.ok) return;
    toast(state.message, "success");
    callback.current?.(state);
  }, [state, toast]);
}

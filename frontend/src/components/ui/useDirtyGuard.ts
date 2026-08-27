"use client";

/**
 * Ask before throwing away unsaved edits.
 *
 * An overlay makes accidental dismissal much easier than a page did: Escape and a stray
 * backdrop click are both one gesture away, and a quiz builder can hold twenty minutes of
 * work. So a form marks itself dirty on first input and routes its dismissal through
 * `guard`, which either closes or asks first.
 *
 * The confirmation reuses `useConfirm`, so it stacks on top of the form's own dialog and
 * Escape dismisses only the question — not the form behind it.
 *
 * `markDirty` is wired to the form's `onChange`, which in React fires for typing as well
 * as for checkbox and select changes, and bubbles from every field. One handler on the
 * `<form>` covers a form of any size, including the parts of the quiz builder that only
 * exist after the author adds a question.
 */
import { useCallback, useRef, useState } from "react";

import { useConfirm } from "./ConfirmDialog";

export function useDirtyGuard() {
  const confirm = useConfirm();
  const [dirty, setDirty] = useState(false);
  // Read inside `guard` so the returned callback stays stable while still seeing the
  // current value — otherwise every keystroke would hand the dialog a new `onClose`.
  const dirtyRef = useRef(false);

  const markDirty = useCallback(() => {
    dirtyRef.current = true;
    setDirty(true);
  }, []);

  const reset = useCallback(() => {
    dirtyRef.current = false;
    setDirty(false);
  }, []);

  /** Wrap a close handler: clean forms close immediately, dirty ones ask. */
  const guard = useCallback(
    async (close: () => void) => {
      if (!dirtyRef.current) {
        close();
        return;
      }
      const discard = await confirm({
        title: "Discard your changes?",
        body: "This form has edits that haven't been saved. Closing now loses them.",
        confirmLabel: "Discard",
        cancelLabel: "Keep editing",
        tone: "danger",
      });
      if (!discard) return;
      dirtyRef.current = false;
      setDirty(false);
      close();
    },
    [confirm],
  );

  return { dirty, markDirty, reset, guard };
}

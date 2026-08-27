"use client";

/**
 * Load one full record for an edit overlay.
 *
 * The list screens only have summaries — a `Course` row carries no `description`, a
 * `LessonSummary` carries no `content`, a course's quizzes arrive as `{id, title,
 * questionCount}`. So opening "Edit" needs a read, and this hook is how the overlay gets
 * it: open immediately with a skeleton, fill in when the record lands.
 *
 * `load` is a Server Action, not a `fetch`. That is the whole point — the JWT lives in an
 * httpOnly cookie, so the browser cannot call Strapi directly, and adding a proxy route
 * just for editing would mean a second copy of the permission check. The action already
 * runs as the signed-in user.
 *
 * Signature note: the loader takes the id as an argument rather than being closed over it.
 * A `() => load(id)` closure is a new function on every render, which would restart the
 * request in a loop; a module-scope Server Action reference is stable, so `(load, id)` can
 * be an honest dependency list.
 */
import { useCallback, useEffect, useState } from "react";

export type RecordState<T> = {
  record: T | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
};

export function useRecord<T>(
  load: (id: number) => Promise<T | null>,
  /** `null` means "nothing to load" — the overlay is closed, or this is a create form. */
  id: number | null,
): RecordState<T> {
  const [record, setRecord] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (id === null) {
      // Clear rather than keep: reopening the drawer on a different row must not flash
      // the previous row's values into the inputs before the new record arrives.
      setRecord(null);
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    load(id)
      .then((value) => {
        if (cancelled) return;
        if (value === null) {
          // The loader returns `null` for both "gone" and "not yours", because telling
          // the two apart would confirm the existence of records the user cannot see.
          setError("That record couldn't be opened. It may have been deleted.");
        } else {
          setRecord(value);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError("Couldn't reach the server. Check your connection and retry.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      // The drawer can be closed, or switched to another row, while this is in flight.
      cancelled = true;
    };
  }, [load, id, attempt]);

  const reload = useCallback(() => setAttempt((count) => count + 1), []);

  return { record, loading, error, reload };
}

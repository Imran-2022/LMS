"use client";

/**
 * CourseFilters — search, category and level for the catalogue.
 *
 * Filtering happens on the server: this writes to the URL and the page re-reads its
 * `searchParams`, so `/courses?q=react&level=beginner` is a shareable, bookmarkable,
 * back-button-able state and the filtering itself is done by the API's own allow-listed
 * query handling rather than by holding every course in client memory.
 *
 * The search box is debounced because it fires a navigation per keystroke otherwise.
 * 350ms is long enough to finish a word and short enough not to feel laggy.
 */
import { Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

import { cx } from "@/lib/format";
import { Button } from "@/components/ui/Button";

const LEVELS = [
  { value: "", label: "All levels" },
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

export function CourseFilters({
  categories,
  basePath = "/courses",
}: {
  /** Derived from the courses actually present, so there are no empty filters. */
  categories: string[];
  basePath?: string;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  const currentQuery = params.get("q") ?? "";
  const currentCategory = params.get("category") ?? "";
  const currentLevel = params.get("level") ?? "";

  const [query, setQuery] = useState(currentQuery);
  // Tracks whether the user has typed since the last URL change. Without it, arriving
  // from a link with `?q=react` would immediately fire a redundant navigation.
  const typed = useRef(false);

  useEffect(() => {
    if (!typed.current) return;

    const timer = setTimeout(() => {
      push({ q: query });
    }, 350);

    return () => clearTimeout(timer);
    // `push` is recreated every render, so including it would re-arm the timer
    // constantly and defeat the debounce.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  /** Merge changes into the existing query string rather than replacing it. */
  function push(changes: Record<string, string>) {
    const next = new URLSearchParams(params.toString());

    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    // Any filter change invalidates the flash message from a previous action.
    next.delete("ok");
    next.delete("err");

    const search = next.toString();
    startTransition(() => {
      // `scroll: false` keeps the viewport where it is — refining a filter should not
      // throw the user back to the top of the page.
      router.replace(search ? `${basePath}?${search}` : basePath, { scroll: false });
    });
  }

  const active = Boolean(query || currentCategory || currentLevel);

  return (
    <div
      className={cx(
        "rounded border-ink-200/70 bg-white p-4 transition-opacity",
        pending && "opacity-70",
      )}
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            type="search"
            value={query}
            onChange={(event) => {
              typed.current = true;
              setQuery(event.target.value);
            }}
            placeholder="Search courses by title or summary…"
            aria-label="Search courses"
            className="h-11 w-full rounded border border-ink-200 bg-white pl-10 pr-3 text-sm text-ink-900 outline-none transition-colors placeholder:text-ink-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-500/10"
          />
        </div>

        <div className="flex gap-3">
          {categories.length > 0 ? (
            <select
              value={currentCategory}
              onChange={(event) => push({ category: event.target.value })}
              aria-label="Filter by category"
              className="h-11 min-w-[150px] rounded border border-ink-200 bg-white px-3 text-sm text-ink-900 outline-none transition-colors focus:border-brand-400 focus:ring-4 focus:ring-brand-500/10"
            >
              <option value="">All categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          ) : null}

          <select
            value={currentLevel}
            onChange={(event) => push({ level: event.target.value })}
            aria-label="Filter by level"
            className="h-11 min-w-[140px] rounded border border-ink-200 bg-white px-3 text-sm text-ink-900 outline-none transition-colors focus:border-brand-400 focus:ring-4 focus:ring-brand-500/10"
          >
            {LEVELS.map((level) => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>

          <Button
            type="button"
            disabled={!active}
            onClick={() => {
              typed.current = false;
              setQuery("");
              router.replace(basePath, { scroll: false });
            }}
            variant="primary"
            size="md"
            className="px-3 text-[13px]"
          >
            <X className="h-3.5 w-3.5" />
            Clear
          </Button>
        </div>
      </div>
    </div>
  );
}

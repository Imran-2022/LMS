"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";

const SEARCH_DELAY = 350;

function blogUrl(pathname: string, query: string, status: string) {
  const params = new URLSearchParams();
  if (query.trim()) params.set("q", query.trim());
  if (status) params.set("status", status);
  else params.set("status", "all");
  params.set("page", "1");
  params.set("pageSize", "25");
  return `${pathname}?${params.toString()}`;
}

export function AdminBlogFilters({
  query: initialQuery,
  status: initialStatus,
}: {
  query: string;
  status: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState(initialQuery);
  const [status, setStatus] = useState(initialStatus);

  useEffect(() => {
    setQuery(initialQuery);
    setStatus(initialStatus);
  }, [initialQuery, initialStatus]);

  useEffect(() => {
    if (query === initialQuery) return;
    const timer = window.setTimeout(
      () => router.replace(blogUrl(pathname, query, status)),
      SEARCH_DELAY,
    );
    return () => window.clearTimeout(timer);
  }, [initialQuery, pathname, query, router, status]);

  const hasFilters = Boolean(query.trim() || status);

  return (
    <div className="mt-7 flex flex-col gap-3 rounded border border-ink-200 bg-white p-4 sm:flex-row sm:items-end">
      <Input
        label="Search posts"
        name="q"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Title or excerpt"
        className="sm:min-w-72"
      />
      <Select
        label="Status"
        name="status"
        value={status}
        onChange={(event) => {
          const nextStatus = event.target.value;
          setStatus(nextStatus);
          router.replace(blogUrl(pathname, query, nextStatus));
        }}
        wrapperClassName="sm:w-52"
      >
        <option value="">All statuses</option>
        <option value="published">Published</option>
        <option value="draft">Draft</option>
      </Select>
      <Button
        type="button"
        variant="ghost"
        size="md"
        disabled={!hasFilters}
        onClick={() => {
          setQuery("");
          setStatus("");
          router.replace(blogUrl(pathname, "", ""));
        }}
      >
        Clear
      </Button>
    </div>
  );
}
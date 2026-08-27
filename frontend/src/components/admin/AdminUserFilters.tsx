"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";

const SEARCH_DELAY = 350;

function usersUrl(pathname: string, query: string, role: string) {
  const params = new URLSearchParams();
  if (query.trim()) params.set("q", query.trim());
  if (role) params.set("role", role);
  params.set("page", "1");
  params.set("pageSize", "25");
  return `${pathname}?${params.toString()}`;
}

export function AdminUserFilters({
  query: initialQuery,
  role: initialRole,
}: {
  query: string;
  role: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState(initialQuery);
  const [role, setRole] = useState(initialRole);

  useEffect(() => {
    setQuery(initialQuery);
    setRole(initialRole);
  }, [initialQuery, initialRole]);

  useEffect(() => {
    if (query === initialQuery) return;
    const timer = window.setTimeout(
      () => router.replace(usersUrl(pathname, query, role)),
      SEARCH_DELAY,
    );
    return () => window.clearTimeout(timer);
  }, [initialQuery, pathname, query, role, router]);

  function changeRole(nextRole: string) {
    setRole(nextRole);
    router.replace(usersUrl(pathname, query, nextRole));
  }

  const hasFilters = Boolean(query.trim() || role);

  return (
    <div className="mt-7 flex flex-col gap-3 rounded border border-ink-200 bg-white p-4 sm:flex-row sm:items-end">
      <Input
        label="Search users"
        name="q"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Name, email, or username"
        className="sm:min-w-72"
      />
      <Select
        label="Account type"
        name="role"
        value={role}
        onChange={(event) => changeRole(event.target.value)}
        wrapperClassName="sm:w-52"
      >
        <option value="">All account types</option>
        <option value="student">Student</option>
        <option value="instructor">Instructor</option>
        <option value="content_manager">Content Manager</option>
        <option value="admin">Admin</option>
      </Select>
      <Button
        type="button"
        variant="ghost"
        size="md"
        disabled={!hasFilters}
        onClick={() => {
          setQuery("");
          setRole("");
          router.replace(usersUrl(pathname, "", ""));
        }}
      >
        Clear
      </Button>
    </div>
  );
}
"use client";

import { Button } from "@/components/ui/Button";

export default function DashboardError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="rounded border border-danger-200 bg-danger-50 p-6">
      <h1 className="text-lg font-bold text-danger-800">Something went wrong</h1>
      <p className="mt-2 text-sm text-danger-700">This page could not be loaded.</p>
      <Button type="button" variant="danger" size="sm" className="mt-5" onClick={() => reset()}>Try again</Button>
    </div>
  );
}

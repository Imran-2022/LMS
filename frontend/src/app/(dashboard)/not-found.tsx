import { ButtonLink } from "@/components/ui/Button";

export default function DashboardNotFound() {
  return (
    <div className="rounded border border-ink-200 bg-white p-8 text-center">
      <h1 className="text-xl font-bold text-ink-900">Page not found</h1>
      <p className="mt-2 text-sm text-ink-500">The item you requested is unavailable.</p>
      <ButtonLink href="/" variant="secondary" size="sm" className="mt-5">Return home</ButtonLink>
    </div>
  );
}

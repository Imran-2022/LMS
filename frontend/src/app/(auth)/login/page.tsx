import { AuthForm } from "@/components/auth/AuthForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <main className="flex min-h-dvh items-center justify-center bg-ink-50 px-4 py-12">
      <section className="w-full max-w-md rounded-2xl border border-ink-200 bg-white p-7 shadow-xl shadow-ink-900/5 sm:p-9">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-brand-600">Lumen LMS</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-ink-950">Sign in</h1>
        <p className="mt-3 text-sm leading-6 text-ink-600">
          Continue your learning journey from where you left off.
        </p>
        <AuthForm next={next} />
      </section>
    </main>
  );
}
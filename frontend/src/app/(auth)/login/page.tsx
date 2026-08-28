import { AuthForm } from "@/components/auth/AuthForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <main className="flex min-h-dvh items-center justify-center bg-ink-50 px-4 py-12">
      <section className="w-full max-w-md rounded border border-ink-200 bg-white p-7 shadow-xl shadow-ink-900/5 sm:p-9">
        <AuthForm next={next} />
      </section>
    </main>
  );
}

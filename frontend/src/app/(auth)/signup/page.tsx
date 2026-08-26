import { SignupForm } from "@/components/auth/SignupForm";

export default function SignupPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-ink-50 px-4 py-12">
      <section className="w-full max-w-md rounded border border-ink-200 bg-white p-7 shadow-xl shadow-ink-900/5 sm:p-9">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-brand-600">CPS Academy LMS</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-ink-950">Create your account</h1>
        <p className="mt-3 text-sm leading-6 text-ink-600">
          Join CPS Academy to learn, teach, and track your progress.
        </p>
        <SignupForm />
      </section>
    </main>
  );
}
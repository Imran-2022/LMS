import { SignupForm } from "@/components/auth/SignupForm";

export default function SignupPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-ink-50 px-4 py-6 sm:py-8">
      <section className="w-full max-w-md rounded border border-ink-200 bg-white p-6 shadow-xl shadow-ink-900/5 sm:p-8">
        <h1 className="mt-2 text-3xl font-black tracking-tight text-ink-950">Create your account</h1>
        <SignupForm />
      </section>
    </main>
  );
}
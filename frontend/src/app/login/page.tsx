import Link from "next/link";
export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#263d31] px-6 text-[#f5f7f2]">
      <form className="w-full max-w-md" action="/api/auth/login" method="post">
        <Link href="/" className="text-sm font-bold">
          ← LumaLearn
        </Link>
        <h1 className="mt-20 text-4xl font-semibold tracking-[-.04em]">
          Welcome back.
        </h1>
        <p className="mt-3 text-[#b4c1b4]">Your next lesson is waiting.</p>
        <label className="mt-10 block text-sm">
          Email
          <input
            name="identifier"
            type="email"
            required
            className="mt-2 w-full border-b border-white/30 bg-transparent px-0 py-3 outline-none focus:border-[#d7f36b]"
          />
        </label>
        <label className="mt-6 block text-sm">
          Password
          <input
            name="password"
            type="password"
            required
            className="mt-2 w-full border-b border-white/30 bg-transparent px-0 py-3 outline-none focus:border-[#d7f36b]"
          />
        </label>
        <button className="mt-10 w-full rounded-full bg-[#d7f36b] px-5 py-4 text-sm font-bold text-[#14221b]">
          Sign in
        </button>
        <p className="mt-6 text-center text-sm text-[#b4c1b4]">
          New here?{" "}
          <Link href="/signup" className="text-[#d7f36b]">
            Create an account
          </Link>
        </p>
      </form>
    </main>
  );
}

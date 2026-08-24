import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f5f7f2] text-[#14221b]">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <Link href="/" className="flex items-center gap-3 text-lg font-bold tracking-tight">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#d7f36b] text-sm">L</span>
          LumaLearn
        </Link>
        <div className="hidden items-center gap-8 text-sm font-medium text-[#607066] md:flex">
          <Link href="/courses" className="transition-colors hover:text-[#14221b]">Explore courses</Link>
          <Link href="/blog" className="transition-colors hover:text-[#14221b]">Journal</Link>
        </div>
        <div className="flex items-center gap-3 text-sm font-semibold">
          <Link href="/login" className="hidden px-3 py-2 sm:block">Sign in</Link>
          <Link href="/signup" className="rounded-full bg-[#14221b] px-5 py-3 text-[#f5f7f2] transition-transform hover:-translate-y-0.5">Start learning</Link>
        </div>
      </nav>

      <section className="mx-auto grid max-w-7xl gap-12 px-6 pb-20 pt-10 lg:grid-cols-[1.02fr_.98fr] lg:items-center lg:px-10 lg:pb-28 lg:pt-16">
        <div className="animate-[rise_.7s_ease-out_both]">
          <p className="mb-6 flex items-center gap-2 text-xs font-bold uppercase tracking-[.2em] text-[#708074]"><span className="h-2 w-2 rounded-full bg-[#f1a66a]" /> Learn with intention</p>
          <h1 className="max-w-3xl text-5xl font-semibold leading-[.98] tracking-[-.05em] sm:text-7xl">Make room for the work that changes you.</h1>
          <p className="mt-8 max-w-lg text-lg leading-8 text-[#607066]">A focused learning space for curious people building useful skills, one clear lesson at a time.</p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link href="/courses" className="rounded-full bg-[#e58c5a] px-6 py-4 text-sm font-bold text-[#14221b] shadow-[0_10px_30px_rgba(229,140,90,.22)] transition-transform hover:-translate-y-1">Browse the library <span className="ml-3">→</span></Link>
            <span className="text-sm text-[#708074]">12,000+ learners already inside</span>
          </div>
        </div>
        <div className="relative min-h-[390px] animate-[rise_.8s_.12s_ease-out_both] lg:min-h-[500px]">
          <div className="absolute inset-8 rotate-3 rounded-[2.5rem] bg-[#d7f36b]" />
          <div className="absolute inset-0 overflow-hidden rounded-[2.5rem] bg-[#263d31] p-7 text-[#f5f7f2] shadow-2xl sm:p-10">
            <div className="flex items-center justify-between text-xs uppercase tracking-[.18em] text-[#b4c1b4]"><span>Today&apos;s practice</span><span>04 / 12</span></div>
            <div className="mt-20 max-w-sm sm:mt-28"><p className="text-sm text-[#d7f36b]">Creative systems</p><h2 className="mt-3 text-4xl font-semibold leading-tight tracking-[-.04em]">Designing for the second thought.</h2></div>
            <div className="absolute bottom-8 left-7 right-7 flex items-center justify-between border-t border-white/15 pt-5 text-sm sm:left-10 sm:right-10"><span className="text-[#b4c1b4]">18 min lesson</span><span className="grid h-11 w-11 place-items-center rounded-full bg-[#f5f7f2] text-[#14221b]">↗</span></div>
          </div>
        </div>
      </section>

      <section className="border-y border-[#dce3d8] bg-[#edf1e9]">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 sm:grid-cols-3 lg:px-10">
          {[['01', 'Learn in sequence', 'A calm path from first principles to confident practice.'], ['02', 'Keep your momentum', 'Small wins and visible progress make the next session easy.'], ['03', 'Go deeper together', 'Thoughtful instructors, useful feedback, no filler.']].map(([number, title, text]) => <div key={number} className="flex gap-5"><span className="font-mono text-sm text-[#e58c5a]">{number}</span><div><h3 className="font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-[#708074]">{text}</p></div></div>)}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-10"><div className="flex flex-wrap items-end justify-between gap-6"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-[#e58c5a]">From the journal</p><h2 className="mt-3 text-3xl font-semibold tracking-[-.04em]">Ideas for your next chapter.</h2></div><Link href="/blog" className="text-sm font-semibold underline decoration-[#e58c5a] underline-offset-4">Read all notes →</Link></div></section>
    </main>
  );
}

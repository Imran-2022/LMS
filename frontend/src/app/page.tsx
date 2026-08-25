import { ArrowRight, BookOpen, ChartNoAxesCombined, GraduationCap } from "lucide-react";
import { PublicNav } from "@/components/layout/PublicNav";
import { ButtonLink } from "@/components/ui/Button";

const highlights = [
  {
    icon: BookOpen,
    title: "Learn with direction",
    text: "Follow clear lessons and keep your place as you build practical skills.",
  },
  {
    icon: ChartNoAxesCombined,
    title: "See your progress",
    text: "Track completed lessons and quiz results from one focused workspace.",
  },
  {
    icon: GraduationCap,
    title: "Teach what matters",
    text: "Create structured courses, lessons, and quizzes for your learners.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-dvh overflow-hidden bg-ink-50">
      <PublicNav />

      <main>
        <section className="relative border-b border-ink-200/70 bg-white">
          <div className="mx-auto grid w-full max-w-[1180px] gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-28">
            <div className="relative z-10 max-w-2xl">
              <p className="mb-5 text-sm font-bold uppercase tracking-[0.16em] text-brand-600">
                Learning, made visible
              </p>
              <h1 className="max-w-xl text-5xl font-black leading-[1.02] tracking-tight text-ink-950 sm:text-6xl">
                Make progress you can feel.
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-ink-600">
                Lumen brings courses, practice, and momentum into one calm place to learn and
                teach.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <ButtonLink href="/courses" size="lg">
                  Explore courses <ArrowRight size={18} aria-hidden="true" />
                </ButtonLink>
                <ButtonLink href="/signup" variant="secondary" size="lg">
                  Start learning
                </ButtonLink>
              </div>
            </div>

            <div className="relative min-h-[290px] overflow-hidden rounded-[2rem] bg-ink-950 p-7 text-white shadow-2xl shadow-brand-900/15 sm:p-10">
              <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-brand-500/40 blur-3xl" />
              <div className="absolute -bottom-24 -left-10 h-56 w-56 rounded-full bg-cyan-400/20 blur-3xl" />
              <div className="relative flex h-full flex-col justify-between">
                <div className="flex items-center justify-between text-sm text-ink-300">
                  <span className="font-semibold text-white">Your learning path</span>
                  <span>01 / 04</span>
                </div>
                <div className="mt-16">
                  <p className="text-sm text-brand-300">Continue where you left off</p>
                  <h2 className="mt-2 text-3xl font-bold tracking-tight">Build better habits</h2>
                  <div className="mt-7 h-2 overflow-hidden rounded-full bg-white/15">
                    <div className="h-full w-[68%] rounded-full bg-brand-400" />
                  </div>
                  <p className="mt-3 text-sm text-ink-300">68% complete</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-[1180px] px-4 py-16 sm:px-6 lg:py-20">
          <div className="grid gap-8 md:grid-cols-3">
            {highlights.map(({ icon: Icon, title, text }) => (
              <div key={title} className="border-t-2 border-brand-200 pt-5">
                <Icon className="text-brand-600" size={23} aria-hidden="true" />
                <h2 className="mt-5 text-lg font-bold text-ink-900">{title}</h2>
                <p className="mt-2 leading-7 text-ink-600">{text}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
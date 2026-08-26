import { ArrowRight, BookOpen, ChartNoAxesCombined, GraduationCap } from "lucide-react";
import Image from "next/image";
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

export default async function HomePage() {
  return (
    <div className="min-h-dvh overflow-hidden bg-white">
      <PublicNav />

      <main>
        <section className="relative overflow-hidden bg-white">
          <div className="mx-auto grid w-full max-w-[1180px] gap-14 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-16 lg:py-24">
            <div className="relative z-10 max-w-2xl">
              <p className="mb-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.08em] text-brand-600">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-600" />
                Learn with purpose
              </p>
              <h1 className="max-w-xl text-4xl font-black leading-[1.05] tracking-tight text-ink-950">
                Make progress you can feel.
              </h1>
              <p className="mt-6 max-w-md text-lg leading-relaxed text-ink-600">
                CPS Academy brings courses, practice, and momentum into one calm place to learn and
                teach — so every session moves you forward.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <ButtonLink href="/courses" size="lg">
                  Explore courses <ArrowRight size={18} aria-hidden="true" />
                </ButtonLink>
                <ButtonLink href="/signup" variant="secondary" size="lg">
                  Start learning
                </ButtonLink>
              </div>
              <div className="mt-5 flex items-center gap-3 text-sm text-ink-500">
                <div className="flex -space-x-2" aria-hidden="true">
                  <Image src="/avatar-3.svg" alt="" width={32} height={32} className="relative z-10 order-1 rounded-full ring-2 ring-white" />
                  <Image src="/avatar-2.svg" alt="" width={32} height={32} className="relative z-20 order-2 rounded-full ring-2 ring-white" />
                  <Image src="/avatar-1.svg" alt="" width={32} height={32} className="relative z-30 order-3 rounded-full ring-2 ring-white" />
                </div>
                <span>
                  Trusted by <strong className="font-semibold text-ink-900">12,000+</strong> learners
                </span>
              </div>
            </div>

            <div className="relative flex items-center justify-center">
              <Image
                src="/learning-path.svg"
                alt="A visual learning path with milestones and progress notes"
                width={720}
                height={480}
                className="h-auto w-full max-w-[640px]"
              />
            </div>
          </div>
        </section>

        <section className="border-t border-ink-100 bg-ink-50">
          <div className="mx-auto w-full max-w-[1180px] px-4 py-16 sm:px-6 lg:py-20">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-ink-900">Everything you need to keep moving</h2>
              <p className="mt-3 text-ink-500">Three simple building blocks that make progress easy to start and easy to see.</p>
            </div>
            <div className="mt-14 grid gap-6 md:grid-cols-3">
            {highlights.map(({ icon: Icon, title, text }) => (
              <div key={title} className="group rounded border border-ink-100 bg-white p-7 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lift">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded bg-brand-600 text-white transition-colors group-hover:bg-brand-700">
                  <Icon size={21} aria-hidden="true" />
                </span>
                <h2 className="mt-5 text-lg font-bold text-ink-900">{title}</h2>
                <p className="mt-2 leading-7 text-ink-600">{text}</p>
              </div>
            ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
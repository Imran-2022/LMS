import Link from "next/link";

type RoutePageProps = {
  eyebrow?: string;
  title: string;
  description: string;
  links?: { href: string; label: string }[];
};

export function RoutePage({ eyebrow = "Lumen LMS", title, description, links = [] }: RoutePageProps) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[900px] flex-col justify-center px-6 py-16">
      <p className="text-sm font-bold uppercase tracking-[0.16em] text-brand-600">{eyebrow}</p>
      <h1 className="mt-4 text-4xl font-black tracking-tight text-ink-950">{title}</h1>
      <p className="mt-4 max-w-2xl text-lg leading-8 text-ink-600">{description}</p>
      {links.length > 0 && (
        <nav className="mt-8 flex flex-wrap gap-3" aria-label="Page links">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-600"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </main>
  );
}
import Link from "next/link";
import { strapiFetch, BlogPost } from "@/lib/api";
export default async function BlogPage() {
  let posts: BlogPost[] = [];
  try {
    posts = (
      await strapiFetch<{ data: BlogPost[] }>(
        "/api/blog-posts?filters[status][$eq]=published",
      )
    ).data;
  } catch {}
  const visible = posts.length
    ? posts
    : [
        {
          id: 1,
          title: "The value of a slower first draft",
          body: "A note on attention, patience, and making useful things.",
          status: "published" as const,
        },
        {
          id: 2,
          title: "Small systems for deep work",
          body: "How a few gentle constraints can protect your best thinking.",
          status: "published" as const,
        },
      ];
  return (
    <main className="min-h-screen bg-[#f5f7f2] px-6 py-10 text-[#14221b] lg:px-10">
      <div className="mx-auto max-w-5xl">
        <Link href="/" className="text-sm font-bold">
          ← LumaLearn
        </Link>
        <div className="mt-20">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-[#e58c5a]">
            The journal
          </p>
          <h1 className="mt-4 text-5xl font-semibold tracking-[-.05em]">
            Notes for the curious.
          </h1>
        </div>
        <div className="mt-16 border-t border-[#dce3d8]">
          {visible.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.id}`}
              className="block border-b border-[#dce3d8] py-8 transition-colors hover:bg-[#edf1e9]"
            >
              <h2 className="text-2xl font-semibold">{post.title}</h2>
              <p className="mt-3 max-w-xl text-[#607066]">{post.body}</p>
              <span className="mt-6 block text-xs font-bold uppercase tracking-[.14em] text-[#e58c5a]">
                Read note →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}

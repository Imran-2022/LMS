/**
 * Slug generation.
 *
 * Strapi's `uid` field type auto-fills only through the admin panel; entries created
 * over the REST API arrive with whatever the client sent. Since blog URLs are
 * `/blog/[slug]` and the slug is `required`, generating it here — and guaranteeing
 * uniqueness — is what keeps the public routes from 404-ing on a post created
 * through the API.
 */

// Combining diacritical marks. Written escaped rather than as literal characters so
// the regex survives any editor or terminal that mangles non-ASCII.
const DIACRITICS = /[̀-ͯ]/g;

/** `"Why we chose Strapi!"` -> `"why-we-chose-strapi"`. */
export function slugify(input: string): string {
  return (
    String(input)
      // NFKD splits "é" into "e" + combining acute, which the next line then strips —
      // so "Café" and "Cafe" produce the same readable slug.
      .normalize("NFKD")
      .replace(DIACRITICS, "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80)
  );
}

/**
 * A slug that is not already taken.
 *
 * Appends `-2`, `-3`, ... rather than a random suffix, so two posts called "Welcome"
 * give `welcome` and `welcome-2` instead of `welcome-f4a91c`. `excludeId` lets an
 * edit keep its own slug without colliding with itself.
 */
export async function uniqueSlug(
  strapi: any,
  uid: string,
  desired: string,
  excludeId?: number,
): Promise<string> {
  const base = slugify(desired) || "post";
  let candidate = base;
  let suffix = 2;

  // Bounded loop: 50 collisions on one title means something is wrong upstream, and
  // an unbounded `while (true)` in a request handler is how you hang a server.
  for (let attempt = 0; attempt < 50; attempt += 1) {
    const existing = await strapi.db
      .query(uid)
      .findOne({ where: { slug: candidate } });

    if (!existing || (excludeId && Number(existing.id) === Number(excludeId))) {
      return candidate;
    }

    candidate = `${base}-${suffix}`;
    suffix += 1;
  }

  return `${base}-${Date.now()}`;
}

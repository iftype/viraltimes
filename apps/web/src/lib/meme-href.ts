export function memeHref(slug: string) {
  const encodedSlug = encodeURIComponent(slug);
  return process.env.NEXT_PUBLIC_BASE_PATH
    ? `/meme?slug=${encodedSlug}`
    : `/memes/${encodedSlug}`;
}

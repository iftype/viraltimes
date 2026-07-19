import type { Meme } from "@/types/meme";

export const sampleMemes: Meme[] = [];

export function getMemeBySlug(slug: string) {
  return sampleMemes.find((meme) => meme.slug === slug);
}

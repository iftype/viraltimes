import type { Meme, MemeCategory } from "@/types/meme";

export const fallbackCategories: MemeCategory[] = [
  { id: "category-internet-broadcast", slug: "internet-broadcast", label: "인터넷 방송", sortOrder: 10, isActive: true },
  { id: "category-league-of-legends", slug: "league-of-legends", label: "리그 오브 레전드", sortOrder: 20, isActive: true },
  { id: "category-challenge", slug: "challenge", label: "챌린지", sortOrder: 30, isActive: true },
  { id: "category-community-meme", slug: "community-meme", label: "커뮤니티 밈", sortOrder: 40, isActive: true },
  { id: "category-video-meme", slug: "video-meme", label: "영상 밈", sortOrder: 50, isActive: true },
  { id: "category-music-dance", slug: "music-dance", label: "음악·댄스", sortOrder: 60, isActive: true },
  { id: "category-game", slug: "game", label: "게임", sortOrder: 70, isActive: true },
];

export function filterMemes(memes: Meme[], categoryId: string, query: string) {
  const normalizedQuery = query.trim().toLocaleLowerCase("ko");
  return memes.filter((meme) => {
    if (categoryId !== "all" && !meme.categoryIds.includes(categoryId)) return false;
    if (!normalizedQuery) return true;
    return [meme.title, ...meme.aliases, ...meme.tags]
      .join(" ")
      .toLocaleLowerCase("ko")
      .includes(normalizedQuery);
  });
}

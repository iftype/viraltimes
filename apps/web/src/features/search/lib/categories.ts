import type { Meme, MemeCategory } from "@/types/meme";

export const fallbackCategories: MemeCategory[] = [
  { id: "category-korea-minor-meme", slug: "korea-minor-meme", label: "코리아 마이너 밈", sortOrder: 5, isActive: true },
  { id: "category-internet-broadcast", slug: "internet-broadcast", label: "인터넷 방송", sortOrder: 10, isActive: true },
  { id: "category-league-of-legends", slug: "league-of-legends", label: "리그 오브 레전드", sortOrder: 20, isActive: true },
  { id: "category-challenge", slug: "challenge", label: "챌린지", sortOrder: 30, isActive: true },
  { id: "category-community-meme", slug: "community-meme", label: "커뮤니티 밈", sortOrder: 40, isActive: true },
  { id: "category-video-meme", slug: "video-meme", label: "영상 밈", sortOrder: 50, isActive: true },
  { id: "category-music-dance", slug: "music-dance", label: "음악·댄스", sortOrder: 60, isActive: true },
  { id: "category-game", slug: "game", label: "게임", sortOrder: 70, isActive: true },
  { id: "category-instagram", slug: "instagram", label: "인스타·숏폼", sortOrder: 80, isActive: true },
  { id: "category-toon-anime", slug: "toon-anime", label: "만화·애니", sortOrder: 90, isActive: true },
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

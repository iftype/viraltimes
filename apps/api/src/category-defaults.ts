import type { Category } from "./category-types.js";
import type { Meme } from "./meme-types.js";

const initialDate = "2026-07-16T00:00:00.000Z";

export const defaultCategories: Category[] = [
  ["category-korea-minor-meme", "korea-minor-meme", "코리아 마이너 밈", "원본이 없거나 아직 특정되지 않은 국내 커뮤니티의 작은 유행", 5],
  ["category-internet-broadcast", "internet-broadcast", "인터넷 방송", "스트리머와 방송 커뮤니티에서 시작된 유행", 10],
  ["category-league-of-legends", "league-of-legends", "리그 오브 레전드", "리그 오브 레전드와 e스포츠 관련 밈", 20],
  ["category-challenge", "challenge", "챌린지", "참여와 변형을 중심으로 확산된 챌린지", 30],
  ["category-community-meme", "community-meme", "커뮤니티 밈", "게시판과 SNS에서 확산된 표현과 포맷", 40],
  ["category-video-meme", "video-meme", "영상 밈", "특정 영상이나 영상 포맷에서 시작된 밈", 50],
  ["category-music-dance", "music-dance", "음악·댄스", "음악과 안무를 중심으로 확산된 유행", 60],
  ["category-game", "game", "게임", "게임 플레이와 게임 커뮤니티에서 시작된 밈", 70],
  ["category-instagram", "instagram", "인스타·숏폼", "인스타그램, 틱톡, 숏폼 중심 유행", 80],
  ["category-toon-anime", "toon-anime", "만화·애니", "웹툰, 만화, 애니메이션 관련 밈", 90],
].map(([id, slug, label, description, sortOrder]) => ({
  id: String(id),
  slug: String(slug),
  label: String(label),
  description: String(description),
  sortOrder: Number(sortOrder),
  isActive: true,
  createdAt: initialDate,
  updatedAt: initialDate,
}));

const categoryIdBySlug = Object.fromEntries(
  defaultCategories.map((category) => [category.slug, category.id]),
);

export function legacyCategoryIds(meme: Omit<Meme, "categoryIds"> & { categoryIds?: string[] }) {
  if (Array.isArray(meme.categoryIds) && meme.categoryIds.length) {
    return [...new Set(meme.categoryIds)];
  }

  const values = meme.tags.map((tag) => tag.toLocaleLowerCase("ko"));
  const ids = new Set<string>();
  if (meme.kind === "minor-meme") ids.add(categoryIdBySlug["korea-minor-meme"]);
  if (meme.kind === "challenge") ids.add(categoryIdBySlug.challenge);
  if (meme.kind === "video-meme") ids.add(categoryIdBySlug["video-meme"]);
  if (meme.kind === "community-meme") ids.add(categoryIdBySlug["community-meme"]);

  if (values.some((tag) => ["인스타", "인스타그램", "틱톡", "숏폼", "instagram", "tiktok"].includes(tag))) {
    ids.add(categoryIdBySlug.instagram);
  }
  if (values.some((tag) => ["인방", "인터넷 방송", "방송", "스트리머", "숲", "아프리카tv", "BJ", "유튜버"].includes(tag))) {
    ids.add(categoryIdBySlug["internet-broadcast"]);
  }
  if (values.some((tag) => ["커뮤", "커뮤니티", "디시", "에타", "sns"].includes(tag))) {
    ids.add(categoryIdBySlug["community-meme"]);
  }
  if (values.some((tag) => ["게임", "gaming", "롤", "league of legends", "lol", "오버워치", "e스포츠"].includes(tag))) {
    ids.add(categoryIdBySlug.game);
  }
  if (values.some((tag) => ["리그 오브 레전드", "롤", "lol", "e스포츠"].includes(tag))) {
    ids.add(categoryIdBySlug["league-of-legends"]);
  }
  if (values.some((tag) => ["댄스", "음악", "노래", "안무"].includes(tag))) {
    ids.add(categoryIdBySlug["music-dance"]);
  }
  if (values.some((tag) => ["만화", "웹툰", "애니", "애니메이션", "toon", "anime"].includes(tag))) {
    ids.add(categoryIdBySlug["toon-anime"]);
  }
  return [...ids].filter(Boolean);
}

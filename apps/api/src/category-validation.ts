import type { CategoryInput } from "./category-types.js";

type Result = { ok: true; category: CategoryInput } | { ok: false; error: string };

export function parseCategoryInput(value: unknown): Result {
  if (!value || typeof value !== "object") {
    return { ok: false, error: "카테고리 데이터가 필요합니다." };
  }
  const raw = value as Record<string, unknown>;
  const slug = typeof raw.slug === "string" ? raw.slug.trim().toLowerCase().slice(0, 80) : "";
  const label = typeof raw.label === "string" ? raw.label.trim().slice(0, 80) : "";
  const description = typeof raw.description === "string"
    ? raw.description.trim().slice(0, 240) || undefined
    : undefined;
  const sortOrder = Number.isFinite(Number(raw.sortOrder)) ? Number(raw.sortOrder) : 0;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || !label) {
    return { ok: false, error: "카테고리 이름과 영문 slug를 확인해 주세요." };
  }
  return {
    ok: true,
    category: {
      slug,
      label,
      description,
      sortOrder: Math.max(0, Math.min(9999, Math.round(sortOrder))),
      isActive: raw.isActive !== false,
    },
  };
}

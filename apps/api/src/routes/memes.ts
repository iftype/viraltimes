import type { FastifyInstance } from "fastify";

import type { CategoryStore } from "../category-store.js";
import type { MemeStore } from "../meme-store.js";
import type { ParticipationStore } from "../participation-store.js";
import { enrichLifecycle } from "../meme-lifecycle.js";

export function registerMemeRoutes(
  app: FastifyInstance,
  memeStore: MemeStore,
  categoryStore: CategoryStore,
  participationStore: ParticipationStore,
) {
  app.get("/api/v1/memes", async (request, reply) => {
    const query = request.query as {
      page?: string;
      pageSize?: string;
      kind?: string;
      tag?: string;
      tags?: string;
      category?: string;
      categories?: string;
      query?: string;
      verification?: "all" | "verified" | "open";
      year?: string;
      fromYear?: string;
      toYear?: string;
      sort?: "latest" | "oldest" | "updated";
    };
    const page = Math.max(1, Number.parseInt(query.page ?? "1", 10) || 1);
    const pageSize = Math.min(
      48,
      Math.max(1, Number.parseInt(query.pageSize ?? "24", 10) || 24),
    );
    const search = query.query?.trim().toLocaleLowerCase("ko") ?? "";
    const [allItems, categories] = await Promise.all([
      memeStore.list(),
      categoryStore.list(),
    ]);
    const categoryReferences = [query.category, ...(query.categories?.split(",") ?? [])]
      .map((value) => value?.trim())
      .filter((value): value is string => Boolean(value));
    const requestedCategoryIds = new Set(
      (await Promise.all(categoryReferences.map((value) => categoryStore.resolveId(value))))
        .filter((value): value is string => Boolean(value)),
    );
    const requestedTags = new Set(
      [query.tag, ...(query.tags?.split(",") ?? [])]
        .map((value) => value?.trim())
        .filter((value): value is string => Boolean(value)),
    );
    const categoryById = new Map(categories.map((category) => [category.id, category]));
    const itemsWithLifecycle = allItems.map((item) => ({
      ...item,
      lifecycle: enrichLifecycle(item),
    }));
    const baseFilteredItems = itemsWithLifecycle.filter((item) => {
      if (query.kind && item.kind !== query.kind) return false;
      if (requestedTags.size && !item.tags.some((tag) => requestedTags.has(tag))) return false;
      if (categoryReferences.length && !item.categoryIds.some((id) => requestedCategoryIds.has(id))) {
        return false;
      }
      if (query.verification === "verified" && item.origin.status !== "verified") return false;
      if (query.verification === "open" && item.origin.status === "verified") return false;
      if (
        search &&
        ![item.title, ...item.aliases, ...item.tags]
          .join(" ")
          .toLocaleLowerCase("ko")
          .includes(search)
      ) {
        return false;
      }
      return true;
    });
    const year = Number.parseInt(query.year ?? "", 10);
    const fromYear = Number.parseInt(query.fromYear ?? "", 10);
    const toYear = Number.parseInt(query.toYear ?? "", 10);
    const filteredItems = baseFilteredItems
      .filter((item) => {
        const originYear = item.lifecycle.originYear;
        if (Number.isInteger(year) && originYear !== year) return false;
        if (Number.isInteger(fromYear) && (originYear === undefined || originYear < fromYear)) return false;
        if (Number.isInteger(toYear) && (originYear === undefined || originYear > toYear)) return false;
        return true;
      })
      .sort((a, b) => {
        if (query.sort === "latest") return (b.lifecycle.originYear ?? 0) - (a.lifecycle.originYear ?? 0);
        if (query.sort === "oldest") return (a.lifecycle.originYear ?? 9999) - (b.lifecycle.originYear ?? 9999);
        return b.updatedAt.localeCompare(a.updatedAt);
      });
    const yearCounts = new Map<number, number>();
    for (const item of baseFilteredItems) {
      const originYear = item.lifecycle.originYear;
      if (originYear !== undefined) yearCounts.set(originYear, (yearCounts.get(originYear) ?? 0) + 1);
    }
    const total = filteredItems.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const start = (page - 1) * pageSize;
    const pageItems = filteredItems.slice(start, start + pageSize);
    const participationByMeme = await participationStore.counts(
      pageItems.map((item) => item.id),
    );
    reply.header("Cache-Control", "no-store");
    return {
      items: pageItems.map((item) => ({
        ...item,
        categories: item.categoryIds
          .map((id) => categoryById.get(id))
          .filter(Boolean),
        participation: participationByMeme[item.id] ?? { commentCount: 0, proposalCount: 0 },
      })),
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      },
      facets: {
        years: [...yearCounts.entries()]
          .sort(([a], [b]) => b - a)
          .map(([value, count]) => ({ value, count })),
        tags: [...allItems.reduce((counts, item) => {
          for (const tag of item.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
          return counts;
        }, new Map<string, number>())]
          .sort(([, a], [, b]) => b - a)
          .slice(0, 40)
          .map(([value, count]) => ({ value, count })),
      },
    };
  });

  app.get("/api/v1/memes/:slug", async (request, reply) => {
    const params = request.params as { slug: string };
    const item = await memeStore.getBySlug(params.slug.toLowerCase());
    if (!item) {
      return reply.code(404).send({ error: "사전 항목을 찾을 수 없습니다." });
    }
    const categoryById = new Map(
      (await categoryStore.list()).map((category) => [category.id, category]),
    );
    const participation = (await participationStore.counts([item.id]))[item.id] ?? {
      commentCount: 0,
      proposalCount: 0,
    };
    reply.header("Cache-Control", "no-store");
    return {
      item: {
        ...item,
        lifecycle: enrichLifecycle(item),
        categories: item.categoryIds
          .map((id) => categoryById.get(id))
          .filter(Boolean),
        participation,
      },
    };
  });
}

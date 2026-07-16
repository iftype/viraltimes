import { timingSafeEqual } from "node:crypto";

import type { FastifyInstance } from "fastify";

import type { MemeStore } from "../meme-store.js";
import type { TrendStore } from "../trend-store.js";
import {
  trendMetrics,
  trendSources,
  type TrendMetric,
  type TrendSnapshot,
  type TrendSource,
} from "../trend-types.js";

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

function sameToken(value: string, expected: string) {
  const left = Buffer.from(value);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function registerTrendRoutes(
  app: FastifyInstance,
  dependencies: { ingestToken: string; memeStore: MemeStore; trendStore: TrendStore },
) {
  const { ingestToken, memeStore, trendStore } = dependencies;

  app.get("/api/v1/memes/:slug/trends", async (request, reply) => {
    const params = request.params as { slug: string };
    const query = request.query as { from?: string; to?: string; metric?: string; source?: string; limit?: string };
    const meme = await memeStore.getBySlug(params.slug.toLowerCase());
    if (!meme) return reply.code(404).send({ error: "사전 항목을 찾을 수 없습니다." });
    const allItems = await trendStore.list(meme.id, query);
    const limit = Math.min(1000, Math.max(1, Number.parseInt(query.limit ?? "400", 10) || 400));
    const items = allItems.slice(-limit);
    reply.header("Cache-Control", "public, max-age=300, stale-while-revalidate=3600");
    return { items, total: allItems.length, truncated: allItems.length > items.length };
  });

  app.post("/api/v1/internal/trends/snapshots", async (request, reply) => {
    if (!ingestToken) return reply.code(503).send({ error: "트렌드 수집이 아직 설정되지 않았습니다." });
    const authorization = request.headers.authorization ?? "";
    const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
    if (!token || !sameToken(token, ingestToken)) {
      return reply.code(401).send({ error: "수집 인증이 필요합니다." });
    }

    const rawItems = (request.body as { items?: unknown } | null)?.items;
    if (!Array.isArray(rawItems) || rawItems.length === 0 || rawItems.length > 500) {
      return reply.code(400).send({ error: "스냅샷은 한 번에 1~500개까지 저장할 수 있습니다." });
    }
    const memeIds = new Set((await memeStore.list(true)).map((meme) => meme.id));
    const collectedAt = new Date().toISOString();
    const items: TrendSnapshot[] = [];
    for (const rawItem of rawItems) {
      if (!rawItem || typeof rawItem !== "object") {
        return reply.code(400).send({ error: "스냅샷 형식을 확인해 주세요." });
      }
      const raw = rawItem as Record<string, unknown>;
      const memeId = typeof raw.memeId === "string" ? raw.memeId.trim() : "";
      const observedOn = typeof raw.observedOn === "string" ? raw.observedOn.trim() : "";
      const source = trendSources.includes(raw.source as TrendSource)
        ? (raw.source as TrendSource)
        : null;
      const metric = trendMetrics.includes(raw.metric as TrendMetric)
        ? (raw.metric as TrendMetric)
        : null;
      const value = typeof raw.value === "number" ? raw.value : Number.NaN;
      const sampleSize = typeof raw.sampleSize === "number" ? raw.sampleSize : undefined;
      if (
        !memeIds.has(memeId) ||
        !datePattern.test(observedOn) ||
        !source ||
        !metric ||
        !Number.isFinite(value) ||
        value < 0 ||
        (sampleSize !== undefined && (!Number.isFinite(sampleSize) || sampleSize < 0))
      ) {
        return reply.code(400).send({ error: "스냅샷 값과 밈 식별자를 확인해 주세요." });
      }
      items.push({ memeId, observedOn, source, metric, value, sampleSize, collectedAt });
    }

    const stored = await trendStore.upsertMany(items);
    return reply.code(201).send({ stored });
  });
}

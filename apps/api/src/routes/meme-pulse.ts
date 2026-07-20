import { randomUUID } from "node:crypto";

import type { FastifyInstance } from "fastify";

import type { MemePulseStore } from "../meme-pulse-store.js";
import type { MemeStore } from "../meme-store.js";

export function registerMemePulseRoutes(app: FastifyInstance, memeStore: MemeStore, pulseStore: MemePulseStore) {
  app.get("/api/v1/memes/:slug/pulse", async (request, reply) => {
    const { slug } = request.params as { slug: string };
    const meme = await memeStore.getBySlug(slug.toLowerCase());
    if (!meme) return reply.code(404).send({ error: "사전 항목을 찾을 수 없습니다." });
    reply.header("Cache-Control", "no-store");
    return { items: await pulseStore.summary(meme.id) };
  });

  app.post("/api/v1/memes/:slug/pulse", async (request, reply) => {
    const { slug } = request.params as { slug: string };
    const meme = await memeStore.getBySlug(slug.toLowerCase());
    if (!meme) return reply.code(404).send({ error: "사전 항목을 찾을 수 없습니다." });
    const body = request.body as { sessionId?: unknown; seen?: unknown } | null;
    const sessionId = typeof body?.sessionId === "string" ? body.sessionId.trim() : "";
    if (sessionId.length < 8 || sessionId.length > 120 || typeof body?.seen !== "boolean") {
      return reply.code(400).send({ error: "응답 형식을 확인해 주세요." });
    }
    const timestamp = new Date().toISOString();
    await pulseStore.upsert({ id: randomUUID(), memeId: meme.id, sessionId, seen: body.seen, observedOn: timestamp.slice(0, 10), timestamp });
    return reply.code(201).send({ items: await pulseStore.summary(meme.id) });
  });
}

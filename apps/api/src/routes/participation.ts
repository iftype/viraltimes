import type { FastifyInstance } from "fastify";

import type { AdminInboxStore } from "../admin-store.js";
import type { MemeStore } from "../meme-store.js";
import type { ParticipationStore } from "../participation-store.js";
import {
  participationTypes,
  proposalSections,
  type ParticipationType,
  type ProposalSection,
} from "../participation-types.js";

const rateLimitWindowMs = 10 * 60 * 1000;
const maxWritesPerWindow = 6;
const attempts = new Map<string, { count: number; startedAt: number }>();
let lastAttemptCleanupAt = 0;

const text = (value: unknown, maxLength: number) =>
  typeof value === "string" ? value.trim().slice(0, maxLength) : "";

function canWrite(address: string) {
  const now = Date.now();
  if (now - lastAttemptCleanupAt > rateLimitWindowMs) {
    for (const [key, attempt] of attempts) {
      if (now - attempt.startedAt > rateLimitWindowMs) attempts.delete(key);
    }
    lastAttemptCleanupAt = now;
  }
  const current = attempts.get(address);
  if (!current || now - current.startedAt > rateLimitWindowMs) {
    attempts.set(address, { count: 1, startedAt: now });
    return true;
  }
  if (current.count >= maxWritesPerWindow) return false;
  current.count += 1;
  return true;
}

export function registerParticipationRoutes(
  app: FastifyInstance,
  dependencies: {
    inboxStore: AdminInboxStore;
    memeStore: MemeStore;
    participationStore: ParticipationStore;
  },
) {
  const { inboxStore, memeStore, participationStore } = dependencies;

  app.get("/api/v1/memes/:memeId/participation", async (request, reply) => {
    const params = request.params as { memeId: string };
    const query = request.query as { type?: string; page?: string; pageSize?: string };
    const type = participationTypes.includes(query.type as ParticipationType)
      ? (query.type as ParticipationType)
      : "comment";
    const page = Math.max(1, Number.parseInt(query.page ?? "1", 10) || 1);
    const pageSize = Math.min(30, Math.max(1, Number.parseInt(query.pageSize ?? "20", 10) || 20));
    const items = await participationStore.list(params.memeId, type);
    const total = items.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const start = (page - 1) * pageSize;
    reply.header("Cache-Control", "no-store");
    return {
      items: items.slice(start, start + pageSize),
      pagination: { page, pageSize, total, totalPages, hasNext: page < totalPages, hasPrevious: page > 1 },
    };
  });

  app.post("/api/v1/memes/:memeId/participation", async (request, reply) => {
    if (!canWrite(request.ip)) {
      return reply.code(429).send({ error: "잠시 후 다시 참여해 주세요." });
    }
    const params = request.params as { memeId: string };
    const meme = (await memeStore.list(true)).find((item) => item.id === params.memeId);
    if (!meme) return reply.code(404).send({ error: "사전 항목을 찾을 수 없습니다." });
    const raw = (request.body ?? {}) as Record<string, unknown>;
    if (text(raw.website, 200)) return reply.code(400).send({ error: "등록할 수 없습니다." });
    const type = participationTypes.includes(raw.type as ParticipationType)
      ? (raw.type as ParticipationType)
      : null;
    const author = text(raw.author, 30) || "익명";
    const body = text(raw.body, type === "proposal" ? 3000 : 1000);
    const evidenceUrl = text(raw.evidenceUrl, 2000);
    const section = proposalSections.includes(raw.section as ProposalSection)
      ? (raw.section as ProposalSection)
      : undefined;
    const action = text(raw.action, 80) || undefined;
    if (!type || body.length < 2 || (type === "proposal" && (!section || !action || body.length < 10))) {
      return reply.code(400).send({ error: "작성 내용을 조금 더 구체적으로 적어주세요." });
    }
    if ((body.match(/https?:\/\//gi) ?? []).length > 2) {
      return reply.code(400).send({ error: "본문 링크는 두 개까지만 입력할 수 있습니다." });
    }
    if (evidenceUrl && !/^https?:\/\//i.test(evidenceUrl)) {
      return reply.code(400).send({ error: "근거 링크 형식을 확인해 주세요." });
    }

    const item = await participationStore.create({
      type,
      memeId: meme.id,
      author,
      body,
      section,
      action,
      evidenceUrl: evidenceUrl || undefined,
    });
    if (type === "proposal") {
      await inboxStore.create({
        category: "proposal",
        title: `${meme.title} · ${action}`,
        author,
        description: body,
        sourceUrl: evidenceUrl || undefined,
        subjectId: meme.id,
      });
    }
    return reply.code(201).send({ item });
  });
}

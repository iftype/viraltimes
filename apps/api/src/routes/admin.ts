import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { randomUUID } from "node:crypto";

import type { AdminAuth } from "../admin-auth.js";
import type { AdminInboxStore } from "../admin-store.js";
import { inboxStatuses } from "../admin-types.js";
import type { CategoryStore } from "../category-store.js";
import { parseCategoryInput } from "../category-validation.js";
import type { MemeStore } from "../meme-store.js";
import type { MetadataSuggestionService } from "../metadata-suggestion.js";
import { parseMemeInput } from "../meme-validation.js";
import { publicationStatuses, type PublicationStatus } from "../meme-types.js";
import type { QuizStore } from "../quiz-store.js";

export function registerAdminRoutes(
  app: FastifyInstance,
  dependencies: {
    adminAuth: AdminAuth;
    adminOrigin: string;
    categoryStore: CategoryStore;
    inboxStore: AdminInboxStore;
    memeStore: MemeStore;
    metadataSuggestionService: MetadataSuggestionService;
    quizStore: QuizStore;
  },
) {
  const { adminAuth, adminOrigin, categoryStore, inboxStore, memeStore, metadataSuggestionService, quizStore } = dependencies;
  const requireAdmin = async (request: FastifyRequest, reply: FastifyReply) => {
    if (
      !adminAuth.isConfigured() ||
      !adminAuth.verifyCookieHeader(request.headers.cookie)
    ) {
      return reply.code(401).send({ error: "관리자 로그인이 필요합니다." });
    }
  };
  const hasTrustedOrigin = (origin?: string) => !origin || origin === adminOrigin;

  app.post("/api/v1/admin/login", async (request, reply) => {
    if (!adminAuth.isConfigured()) {
      return reply.code(503).send({ error: "관리자 로그인이 아직 설정되지 않았습니다." });
    }
    if (!hasTrustedOrigin(request.headers.origin)) {
      return reply.code(403).send({ error: "허용되지 않은 요청입니다." });
    }
    if (!adminAuth.canAttempt(request.ip)) {
      return reply.code(429).send({ error: "잠시 후 다시 시도해 주세요." });
    }
    const body = request.body as { password?: unknown } | null;
    const password = typeof body?.password === "string" ? body.password : "";
    if (!adminAuth.verifyPassword(password)) {
      adminAuth.recordFailure(request.ip);
      return reply.code(401).send({ error: "비밀번호가 맞지 않습니다." });
    }
    adminAuth.clearFailures(request.ip);
    reply.header("Set-Cookie", adminAuth.createSessionCookie());
    return { authenticated: true };
  });

  app.get(
    "/api/v1/admin/session",
    { preHandler: requireAdmin },
    async () => ({ authenticated: true }),
  );

  app.post(
    "/api/v1/admin/logout",
    { preHandler: requireAdmin },
    async (request, reply) => {
      if (!hasTrustedOrigin(request.headers.origin)) {
        return reply.code(403).send({ error: "허용되지 않은 요청입니다." });
      }
      reply.header("Set-Cookie", adminAuth.clearSessionCookie());
      return { authenticated: false };
    },
  );

  app.get(
    "/api/v1/admin/inbox",
    { preHandler: requireAdmin },
    async () => ({ items: await inboxStore.list() }),
  );

  app.patch(
    "/api/v1/admin/inbox/:id",
    { preHandler: requireAdmin },
    async (request, reply) => {
      if (!hasTrustedOrigin(request.headers.origin)) {
        return reply.code(403).send({ error: "허용되지 않은 요청입니다." });
      }
      const params = request.params as { id: string };
      const body = request.body as { status?: unknown } | null;
      const status = typeof body?.status === "string" ? body.status : "";
      if (!inboxStatuses.includes(status as (typeof inboxStatuses)[number])) {
        return reply.code(400).send({ error: "지원하지 않는 처리 상태입니다." });
      }
      const item = await inboxStore.updateStatus(
        params.id,
        status as (typeof inboxStatuses)[number],
      );
      if (!item) return reply.code(404).send({ error: "요청을 찾을 수 없습니다." });
      return { item };
    },
  );

  app.get(
    "/api/v1/admin/categories",
    { preHandler: requireAdmin },
    async () => ({ items: await categoryStore.list(true) }),
  );

  app.post(
    "/api/v1/admin/categories",
    { preHandler: requireAdmin },
    async (request, reply) => {
      if (!hasTrustedOrigin(request.headers.origin)) {
        return reply.code(403).send({ error: "허용되지 않은 요청입니다." });
      }
      const parsed = parseCategoryInput(request.body);
      if (!parsed.ok) return reply.code(400).send({ error: parsed.error });
      const result = await categoryStore.save(parsed.category);
      if (result.conflict) return reply.code(409).send({ error: result.conflict });
      return reply.code(201).send({ item: result.item });
    },
  );

  app.put(
    "/api/v1/admin/categories/:id",
    { preHandler: requireAdmin },
    async (request, reply) => {
      if (!hasTrustedOrigin(request.headers.origin)) {
        return reply.code(403).send({ error: "허용되지 않은 요청입니다." });
      }
      const params = request.params as { id: string };
      const parsed = parseCategoryInput(request.body);
      if (!parsed.ok) return reply.code(400).send({ error: parsed.error });
      const result = await categoryStore.save(parsed.category, params.id);
      if (result.conflict) return reply.code(409).send({ error: result.conflict });
      if (!result.item) return reply.code(404).send({ error: "카테고리를 찾을 수 없습니다." });
      return { item: result.item };
    },
  );

  app.get(
    "/api/v1/admin/memes",
    { preHandler: requireAdmin },
    async () => ({ items: await memeStore.list(true) }),
  );

  app.post(
    "/api/v1/admin/metadata/preview",
    { preHandler: requireAdmin },
    async (request, reply) => {
      if (!hasTrustedOrigin(request.headers.origin)) {
        return reply.code(403).send({ error: "허용되지 않은 요청입니다." });
      }
      const body = request.body as { url?: unknown } | null;
      const url = typeof body?.url === "string" ? body.url.trim() : "";
      if (!url || url.length > 2_000) {
        return reply.code(400).send({ error: "분석할 링크를 확인해 주세요." });
      }
      try {
        return { suggestion: await metadataSuggestionService.suggest(url) };
      } catch (error) {
        return reply.code(400).send({
          error: error instanceof Error ? error.message : "링크 정보를 불러오지 못했습니다.",
        });
      }
    },
  );

  app.post(
    "/api/v1/admin/memes",
    { preHandler: requireAdmin },
    async (request, reply) => {
      if (!hasTrustedOrigin(request.headers.origin)) {
        return reply.code(403).send({ error: "허용되지 않은 요청입니다." });
      }
      const parsed = parseMemeInput(request.body);
      if (!parsed.ok) return reply.code(400).send({ error: parsed.error });
      const categoryIds = new Set((await categoryStore.list(true)).map((item) => item.id));
      if (!parsed.meme.categoryIds.length || parsed.meme.categoryIds.some((id) => !categoryIds.has(id))) {
        return reply.code(400).send({ error: "유효한 카테고리를 하나 이상 선택해 주세요." });
      }
      const result = await memeStore.save(parsed.meme, parsed.publicationStatus);
      if (result.conflict) return reply.code(409).send({ error: result.conflict });
      return reply.code(201).send({ item: result.item });
    },
  );

  app.put(
    "/api/v1/admin/memes/:id",
    { preHandler: requireAdmin },
    async (request, reply) => {
      if (!hasTrustedOrigin(request.headers.origin)) {
        return reply.code(403).send({ error: "허용되지 않은 요청입니다." });
      }
      const params = request.params as { id: string };
      const existing = (await memeStore.list(true)).find(
        (item) => item.id === params.id,
      );
      if (!existing) {
        return reply.code(404).send({ error: "사전 항목을 찾을 수 없습니다." });
      }
      const parsed = parseMemeInput(request.body);
      if (!parsed.ok) return reply.code(400).send({ error: parsed.error });
      const categoryIds = new Set((await categoryStore.list(true)).map((item) => item.id));
      if (!parsed.meme.categoryIds.length || parsed.meme.categoryIds.some((id) => !categoryIds.has(id))) {
        return reply.code(400).send({ error: "유효한 카테고리를 하나 이상 선택해 주세요." });
      }
      const result = await memeStore.save(
        parsed.meme,
        parsed.publicationStatus,
        params.id,
      );
      if (result.conflict) return reply.code(409).send({ error: result.conflict });
      return { item: result.item };
    },
  );

  app.patch(
    "/api/v1/admin/memes/bulk",
    { preHandler: requireAdmin },
    async (request, reply) => {
      if (!hasTrustedOrigin(request.headers.origin)) {
        return reply.code(403).send({ error: "허용되지 않은 요청입니다." });
      }
      const body = request.body as {
        ids?: unknown;
        action?: unknown;
        publicationStatus?: unknown;
        categoryId?: unknown;
      } | null;
      const ids = Array.isArray(body?.ids)
        ? [...new Set(body.ids.filter((id): id is string => typeof id === "string").map((id) => id.trim()).filter(Boolean))]
        : [];
      if (!ids.length || ids.length > 100) {
        return reply.code(400).send({ error: "한 번에 1개부터 100개까지 선택해 주세요." });
      }

      const action = body?.action;
      if (action === "delete") {
        return memeStore.bulkManage(ids, { action });
      }
      if (action === "status") {
        if (!publicationStatuses.includes(body?.publicationStatus as PublicationStatus)) {
          return reply.code(400).send({ error: "변경할 공개 상태를 확인해 주세요." });
        }
        return memeStore.bulkManage(ids, {
          action,
          publicationStatus: body?.publicationStatus as PublicationStatus,
        });
      }
      if (action === "add-category" || action === "remove-category") {
        const categoryId = typeof body?.categoryId === "string" ? body.categoryId.trim() : "";
        const categoryExists = (await categoryStore.list(true)).some((category) => category.id === categoryId);
        if (!categoryExists) {
          return reply.code(400).send({ error: "유효한 카테고리를 선택해 주세요." });
        }
        if (action === "remove-category") {
          const selected = (await memeStore.list(true)).filter((item) => ids.includes(item.id));
          if (selected.some((item) => item.categoryIds.includes(categoryId) && item.categoryIds.length === 1)) {
            return reply.code(400).send({ error: "카테고리가 하나뿐인 항목에서는 제거할 수 없습니다." });
          }
        }
        return memeStore.bulkManage(ids, { action, categoryId });
      }
      return reply.code(400).send({ error: "지원하지 않는 일괄 작업입니다." });
    },
  );

  app.delete(
    "/api/v1/admin/memes/:id",
    { preHandler: requireAdmin },
    async (request, reply) => {
      if (!hasTrustedOrigin(request.headers.origin)) {
        return reply.code(403).send({ error: "허용되지 않은 요청입니다." });
      }
      const params = request.params as { id: string };
      const deleted = await memeStore.delete(params.id);
      if (!deleted) {
        return reply.code(404).send({ error: "사전 항목을 찾을 수 없습니다." });
      }
      return { success: true };
    },
  );


  app.get(
    "/api/v1/admin/quiz/logs",
    { preHandler: requireAdmin },
    async (request, reply) => {
      reply.header("Cache-Control", "no-store");
      return { items: await quizStore.getLogs() };
    },
  );

  app.delete(
    "/api/v1/admin/quiz/logs",
    { preHandler: requireAdmin },
    async (request, reply) => {
      if (!hasTrustedOrigin(request.headers.origin)) return reply.code(403).send({ error: "허용되지 않은 요청입니다." });
      return { deleted: await quizStore.clearLogs() };
    },
  );

  app.delete(
    "/api/v1/admin/quiz/logs/:sessionId",
    { preHandler: requireAdmin },
    async (request, reply) => {
      if (!hasTrustedOrigin(request.headers.origin)) return reply.code(403).send({ error: "허용되지 않은 요청입니다." });
      const { sessionId } = request.params as { sessionId: string };
      if (!sessionId || sessionId.length > 120) return reply.code(400).send({ error: "참여자 ID를 확인해 주세요." });
      const deleted = await quizStore.deleteSession(sessionId);
      if (!deleted) return reply.code(404).send({ error: "삭제할 기록이 없습니다." });
      return { deleted };
    },
  );

  app.get(
    "/api/v1/admin/quiz/cards",
    { preHandler: requireAdmin },
    async () => ({ items: await quizStore.getCards() }),
  );

  app.put(
    "/api/v1/admin/quiz/cards",
    { preHandler: requireAdmin },
    async (request, reply) => {
      if (!hasTrustedOrigin(request.headers.origin)) return reply.code(403).send({ error: "허용되지 않은 요청입니다." });
      const rawCards = (request.body as { items?: unknown } | null)?.items;
      if (!Array.isArray(rawCards) || rawCards.length > 5) return reply.code(400).send({ error: "퀴즈 카드는 최대 5개까지 설정할 수 있습니다." });
      const memeIds = new Set((await memeStore.list()).map((meme) => meme.id));
      const selected = new Set<string>();
      const now = new Date().toISOString();
      const cards = rawCards.flatMap((raw, index) => {
        if (!raw || typeof raw !== "object") return [];
        const entry = raw as Record<string, unknown>;
        const memeId = typeof entry.memeId === "string" ? entry.memeId.trim() : "";
        const field = typeof entry.field === "string" ? entry.field.trim().slice(0, 40) : "";
        if (!memeIds.has(memeId) || selected.has(memeId) || !field) return [];
        selected.add(memeId);
        return [{ id: typeof entry.id === "string" && entry.id ? entry.id.slice(0, 120) : randomUUID(), memeId, field, enabled: entry.enabled !== false, sortOrder: index, updatedAt: now }];
      });
      if (cards.length !== rawCards.length) return reply.code(400).send({ error: "중복되지 않은 공개 밈과 분야를 선택해 주세요." });
      return { items: await quizStore.replaceCards(cards) };
    },
  );
}

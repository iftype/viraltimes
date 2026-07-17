import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

import type { AdminAuth } from "../admin-auth.js";
import type { AdminInboxStore } from "../admin-store.js";
import { inboxStatuses } from "../admin-types.js";
import type { CategoryStore } from "../category-store.js";
import { parseCategoryInput } from "../category-validation.js";
import type { MemeStore } from "../meme-store.js";
import { parseMemeInput } from "../meme-validation.js";
import type { QuizStore } from "../quiz-store.js";

export function registerAdminRoutes(
  app: FastifyInstance,
  dependencies: {
    adminAuth: AdminAuth;
    adminOrigin: string;
    categoryStore: CategoryStore;
    inboxStore: AdminInboxStore;
    memeStore: MemeStore;
    quizStore: QuizStore;
  },
) {
  const { adminAuth, adminOrigin, categoryStore, inboxStore, memeStore, quizStore } = dependencies;
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

  app.get(
    "/api/v1/admin/quiz/logs",
    { preHandler: requireAdmin },
    async (request, reply) => {
      reply.header("Cache-Control", "no-store");
      return { items: await quizStore.getLogs() };
    },
  );
}

import cors from "@fastify/cors";
import Fastify, { type FastifyReply, type FastifyRequest } from "fastify";

import { AdminAuth } from "./admin-auth.js";
import { AdminInboxStore } from "./admin-store.js";
import { inboxCategories, inboxStatuses } from "./admin-types.js";
import { MemeStore } from "./meme-store.js";
import { parseMemeInput } from "./meme-validation.js";

const app = Fastify({ logger: true });

const host = process.env.HOST ?? "127.0.0.1";
const port = Number(process.env.PORT ?? 4000);
const corsOrigin = process.env.CORS_ORIGIN ?? "http://localhost:3000";
const adminOrigin = process.env.ADMIN_ORIGIN ?? "http://localhost:3100";
const adminAuth = new AdminAuth(
  process.env.ADMIN_PASSWORD_HASH ?? "",
  process.env.ADMIN_SESSION_SECRET ?? "",
  process.env.ADMIN_COOKIE_PATH ?? "/viral",
);
const inboxStore = new AdminInboxStore(
  process.env.ADMIN_DATA_FILE ?? "/opt/origin/shared/admin-inbox.json",
);
const memeStore = new MemeStore(
  process.env.MEME_DATA_FILE ?? "/opt/origin/shared/memes.json",
);

await app.register(cors, {
  origin:
    corsOrigin === "*"
      ? true
      : corsOrigin.split(",").map((origin) => origin.trim()),
});

app.get("/health", async () => ({
  service: "origin-api",
  status: "ok",
  version: process.env.APP_VERSION ?? "development",
}));

app.get("/api/v1/health", async () => ({
  service: "origin-api",
  status: "ok",
  version: process.env.APP_VERSION ?? "development",
}));

app.get("/api/v1/memes", async (_request, reply) => {
  reply.header("Cache-Control", "no-store");
  return { items: await memeStore.list() };
});

app.get("/api/v1/memes/:slug", async (request, reply) => {
  const params = request.params as { slug: string };
  const item = await memeStore.getBySlug(params.slug.toLowerCase());
  if (!item) return reply.code(404).send({ error: "사전 항목을 찾을 수 없습니다." });
  reply.header("Cache-Control", "no-store");
  return { item };
});

const requireAdmin = async (request: FastifyRequest, reply: FastifyReply) => {
  if (!adminAuth.isConfigured() || !adminAuth.verifyCookieHeader(request.headers.cookie)) {
    return reply.code(401).send({ error: "관리자 로그인이 필요합니다." });
  }
};

const hasTrustedOrigin = (origin?: string) => !origin || origin === adminOrigin;

app.post("/api/v1/intake", async (request, reply) => {
  const body = request.body as Record<string, unknown> | null;
  const category = typeof body?.category === "string" ? body.category : "";
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  const author = typeof body?.author === "string" ? body.author.trim() : "";
  const description =
    typeof body?.description === "string" ? body.description.trim() : "";
  const sourceUrl =
    typeof body?.sourceUrl === "string" ? body.sourceUrl.trim() : "";
  const subjectId =
    typeof body?.subjectId === "string" ? body.subjectId.trim() : "";

  if (!inboxCategories.includes(category as (typeof inboxCategories)[number])) {
    return reply.code(400).send({ error: "지원하지 않는 등록 유형입니다." });
  }
  if (!title || title.length > 120 || !description || description.length > 3000) {
    return reply.code(400).send({ error: "제목과 설명을 확인해 주세요." });
  }
  if (sourceUrl && !/^https?:\/\//i.test(sourceUrl)) {
    return reply.code(400).send({ error: "링크 형식을 확인해 주세요." });
  }

  const item = await inboxStore.create({
    category: category as (typeof inboxCategories)[number],
    title,
    author: author.slice(0, 60) || "익명",
    description,
    sourceUrl: sourceUrl.slice(0, 2000) || undefined,
    subjectId: subjectId.slice(0, 120) || undefined,
  });

  return reply.code(201).send({ id: item.id, status: item.status });
});

app.post("/api/v1/admin/login", async (request, reply) => {
  if (!adminAuth.isConfigured()) {
    return reply.code(503).send({ error: "관리자 로그인이 아직 설정되지 않았습니다." });
  }
  if (!hasTrustedOrigin(request.headers.origin)) {
    return reply.code(403).send({ error: "허용되지 않은 요청입니다." });
  }

  const address = request.ip;
  if (!adminAuth.canAttempt(address)) {
    return reply.code(429).send({ error: "잠시 후 다시 시도해 주세요." });
  }

  const body = request.body as { password?: unknown } | null;
  const password = typeof body?.password === "string" ? body.password : "";
  if (!adminAuth.verifyPassword(password)) {
    adminAuth.recordFailure(address);
    return reply.code(401).send({ error: "비밀번호가 맞지 않습니다." });
  }

  adminAuth.clearFailures(address);
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
    const existing = (await memeStore.list(true)).find((item) => item.id === params.id);
    if (!existing) return reply.code(404).send({ error: "사전 항목을 찾을 수 없습니다." });

    const parsed = parseMemeInput(request.body);
    if (!parsed.ok) return reply.code(400).send({ error: parsed.error });
    const result = await memeStore.save(
      parsed.meme,
      parsed.publicationStatus,
      params.id,
    );
    if (result.conflict) return reply.code(409).send({ error: result.conflict });
    return { item: result.item };
  },
);

const stop = async (signal: string) => {
  app.log.info({ signal }, "shutting down");
  await app.close();
  process.exit(0);
};

process.on("SIGINT", () => void stop("SIGINT"));
process.on("SIGTERM", () => void stop("SIGTERM"));

await app.listen({ host, port });

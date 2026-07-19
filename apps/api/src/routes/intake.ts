import type { FastifyInstance } from "fastify";

import type { AdminInboxStore } from "../admin-store.js";
import { inboxCategories } from "../admin-types.js";

export function registerIntakeRoutes(
  app: FastifyInstance,
  inboxStore: AdminInboxStore,
) {
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
    const descriptionRequired = category !== "meme_request";
    if (!title || title.length > 120 || (descriptionRequired && !description) || description.length > 3000) {
      return reply.code(400).send({ error: descriptionRequired ? "제목과 설명을 확인해 주세요." : "제목을 확인해 주세요." });
    }
    if (sourceUrl && !/^https?:\/\//i.test(sourceUrl)) {
      return reply.code(400).send({ error: "링크 형식을 확인해 주세요." });
    }

    const item = await inboxStore.create({
      category: category as (typeof inboxCategories)[number],
      title,
      author: author.slice(0, 60) || "익명",
      description: description || "설명 없이 등록된 밈 추가 요청입니다.",
      sourceUrl: sourceUrl.slice(0, 2000) || undefined,
      subjectId: subjectId.slice(0, 120) || undefined,
    });
    return reply.code(201).send({ id: item.id, status: item.status });
  });
}

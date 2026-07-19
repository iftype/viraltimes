import { randomUUID } from "node:crypto";

import type { FastifyInstance } from "fastify";

import type { MemeStore } from "../meme-store.js";
import type { QuizStore } from "../quiz-store.js";
import type { QuizCard, QuizLog } from "../quiz-types.js";

const allowedResponses: QuizLog["response"][] = [
  "know",
  "dont_know",
  "view_detail",
  "helpful",
  "not_helpful",
];

export function registerQuizRoutes(
  app: FastifyInstance,
  quizStore: QuizStore,
  memeStore: MemeStore,
) {
  app.get("/api/v1/quiz/cards", async (_request, reply) => {
    reply.header("Cache-Control", "no-store");
    const memes = await memeStore.list();
    const cards: QuizCard[] = memes.map((meme) => ({
      id: meme.id,
      title: meme.title,
      summary: meme.summary || "아직 설명이 등록되지 않은 밈입니다.",
      type:
        meme.kind === "minor-meme" ||
        meme.categoryIds.includes("category-korea-minor-meme")
          ? "minor"
          : "origin",
      thumbnailUrl: meme.thumbnailUrl,
      accentColor: meme.accent,
      originDetail: {
        creator: meme.origin.video?.creator || "미상",
        originYear: meme.lifecycle?.originYear,
        platform: meme.origin.video?.platform || "unknown",
        description:
          meme.origin.summary ||
          meme.summary ||
          "이 밈의 출처와 사용 맥락을 함께 수집하고 있습니다.",
      },
    }));

    // 같은 순서로 생기는 응답 편향을 줄이기 위해 Fisher-Yates로 섞는다.
    for (let index = cards.length - 1; index > 0; index -= 1) {
      const target = Math.floor(Math.random() * (index + 1));
      [cards[index], cards[target]] = [cards[target], cards[index]];
    }
    return { cards: cards.slice(0, 5) };
  });

  app.post("/api/v1/quiz/log", async (request, reply) => {
    const body = request.body as Partial<QuizLog> | null;
    if (
      typeof body?.sessionId !== "string" ||
      body.sessionId.length < 8 ||
      body.sessionId.length > 120 ||
      typeof body.cardId !== "string" ||
      body.cardId.length < 1 ||
      body.cardId.length > 120 ||
      !["minor", "origin"].includes(body.cardType ?? "") ||
      !allowedResponses.includes(body.response as QuizLog["response"])
    ) {
      return reply.code(400).send({ error: "잘못된 데이터 형식입니다." });
    }

    await quizStore.addLog({
      id: randomUUID(),
      sessionId: body.sessionId,
      cardId: body.cardId,
      cardType: body.cardType as QuizLog["cardType"],
      response: body.response as QuizLog["response"],
      timestamp: new Date().toISOString(),
    });
    return { success: true };
  });

  app.get("/api/v1/quiz/stats", async (_request, reply) => {
    const logs = await quizStore.getLogs();
    const byType = {
      minor: { know: 0, dont_know: 0, view_detail: 0, helpful: 0, not_helpful: 0, total: 0, feedbackTotal: 0 },
      origin: { know: 0, dont_know: 0, view_detail: 0, helpful: 0, not_helpful: 0, total: 0, feedbackTotal: 0 },
    };

    for (const log of logs) {
      const stats = byType[log.cardType];
      if (log.response === "know") {
        stats.know += 1;
        stats.total += 1;
      } else if (log.response === "dont_know") {
        stats.dont_know += 1;
        stats.total += 1;
      } else if (log.response === "view_detail") {
        stats.view_detail += 1;
      } else if (log.response === "helpful") {
        stats.helpful += 1;
        stats.feedbackTotal += 1;
      } else if (log.response === "not_helpful") {
        stats.not_helpful += 1;
        stats.feedbackTotal += 1;
      }
    }

    reply.header("Cache-Control", "no-store");
    return { totalLogs: logs.length, stats: byType };
  });
}

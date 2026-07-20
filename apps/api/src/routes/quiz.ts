import { randomUUID } from "node:crypto";

import type { FastifyInstance } from "fastify";

import type { MemeStore } from "../meme-store.js";
import type { QuizStore } from "../quiz-store.js";
import type { QuizCard, QuizLog } from "../quiz-types.js";

const allowedResponses: QuizLog["response"][] = [
  "start",
  "know",
  "dont_know",
  "view_detail",
  "view_media",
  "helpful",
  "not_helpful",
  "complete",
  "open_meme",
  "open_service",
];

export function registerQuizRoutes(
  app: FastifyInstance,
  quizStore: QuizStore,
  memeStore: MemeStore,
) {
  app.get("/api/v1/quiz/cards", async (_request, reply) => {
    reply.header("Cache-Control", "no-store");
    const [memes, configuredCards] = await Promise.all([memeStore.list(), quizStore.getCards()]);
    const memeById = new Map(memes.map((meme) => [meme.id, meme]));
    const toCard = (meme: (typeof memes)[number], field?: string): QuizCard => ({
      id: meme.id,
      slug: meme.slug,
      title: meme.title,
      summary: meme.summary || "아직 설명이 등록되지 않은 밈입니다.",
      type:
        meme.kind === "minor-meme" ||
        meme.categoryIds.includes("category-korea-minor-meme")
          ? "minor"
          : "origin",
      thumbnailUrl: meme.thumbnailUrl,
      accentColor: meme.accent,
      field,
      originDetail: {
        creator: meme.origin.video?.creator || "미상",
        originYear: meme.lifecycle?.originYear,
        platform: meme.origin.video?.platform || "unknown",
        description:
          meme.origin.summary ||
          meme.summary ||
          "이 밈의 출처와 사용 맥락을 함께 수집하고 있습니다.",
      },
    });
    const managedCards = configuredCards
      .filter((card) => card.enabled)
      .flatMap((card) => {
        const meme = memeById.get(card.memeId);
        return meme ? [toCard(meme, card.field)] : [];
      })
      .slice(0, 5);
    const cards = managedCards.length ? managedCards : memes.map((meme) => toCard(meme));

    // 같은 순서로 생기는 응답 편향을 줄이기 위해 Fisher-Yates로 섞는다.
    if (!managedCards.length) {
      for (let index = cards.length - 1; index > 0; index -= 1) {
        const target = Math.floor(Math.random() * (index + 1));
        [cards[index], cards[target]] = [cards[target], cards[index]];
      }
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
      !allowedResponses.includes(body.response as QuizLog["response"]) ||
      (body.runId !== undefined && (typeof body.runId !== "string" || body.runId.length < 8 || body.runId.length > 120)) ||
      (body.step !== undefined && (typeof body.step !== "number" || !Number.isInteger(body.step) || body.step < 0 || body.step > 5)) ||
      (body.destination !== undefined && (typeof body.destination !== "string" || body.destination.length > 500))
    ) {
      return reply.code(400).send({ error: "잘못된 데이터 형식입니다." });
    }

    await quizStore.addLog({
      id: randomUUID(),
      sessionId: body.sessionId,
      cardId: body.cardId,
      cardType: body.cardType as QuizLog["cardType"],
      response: body.response as QuizLog["response"],
      runId: body.runId,
      step: body.step,
      destination: body.destination,
      timestamp: new Date().toISOString(),
    });
    return { success: true };
  });

  app.get("/api/v1/quiz/stats", async (_request, reply) => {
    const logs = await quizStore.getLogs();
    const recognitionByParticipantCard = new Map<string, QuizLog>();
    const detailByParticipantCard = new Map<string, QuizLog>();
    const feedbackByParticipantCard = new Map<string, QuizLog>();
    const participants = new Set<string>();
    const cardStats = new Map<string, { know: number; dont_know: number; total: number }>();
    const runs = new Map<string, QuizLog[]>();

    for (const log of logs) {
      participants.add(log.sessionId);
      if (log.runId) runs.set(log.runId, [...(runs.get(log.runId) ?? []), log]);
      const key = `${log.sessionId}:${log.cardId}`;
      if (log.response === "know" || log.response === "dont_know") recognitionByParticipantCard.set(key, log);
      else if (log.response === "view_detail" || log.response === "view_media") detailByParticipantCard.set(key, log);
      else if (log.response === "helpful" || log.response === "not_helpful") feedbackByParticipantCard.set(key, log);
    }

    const byType = {
      minor: { know: 0, dont_know: 0, view_detail: 0, helpful: 0, not_helpful: 0, total: 0, feedbackTotal: 0 },
      origin: { know: 0, dont_know: 0, view_detail: 0, helpful: 0, not_helpful: 0, total: 0, feedbackTotal: 0 },
    };

    for (const log of recognitionByParticipantCard.values()) {
      const stats = byType[log.cardType];
      const card = cardStats.get(log.cardId) ?? { know: 0, dont_know: 0, total: 0 };
      if (log.response === "know") {
        stats.know += 1;
        stats.total += 1;
        card.know += 1;
      } else if (log.response === "dont_know") {
        stats.dont_know += 1;
        stats.total += 1;
        card.dont_know += 1;
      }
      card.total += 1;
      cardStats.set(log.cardId, card);
    }
    for (const log of detailByParticipantCard.values()) byType[log.cardType].view_detail += 1;
    for (const log of feedbackByParticipantCard.values()) {
      const stats = byType[log.cardType];
      if (log.response === "helpful") {
        stats.helpful += 1;
        stats.feedbackTotal += 1;
      } else if (log.response === "not_helpful") {
        stats.not_helpful += 1;
        stats.feedbackTotal += 1;
      }
    }

    reply.header("Cache-Control", "no-store");
    const funnel = { started: 0, reached: [0, 0, 0, 0, 0], completed: 0, viewedMedia: 0, openedMeme: 0, openedService: 0, destinations: {} as Record<string, number> };
    for (const entries of runs.values()) {
      if (entries.some((log) => log.response === "start")) funnel.started += 1;
      for (let step = 1; step <= 5; step += 1) {
        if (entries.some((log) => (log.response === "know" || log.response === "dont_know") && log.step === step)) funnel.reached[step - 1] += 1;
      }
      if (entries.some((log) => log.response === "complete")) funnel.completed += 1;
      if (entries.some((log) => log.response === "view_media")) funnel.viewedMedia += 1;
      if (entries.some((log) => log.response === "open_meme")) funnel.openedMeme += 1;
      if (entries.some((log) => log.response === "open_service")) funnel.openedService += 1;
      for (const log of entries.filter((entry) => (entry.response === "view_media" || entry.response === "open_meme" || entry.response === "open_service") && entry.destination)) {
        funnel.destinations[log.destination!] = (funnel.destinations[log.destination!] ?? 0) + 1;
      }
    }
    return { totalLogs: logs.length, uniqueParticipants: participants.size, stats: byType, perCard: Object.fromEntries(cardStats), funnel };
  });
}

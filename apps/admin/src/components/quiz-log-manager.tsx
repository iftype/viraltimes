"use client";

import { ChevronDown, Download, Search } from "lucide-react";
import { useMemo, useState } from "react";

import type { AdminMeme } from "@/components/dictionary-manager";

export type QuizLog = {
  id: string;
  sessionId: string;
  cardId: string;
  cardType: "minor" | "origin";
  response: "know" | "dont_know" | "view_detail" | "helpful" | "not_helpful";
  timestamp: string;
};

const responseLabel: Record<QuizLog["response"], string> = {
  know: "알아요",
  dont_know: "몰라요",
  view_detail: "상세 보기",
  helpful: "설명이 도움됨",
  not_helpful: "설명이 아쉬움",
};

const shortSession = (sessionId: string) => `참여자 ${sessionId.slice(-6).toUpperCase()}`;
const pairKey = (log: QuizLog) => `${log.sessionId}:${log.cardId}`;

export function QuizLogManager({ logs, memes }: { logs: QuizLog[]; memes: Pick<AdminMeme, "id" | "title">[] }) {
  const [query, setQuery] = useState("");
  const titleById = useMemo(() => new Map(memes.map((meme) => [meme.id, meme.title])), [memes]);
  const analysis = useMemo(() => {
    const ordered = [...logs].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    const recognition = new Map<string, QuizLog>();
    const details = new Map<string, QuizLog>();
    const sessions = new Map<string, QuizLog[]>();
    const cards = new Map<string, { type: QuizLog["cardType"]; know: Set<string>; dontKnow: Set<string>; details: Set<string> }>();

    for (const log of ordered) {
      const key = pairKey(log);
      if (log.response === "know" || log.response === "dont_know") recognition.set(key, log);
      if (log.response === "view_detail") details.set(key, log);
      sessions.set(log.sessionId, [...(sessions.get(log.sessionId) ?? []), log]);
    }
    for (const log of recognition.values()) {
      const card = cards.get(log.cardId) ?? { type: log.cardType, know: new Set(), dontKnow: new Set(), details: new Set() };
      (log.response === "know" ? card.know : card.dontKnow).add(log.sessionId);
      cards.set(log.cardId, card);
    }
    for (const source of details.values()) {
      const card = cards.get(source.cardId) ?? { type: source.cardType, know: new Set(), dontKnow: new Set(), details: new Set() };
      card.details.add(source.sessionId);
      cards.set(source.cardId, card);
    }
    const known = [...recognition.values()].filter((log) => log.response === "know").length;
    return { ordered, recognition, details, sessions, cards, known };
  }, [logs]);

  const sessionRows = useMemo(() => [...analysis.sessions.entries()]
    .filter(([sessionId, entries]) => {
      const needle = query.trim().toLocaleLowerCase("ko");
      return !needle || [sessionId, shortSession(sessionId), ...entries.map((entry) => `${entry.cardId} ${titleById.get(entry.cardId) ?? ""}`)]
        .join(" ").toLocaleLowerCase("ko").includes(needle);
    })
    .sort(([, a], [, b]) => new Date(b.at(-1)?.timestamp ?? 0).getTime() - new Date(a.at(-1)?.timestamp ?? 0).getTime()), [analysis.sessions, query, titleById]);

  function downloadCsv() {
    if (!logs.length) return;
    const rows = [["session_id", "card_id", "card_title", "card_type", "response", "timestamp"], ...logs.map((log) => [
      log.sessionId, log.cardId, titleById.get(log.cardId) ?? log.cardId, log.cardType, log.response, log.timestamp,
    ])];
    const content = rows.map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob(["\uFEFF", content], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `viralorigin-quiz-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const answerTotal = analysis.recognition.size;
  return (
    <section className="mt-5 space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["익명 참여자", `${analysis.sessions.size}명`, "브라우저별 익명 ID"],
          ["판단한 카드", `${answerTotal}건`, "같은 사람·카드는 마지막 응답만"],
          ["알고 있어요", answerTotal ? `${Math.round((analysis.known / answerTotal) * 100)}%` : "집계 전", `${analysis.known}/${answerTotal}건`],
          ["상세 확인", `${analysis.details.size}건`, "중복 열람 제외"],
        ].map(([label, value, note]) => <article className="rounded-2xl border border-black/5 bg-white p-5" key={label}><p className="text-xs font-black text-black/40">{label}</p><p className="mt-2 text-2xl font-black">{value}</p><p className="mt-1 text-[0.68rem] text-black/35">{note}</p></article>)}
      </div>

      <section className="rounded-3xl border border-black/5 bg-white p-5">
        <h2 className="text-base font-black">카드별 반응</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {[...analysis.cards.entries()].sort(([, a], [, b]) => b.know.size + b.dontKnow.size - a.know.size - a.dontKnow.size).map(([cardId, card]) => (
            <article className="rounded-2xl bg-[#f7f7f8] p-4" key={cardId}>
              <div className="flex items-start justify-between gap-3"><div><p className="font-black">{titleById.get(cardId) ?? cardId}</p><p className="mt-1 text-[0.68rem] font-bold text-black/35">{card.type === "minor" ? "마이너 밈" : "원본·챌린지"}</p></div><span className="rounded-full bg-white px-2 py-1 text-[0.65rem] font-black">{card.know.size + card.dontKnow.size}명</span></div>
              <div className="mt-3 flex gap-3 text-xs font-bold"><span className="text-[#087b77]">알아요 {card.know.size}</span><span className="text-[#d91d46]">몰라요 {card.dontKnow.size}</span><span className="text-[#9a6200]">상세 {card.details.size}</span></div>
            </article>
          ))}
          {!analysis.cards.size && <p className="py-8 text-center text-sm font-bold text-black/30 sm:col-span-2">아직 기록이 없습니다.</p>}
        </div>
      </section>

      <section className="rounded-3xl border border-black/5 bg-white p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex-1"><h2 className="font-black">사람별 이용 기록</h2><p className="mt-1 text-xs text-black/40">로그인 없이 브라우저에 발급한 익명 ID로 묶었습니다.</p></div>
          <button className="flex cursor-pointer items-center justify-center gap-1.5 rounded-full bg-black px-4 py-2.5 text-xs font-black text-white disabled:opacity-35" disabled={!logs.length} onClick={downloadCsv} type="button"><Download className="size-3.5" />CSV 저장</button>
        </div>
        <label className="relative mt-4 block"><span className="sr-only">참여자 또는 카드 검색</span><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-black/30" /><input className="w-full rounded-xl bg-[#f7f7f8] py-3 pl-9 pr-3 text-base outline-none" onChange={(event) => setQuery(event.target.value)} placeholder="참여자·밈 이름 검색" value={query} /></label>
        <div className="mt-3 space-y-2">
          {sessionRows.map(([sessionId, entries]) => {
            const latestByCard = new Map<string, QuizLog>();
            entries.filter((entry) => entry.response === "know" || entry.response === "dont_know").forEach((entry) => latestByCard.set(entry.cardId, entry));
            const known = [...latestByCard.values()].filter((entry) => entry.response === "know").length;
            const detailCount = new Set(entries.filter((entry) => entry.response === "view_detail").map((entry) => entry.cardId)).size;
            return <details className="group rounded-2xl bg-[#f7f7f8] p-4" key={sessionId}>
              <summary className="flex cursor-pointer list-none items-center gap-3"><div className="min-w-0 flex-1"><p className="font-black">{shortSession(sessionId)}</p><p className="mt-1 truncate text-[0.68rem] font-bold text-black/35">최근 {new Date(entries.at(-1)?.timestamp ?? 0).toLocaleString("ko-KR")} · 알아요 {known} · 몰라요 {latestByCard.size - known} · 상세 {detailCount}</p></div><ChevronDown className="size-4 shrink-0 text-black/30 transition group-open:rotate-180" /></summary>
              <div className="mt-3 space-y-1.5 border-t border-black/5 pt-3">{[...entries].reverse().map((entry) => <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs" key={entry.id}><span className="min-w-0 flex-1 truncate font-bold">{titleById.get(entry.cardId) ?? entry.cardId}</span><span className="shrink-0 font-black text-black/55">{responseLabel[entry.response]}</span><time className="hidden shrink-0 text-black/30 sm:inline">{new Date(entry.timestamp).toLocaleString("ko-KR")}</time></div>)}</div>
            </details>;
          })}
          {!sessionRows.length && <p className="py-8 text-center text-sm font-bold text-black/30">조건에 맞는 기록이 없습니다.</p>}
        </div>
      </section>
    </section>
  );
}

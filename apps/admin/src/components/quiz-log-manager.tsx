"use client";

import { ChevronDown, Download, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

import type { AdminMeme } from "@/components/dictionary-manager";
import type { QuizSurveyQuestion } from "@/components/quiz-survey-manager";

export type QuizLog = {
  id: string;
  sessionId: string;
  cardId: string;
  cardType: "minor" | "origin";
  response: "start" | "know" | "dont_know" | "view_detail" | "view_media" | "helpful" | "not_helpful" | "complete" | "open_meme" | "open_service";
  runId?: string;
  step?: number;
  destination?: string;
  timestamp: string;
};

export type QuizSurveyAnswer = {
  id: string;
  sessionId: string;
  runId: string;
  questionId: string;
  optionId: string;
  questionPrompt: string;
  optionLabel: string;
  timestamp: string;
};

export type QuizSurveySubmission = {
  sessionId: string;
  runId: string;
  questionId: string;
  questionPrompt: string;
  timestamp: string;
};

const responseLabel: Record<QuizLog["response"], string> = {
  start: "테스트 시작",
  know: "알아요",
  dont_know: "몰라요",
  view_detail: "상세 보기",
  view_media: "영상 보기",
  helpful: "설명이 도움됨",
  not_helpful: "설명이 아쉬움",
  complete: "테스트 완료",
  open_meme: "밈 상세 유입",
  open_service: "서비스 유입",
};

const shortSession = (sessionId: string) => `참여자 ${sessionId.slice(-6).toUpperCase()}`;
const pairKey = (log: QuizLog) => `${log.sessionId}:${log.cardId}`;

export function QuizLogManager({ logs, surveyAnswers, surveySubmissions, surveyQuestions, memes, onChange, onSurveyAnswersChange, onSurveySubmissionsChange }: { logs: QuizLog[]; surveyAnswers: QuizSurveyAnswer[]; surveySubmissions: QuizSurveySubmission[]; surveyQuestions: QuizSurveyQuestion[]; memes: Pick<AdminMeme, "id" | "title">[]; onChange: (logs: QuizLog[]) => void; onSurveyAnswersChange: (answers: QuizSurveyAnswer[]) => void; onSurveySubmissionsChange: (submissions: QuizSurveySubmission[]) => void }) {
  const [query, setQuery] = useState("");
  const [deleting, setDeleting] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const titleById = useMemo(() => new Map(memes.map((meme) => [meme.id, meme.title])), [memes]);
  const analysis = useMemo(() => {
    const ordered = [...logs].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    const recognition = new Map<string, QuizLog>();
    const details = new Map<string, QuizLog>();
    const sessions = new Map<string, QuizLog[]>();
    const runs = new Map<string, QuizLog[]>();
    const cards = new Map<string, { type: QuizLog["cardType"]; know: Set<string>; dontKnow: Set<string>; details: Set<string> }>();

    for (const log of ordered) {
      const key = pairKey(log);
      if (log.response === "know" || log.response === "dont_know") recognition.set(key, log);
      if (log.response === "view_detail" || log.response === "view_media") details.set(key, log);
      sessions.set(log.sessionId, [...(sessions.get(log.sessionId) ?? []), log]);
      if (log.runId) runs.set(log.runId, [...(runs.get(log.runId) ?? []), log]);
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
    const funnel = { started: 0, reached: [0, 0, 0, 0, 0], completed: 0, viewedMedia: 0, openedMeme: 0, openedService: 0, destinations: new Map<string, number>() };
    for (const entries of runs.values()) {
      if (entries.some((log) => log.response === "start")) funnel.started += 1;
      for (let step = 1; step <= 5; step += 1) if (entries.some((log) => (log.response === "know" || log.response === "dont_know") && log.step === step)) funnel.reached[step - 1] += 1;
      if (entries.some((log) => log.response === "complete")) funnel.completed += 1;
      if (entries.some((log) => log.response === "view_media")) funnel.viewedMedia += 1;
      if (entries.some((log) => log.response === "open_meme")) funnel.openedMeme += 1;
      if (entries.some((log) => log.response === "open_service")) funnel.openedService += 1;
      for (const log of entries.filter((entry) => (entry.response === "view_media" || entry.response === "open_meme" || entry.response === "open_service") && entry.destination)) funnel.destinations.set(log.destination!, (funnel.destinations.get(log.destination!) ?? 0) + 1);
    }
    return { ordered, recognition, details, sessions, cards, known, funnel };
  }, [logs]);

  const sessionRows = useMemo(() => [...analysis.sessions.entries()]
    .filter(([sessionId, entries]) => {
      const needle = query.trim().toLocaleLowerCase("ko");
      const participantSurvey = surveyAnswers.filter((answer) => answer.sessionId === sessionId);
      const participantSubmissions = surveySubmissions.filter((submission) => submission.sessionId === sessionId);
      return !needle || [sessionId, shortSession(sessionId), ...entries.map((entry) => `${entry.cardId} ${titleById.get(entry.cardId) ?? ""}`), ...participantSurvey.map((answer) => `${answer.questionPrompt} ${answer.optionLabel}`), ...participantSubmissions.map((submission) => submission.questionPrompt)]
        .join(" ").toLocaleLowerCase("ko").includes(needle);
    })
    .sort(([, a], [, b]) => new Date(b.at(-1)?.timestamp ?? 0).getTime() - new Date(a.at(-1)?.timestamp ?? 0).getTime()), [analysis.sessions, query, surveyAnswers, surveySubmissions, titleById]);

  function downloadCsv() {
    if (!logs.length && !surveyAnswers.length && !surveySubmissions.length) return;
    const rows = [["record_type", "session_id", "run_id", "step", "card_id", "card_title", "card_type", "response", "destination", "question_id", "question", "option_id", "answer", "timestamp"],
      ...logs.map((log) => ["quiz_log", log.sessionId, log.runId ?? "", log.step ?? "", log.cardId, titleById.get(log.cardId) ?? log.cardId, log.cardType, log.response, log.destination ?? "", "", "", "", "", log.timestamp]),
      ...surveySubmissions.map((submission) => ["survey_submission", submission.sessionId, submission.runId, "", "", "", "", "", "", submission.questionId, submission.questionPrompt, "", "", submission.timestamp]),
      ...surveyAnswers.map((answer) => ["survey_answer", answer.sessionId, answer.runId, "", "", "", "", "", "", answer.questionId, answer.questionPrompt, answer.optionId, answer.optionLabel, answer.timestamp]),
    ];
    const content = rows.map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob(["\uFEFF", content], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `viraltimes-quiz-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function deleteSession(sessionId: string) {
    setDeleting(sessionId);
    setDeleteError("");
    try {
      const response = await fetch(`/viral/api/v1/admin/quiz/logs/${encodeURIComponent(sessionId)}`, { method: "DELETE" });
      if (!response.ok) throw new Error("delete failed");
      onChange(logs.filter((log) => log.sessionId !== sessionId));
      onSurveyAnswersChange(surveyAnswers.filter((answer) => answer.sessionId !== sessionId));
      onSurveySubmissionsChange(surveySubmissions.filter((submission) => submission.sessionId !== sessionId));
    } catch {
      setDeleteError("기록을 삭제하지 못했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setDeleting("");
    }
  }

  async function clearLogs() {
    if (!confirm(`퀴즈 원시 로그 ${logs.length}건을 모두 삭제하시겠습니까?`)) return;
    setDeleting("all");
    setDeleteError("");
    try {
      const response = await fetch("/viral/api/v1/admin/quiz/logs", { method: "DELETE" });
      if (!response.ok) throw new Error("delete failed");
      onChange([]);
      onSurveyAnswersChange([]);
      onSurveySubmissionsChange([]);
    } catch {
      setDeleteError("전체 기록을 삭제하지 못했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setDeleting("");
    }
  }

  const answerTotal = analysis.recognition.size;
  return (
    <section className="mt-5 space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["익명 참여자", `${analysis.sessions.size}명`, "브라우저별 익명 ID"],
          ["판단한 카드", `${answerTotal}건`, "같은 사람·카드는 마지막 응답만"],
          ["알고 있어요", answerTotal ? `${Math.round((analysis.known / answerTotal) * 100)}%` : "집계 전", `${analysis.known}/${answerTotal}건`],
          ["영상 확인", `${analysis.details.size}건`, "중복 열람 제외"],
        ].map(([label, value, note]) => <article className="rounded-2xl border border-black/5 bg-white p-5" key={label}><p className="text-xs font-black text-black/40">{label}</p><p className="mt-2 text-2xl font-black">{value}</p><p className="mt-1 text-[0.68rem] text-black/35">{note}</p></article>)}
      </div>

      <section className="rounded-3xl border border-black/5 bg-white p-5">
        <div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-base font-black">퀴즈 퍼널</h2><p className="mt-1 text-xs text-black/40">실행별로 시작→카드 1~5→완료→서비스 유입을 확인합니다.</p></div><div className="flex gap-2 text-xs font-black"><span className="rounded-full bg-[#e8fffe] px-3 py-1.5 text-[#087b77]">영상 {analysis.funnel.viewedMedia}</span><span className="rounded-full bg-[#fff0f3] px-3 py-1.5 text-[#d91d46]">밈 상세 {analysis.funnel.openedMeme}</span></div></div>
        <div className="hide-scrollbar mt-4 flex gap-2 overflow-x-auto pb-2">
          {[["시작", analysis.funnel.started], ...analysis.funnel.reached.map((count, index) => [`${index + 1}번`, count] as [string, number]), ["완료", analysis.funnel.completed], ["서비스 유입", analysis.funnel.openedService]].map(([label, count], index, stages) => {
            const previous = index > 0 ? Number(stages[index - 1][1]) : Number(count);
            const lost = Math.max(0, previous - Number(count));
            return <article className="min-w-[7rem] flex-1 rounded-2xl bg-[#f7f7f8] p-3" key={String(label)}><p className="text-[0.65rem] font-black text-black/35">{label}</p><p className="mt-1 text-xl font-black">{count}</p>{index > 0 && <p className={`mt-1 text-[0.62rem] font-bold ${lost ? "text-[#d91d46]" : "text-black/25"}`}>이전 단계 이탈 {lost}</p>}</article>;
          })}
        </div>
        {analysis.funnel.destinations.size > 0 && <div className="mt-3 flex flex-wrap gap-2">{[...analysis.funnel.destinations.entries()].sort(([, a], [, b]) => b - a).map(([destination, count]) => <span className="rounded-full bg-black px-3 py-1.5 text-[0.68rem] font-black text-white" key={destination}>{destination} · {count}</span>)}</div>}
      </section>

      <section className="rounded-3xl border border-black/5 bg-white p-5">
        <h2 className="text-base font-black">추가 설문 응답</h2>
        <p className="mt-1 text-xs text-black/40">설문 구성이 바뀌어도 응답 당시 질문과 선택지 문구를 보존합니다.</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {surveyQuestions.map((question) => {
            const answers = surveyAnswers.filter((answer) => answer.questionId === question.id);
            const submittedRuns = new Set(surveySubmissions.filter((submission) => submission.questionId === question.id).map((submission) => submission.runId));
            if (submittedRuns.size === 0) answers.forEach((answer) => submittedRuns.add(answer.runId));
            const responseTotal = submittedRuns.size;
            return <article className="rounded-2xl bg-[#f7f7f8] p-4" key={question.id}>
              <div className="flex items-start justify-between gap-2"><p className="font-black">{question.prompt}</p><span className="shrink-0 rounded-full bg-white px-2 py-1 text-[0.65rem] font-black">{responseTotal}명</span></div>
              <div className="mt-3 space-y-2">{question.options.map((option) => {
                const count = answers.filter((answer) => answer.optionId === option.id).length;
                return <div key={option.id}><div className="flex justify-between gap-3 text-xs font-bold"><span>{option.label}</span><span className="shrink-0 text-black/40">{count} · {responseTotal ? Math.round((count / responseTotal) * 100) : 0}%</span></div><div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white"><div className="h-full bg-[#fe2c55]" style={{ width: `${responseTotal ? (count / responseTotal) * 100 : 0}%` }} /></div></div>;
              })}</div>
            </article>;
          })}
          {!surveyQuestions.length && <p className="py-8 text-center text-sm font-bold text-black/30 sm:col-span-2">현재 설정된 추가 설문이 없습니다.</p>}
        </div>
      </section>

      <section className="rounded-3xl border border-black/5 bg-white p-5">
        <h2 className="text-base font-black">카드별 반응</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {[...analysis.cards.entries()].sort(([, a], [, b]) => b.know.size + b.dontKnow.size - a.know.size - a.dontKnow.size).map(([cardId, card]) => (
            <article className="rounded-2xl bg-[#f7f7f8] p-4" key={cardId}>
              <div className="flex items-start justify-between gap-3"><div><p className="font-black">{titleById.get(cardId) ?? cardId}</p><p className="mt-1 text-[0.68rem] font-bold text-black/35">{card.type === "minor" ? "마이너 밈" : "원본·챌린지"}</p></div><span className="rounded-full bg-white px-2 py-1 text-[0.65rem] font-black">{card.know.size + card.dontKnow.size}명</span></div>
              <div className="mt-3 flex gap-3 text-xs font-bold"><span className="text-[#087b77]">알아요 {card.know.size}</span><span className="text-[#d91d46]">몰라요 {card.dontKnow.size}</span><span className="text-[#9a6200]">영상 {card.details.size}</span></div>
            </article>
          ))}
          {!analysis.cards.size && <p className="py-8 text-center text-sm font-bold text-black/30 sm:col-span-2">아직 기록이 없습니다.</p>}
        </div>
      </section>

      <section className="rounded-3xl border border-black/5 bg-white p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex-1"><h2 className="font-black">사람별 이용 기록</h2><p className="mt-1 text-xs text-black/40">로그인 없이 브라우저에 발급한 익명 ID로 묶었습니다.</p></div>
          <div className="flex gap-2"><button className="flex cursor-pointer items-center justify-center gap-1.5 rounded-full bg-black px-4 py-2.5 text-xs font-black text-white disabled:opacity-35" disabled={!logs.length && !surveyAnswers.length && !surveySubmissions.length} onClick={downloadCsv} type="button"><Download className="size-3.5" />CSV 저장</button><button className="flex cursor-pointer items-center justify-center gap-1.5 rounded-full bg-[#fff0f3] px-4 py-2.5 text-xs font-black text-[#d91d46] disabled:opacity-35" disabled={(!logs.length && !surveyAnswers.length && !surveySubmissions.length) || Boolean(deleting)} onClick={() => void clearLogs()} type="button"><Trash2 className="size-3.5" />전체 삭제</button></div>
        </div>
        <label className="relative mt-4 block"><span className="sr-only">참여자 또는 카드 검색</span><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-black/30" /><input className="w-full rounded-xl bg-[#f7f7f8] py-3 pl-9 pr-3 text-base outline-none" onChange={(event) => setQuery(event.target.value)} placeholder="참여자·밈 이름 검색" value={query} /></label>
        <div className="mt-3 space-y-2">
          {deleteError && <p role="alert" className="rounded-xl bg-[#fff0f3] px-4 py-3 text-xs font-bold text-[#d91d46]">{deleteError}</p>}
          {sessionRows.map(([sessionId, entries]) => {
            const participantSurvey = surveyAnswers.filter((answer) => answer.sessionId === sessionId);
            const participantSubmissions = surveySubmissions.filter((submission) => submission.sessionId === sessionId);
            const participantSubmissionKeys = new Set(participantSubmissions.map((submission) => `${submission.runId}:${submission.questionId}`));
            const legacySubmissions = participantSurvey.flatMap((answer) => {
              const key = `${answer.runId}:${answer.questionId}`;
              if (participantSubmissionKeys.has(key)) return [];
              participantSubmissionKeys.add(key);
              return [{ sessionId, runId: answer.runId, questionId: answer.questionId, questionPrompt: answer.questionPrompt, timestamp: answer.timestamp }];
            });
            const visibleSubmissions = [...participantSubmissions, ...legacySubmissions];
            const latestByCard = new Map<string, QuizLog>();
            entries.filter((entry) => entry.response === "know" || entry.response === "dont_know").forEach((entry) => latestByCard.set(entry.cardId, entry));
            const known = [...latestByCard.values()].filter((entry) => entry.response === "know").length;
            const detailCount = new Set(entries.filter((entry) => entry.response === "view_detail" || entry.response === "view_media").map((entry) => entry.cardId)).size;
            const startedAt = new Date(entries[0]?.timestamp ?? 0);
            const endedAt = new Date(entries.at(-1)?.timestamp ?? 0);
            const durationSeconds = Math.max(0, Math.round((endedAt.getTime() - startedAt.getTime()) / 1000));
            return <details className="group rounded-2xl bg-[#f7f7f8] p-4" key={sessionId}>
              <summary className="flex cursor-pointer list-none items-center gap-3"><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="font-black">{shortSession(sessionId)}</p><span className={`rounded-full px-2 py-0.5 text-[0.62rem] font-black ${latestByCard.size >= 5 ? "bg-[#e8fffe] text-[#087b77]" : "bg-black/5 text-black/40"}`}>{latestByCard.size >= 5 ? "완료" : `${latestByCard.size}/5 진행`}</span></div><p className="mt-1 text-[0.68rem] font-bold leading-5 text-black/35">{startedAt.toLocaleString("ko-KR")} 시작 · {durationSeconds < 60 ? `${durationSeconds}초` : `${Math.floor(durationSeconds / 60)}분 ${durationSeconds % 60}초`} · 알아요 {known} · 몰라요 {latestByCard.size - known} · 상세 {detailCount}</p></div><ChevronDown className="size-4 shrink-0 text-black/30 transition group-open:rotate-180" /></summary>
              <div className="mt-3 border-t border-black/5 pt-3"><div className="mb-2 flex items-center justify-between gap-2"><p className="text-[0.68rem] font-bold text-black/35">종료 {endedAt.toLocaleString("ko-KR")}</p><button className="flex cursor-pointer items-center gap-1 rounded-full bg-[#fff0f3] px-3 py-1.5 text-[0.68rem] font-black text-[#d91d46] disabled:opacity-35" disabled={Boolean(deleting)} onClick={(event) => { event.preventDefault(); void deleteSession(sessionId); }} type="button"><Trash2 className="size-3" />이 기록 삭제</button></div>{visibleSubmissions.length > 0 && <div className="mb-3 space-y-1.5"><p className="text-[0.68rem] font-black text-black/35">추가 설문</p>{visibleSubmissions.map((submission) => { const selected = participantSurvey.filter((answer) => answer.runId === submission.runId && answer.questionId === submission.questionId); return <div className="rounded-xl bg-[#fff0f3] px-3 py-2 text-xs" key={`${submission.runId}:${submission.questionId}`}><span className="font-bold">{submission.questionPrompt}</span><span className="ml-2 font-black text-[#d91d46]">{selected.length ? selected.map((answer) => answer.optionLabel).join(" · ") : "선택 없음"}</span></div>; })}</div>}<div className="space-y-1.5">{[...entries].reverse().map((entry) => <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs" key={entry.id}><span className="min-w-0 flex-1 truncate font-bold">{titleById.get(entry.cardId) ?? entry.destination ?? entry.cardId}</span>{entry.step !== undefined && <span className="shrink-0 text-[0.62rem] font-bold text-black/25">{entry.step}단계</span>}<span className="shrink-0 font-black text-black/55">{responseLabel[entry.response]}</span><time className="hidden shrink-0 text-black/30 sm:inline">{new Date(entry.timestamp).toLocaleString("ko-KR")}</time></div>)}</div></div>
            </details>;
          })}
          {!sessionRows.length && <p className="py-8 text-center text-sm font-bold text-black/30">조건에 맞는 기록이 없습니다.</p>}
        </div>
      </section>
    </section>
  );
}

"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AlertCircle, ArrowLeftRight, ArrowUpRight, BarChart3, CheckCircle, Home, RefreshCw } from "lucide-react";
import Link from "next/link";

import { Button, Card, buttonClassName } from "@origin/ui";
import { memeHref } from "@/lib/meme-href";
import type { Video } from "@/types/meme";

import { getOrCreateSessionId } from "../utils/session";
import { QuizCard } from "./quiz-card";
import { QuizDetailModal } from "./quiz-detail-modal";

interface QuizCardData {
  id: string;
  slug: string;
  title: string;
  summary: string;
  type: "minor" | "origin";
  thumbnailUrl?: string;
  accentColor?: string;
  field?: string;
  video?: Video;
  originDetail: {
    creator?: string;
    originYear?: number;
    platform?: string;
    description: string;
  };
}

interface QuizTypeStats {
  know: number;
  dont_know: number;
  view_detail: number;
  helpful: number;
  not_helpful: number;
  total: number;
  feedbackTotal: number;
}

interface QuizSurveyQuestion {
  id: string;
  prompt: string;
  required: boolean;
  multiple?: boolean;
  options: { id: string; label: string }[];
}

interface StatsData {
  totalLogs: number;
  stats: { minor: QuizTypeStats; origin: QuizTypeStats };
  perCard?: Record<string, { know: number; dont_know: number; total: number }>;
}

type QuizResponse = "start" | "know" | "dont_know" | "view_detail" | "view_media" | "complete" | "open_meme" | "open_service";

function percentage(value: number, total: number) {
  return total > 0 ? Math.round((value / total) * 100) : 0;
}

export function QuizPage() {
  const [cards, setCards] = useState<QuizCardData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<QuizCardData | null>(null);
  const [responses, setResponses] = useState<Record<string, "know" | "dont_know">>({});
  const [stats, setStats] = useState<StatsData | null>(null);
  const [statsError, setStatsError] = useState(false);
  const [runId, setRunId] = useState("");
  const [surveyQuestions, setSurveyQuestions] = useState<QuizSurveyQuestion[]>([]);
  const [surveyIndex, setSurveyIndex] = useState(0);
  const [surveySelections, setSurveySelections] = useState<Record<string, string[]>>({});
  const [surveySaving, setSurveySaving] = useState(false);
  const [surveyError, setSurveyError] = useState("");
  const [showSwipeHint, setShowSwipeHint] = useState(true);
  const completedRuns = useRef(new Set<string>());

  const postLog = useCallback(async (payload: { cardId: string; cardType: QuizCardData["type"]; response: QuizResponse; runId: string; step?: number; destination?: string }) => {
    try {
      await fetch("/api/v1/quiz/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: getOrCreateSessionId(), ...payload }),
        keepalive: true,
      });
    } catch {
      // 퀴즈 진행은 분석 로그 저장 실패와 독립적으로 유지한다.
    }
  }, []);

  const fetchCards = useCallback(async () => {
    setLoading(true);
    setError(null);
    setStats(null);
    setStatsError(false);
    try {
      const response = await fetch("/api/v1/quiz/cards", { cache: "no-store" });
      if (!response.ok) throw new Error("퀴즈 카드를 불러오지 못했습니다.");
      const data = (await response.json()) as { cards?: QuizCardData[]; surveyQuestions?: QuizSurveyQuestion[] };
      const fetchedCards = Array.isArray(data.cards) ? data.cards : [];
      const nextRunId = typeof crypto.randomUUID === "function" ? crypto.randomUUID() : `quiz-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      setCards(fetchedCards);
      setSurveyQuestions(Array.isArray(data.surveyQuestions) ? data.surveyQuestions : []);
      setSurveyIndex(0);
      setSurveySelections({});
      setSurveyError("");
      setRunId(nextRunId);
      setCurrentIndex(0);
      setResponses({});
      setShowSwipeHint(true);
      if (fetchedCards[0]) void postLog({ cardId: "quiz", cardType: fetchedCards[0].type, response: "start", runId: nextRunId, step: 0 });
    } catch (cause) {
      setCards([]);
      setSurveyQuestions([]);
      setError(cause instanceof Error ? cause.message : "퀴즈 카드를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [postLog]);

  useEffect(() => {
    Promise.resolve().then(() => void fetchCards());
  }, [fetchCards]);

  const sendLog = useCallback((card: QuizCardData, response: QuizResponse, options?: { destination?: string; step?: number }) => postLog({ cardId: card.id, cardType: card.type, response, runId, step: options?.step, destination: options?.destination }), [postLog, runId]);

  const handleSwipe = (direction: "left" | "right") => {
    const card = cards[currentIndex];
    if (!card) return;
    setShowSwipeHint(false);
    const answer = direction === "right" ? "know" : "dont_know";
    setResponses((current) => ({ ...current, [card.id]: answer }));
    void sendLog(card, answer, { step: currentIndex + 1 });
    setCurrentIndex((current) => current + 1);
  };

  const fetchStats = useCallback(async () => {
    setStatsError(false);
    try {
      const response = await fetch("/api/v1/quiz/stats", { cache: "no-store" });
      if (!response.ok) throw new Error("통계를 불러오지 못했습니다.");
      setStats((await response.json()) as StatsData);
    } catch {
      setStatsError(true);
    }
  }, []);

  const answerSurvey = useCallback(async (question: QuizSurveyQuestion, optionIds: string[]) => {
    setSurveySaving(true);
    setSurveyError("");
    try {
      const response = await fetch("/api/v1/quiz/survey-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: getOrCreateSessionId(),
          runId,
          questionId: question.id,
          optionIds,
        }),
        keepalive: true,
      });
      if (!response.ok) throw new Error("설문 응답을 저장하지 못했습니다.");
      setSurveyIndex((current) => current + 1);
    } catch {
      setSurveyError("응답을 저장하지 못했습니다. 다시 눌러주세요.");
    } finally {
      setSurveySaving(false);
    }
  }, [runId]);

  const toggleSurveyOption = (questionId: string, optionId: string) => {
    setSurveySelections((current) => {
      const selected = current[questionId] ?? [];
      return {
        ...current,
        [questionId]: selected.includes(optionId)
          ? selected.filter((id) => id !== optionId)
          : [...selected, optionId],
      };
    });
    setSurveyError("");
  };

  const cardsCompleted = cards.length > 0 && currentIndex >= cards.length;
  const completed = cardsCompleted && surveyIndex >= surveyQuestions.length;

  useEffect(() => {
    if (completed && runId && !completedRuns.current.has(runId)) {
      completedRuns.current.add(runId);
      void postLog({ cardId: "quiz", cardType: cards[0]?.type ?? "origin", response: "complete", runId, step: cards.length });
      const timer = window.setTimeout(() => void fetchStats(), 350);
      return () => window.clearTimeout(timer);
    }
  }, [cards, completed, fetchStats, postLog, runId]);

  const personal = useMemo(() => {
    const build = (type: QuizCardData["type"]) => {
      const selected = cards.filter((card) => card.type === type);
      return {
        total: selected.length,
        know: selected.filter((card) => responses[card.id] === "know").length,
      };
    };
    return { minor: build("minor"), origin: build("origin") };
  }, [cards, responses]);

  if (loading) {
    return <StatusState icon={<RefreshCw className="animate-spin" size={30} />} title="카드를 섞는 중..." />;
  }

  if (error) {
    return (
      <StatusState icon={<AlertCircle size={38} />} title="퀴즈를 불러오지 못했습니다." description={error}>
        <Button onClick={() => void fetchCards()}>다시 시도</Button>
      </StatusState>
    );
  }

  if (cards.length === 0) {
    return (
      <StatusState
        icon={<ArrowLeftRight size={38} />}
        title="공개된 퀴즈 카드가 아직 없어요."
        description="관리자에서 사전 항목을 공개하면 최대 5개 카드가 자동으로 구성됩니다."
      />
    );
  }

  return (
    <QuizShell>
      {!cardsCompleted ? (
        <div className="flex min-h-0 w-full max-w-md flex-1 flex-col items-center gap-2">
          <div className="w-full shrink-0 space-y-1 text-center">
            <h1 className="flex items-center justify-center gap-2 text-lg font-black tracking-tight text-neutral-900">
              <ArrowLeftRight className="text-[var(--vo-color-brand)]" size={20} />
              밈 인지도 매치 테스트
            </h1>
            <p className="text-xs font-medium text-neutral-500">
              알면 오른쪽, 모르면 왼쪽으로 넘겨주세요.
            </p>
            <div className="flex items-center justify-between px-2 pt-1 text-[0.68rem] font-bold text-neutral-400">
              <span>PROGRESS</span>
              <span>{currentIndex + 1} / {cards.length}</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-200">
              <div
                className="h-full bg-[var(--vo-color-brand)] transition-all duration-300"
                style={{ width: `${percentage(currentIndex, cards.length)}%` }}
              />
            </div>
          </div>

          <div className="relative flex min-h-0 w-full flex-1 items-center justify-center">
            {cards.map((card, index) => (
              <QuizCard
                key={`${runId}:${card.id}`}
                card={card}
                active={index === currentIndex}
                onSwipe={handleSwipe}
                onInteraction={() => setShowSwipeHint(false)}
                onPlayMedia={() => void sendLog(card, "view_media", { destination: card.video?.url, step: currentIndex + 1 })}
                showSwipeHint={showSwipeHint && currentIndex === 0}
                onViewDetail={() => {
                  setSelectedCard(card);
                  void sendLog(card, "view_detail", { destination: memeHref(card.slug), step: currentIndex + 1 });
                }}
              />
            ))}
          </div>

          <div className="flex w-full shrink-0 items-center justify-between gap-2 px-1">
            <button className="flex-1 cursor-pointer rounded-xl bg-black px-3 py-2.5 text-xs font-black text-white shadow-sm hover:bg-black/80" onClick={() => handleSwipe("left")}>
              몰라요 (NO)
            </button>
            <button className="flex-1 cursor-pointer rounded-xl bg-[#fe2c55] px-3 py-2.5 text-xs font-black text-white shadow-sm hover:bg-[#e51f48]" onClick={() => handleSwipe("right")}>
              알아요 (KNOW)
            </button>
          </div>
        </div>
      ) : !completed ? (
        <div className="flex min-h-0 w-full max-w-md flex-1 flex-col justify-center gap-5">
          <div className="space-y-2 text-center">
            <p className="text-xs font-black tracking-[0.14em] text-[var(--vo-color-brand)]">BEFORE RESULT</p>
            <h1 className="text-2xl font-black tracking-tight">결과 보기 전, 마지막 질문</h1>
            <p className="text-xs text-neutral-500">해당되는 경험을 모두 선택해 주세요. 아무것도 없으면 선택 없이 넘어갈 수 있어요.</p>
            <div className="mx-auto mt-3 h-1.5 w-full overflow-hidden rounded-full bg-neutral-200">
              <div className="h-full bg-[var(--vo-color-brand)] transition-all" style={{ width: `${percentage(surveyIndex + 1, surveyQuestions.length)}%` }} />
            </div>
          </div>
          {surveyQuestions[surveyIndex] && (
            <Card className="space-y-4 border border-black/5 p-5 shadow-lg">
              <div>
                <p className="text-xs font-bold text-neutral-400">{surveyIndex + 1} / {surveyQuestions.length}</p>
                <h2 className="mt-2 text-lg font-black leading-snug">{surveyQuestions[surveyIndex].prompt}</h2>
              </div>
              <div className="grid gap-2">
                {surveyQuestions[surveyIndex].options.map((option) => surveyQuestions[surveyIndex].multiple ? (
                  <label
                    className="flex cursor-pointer items-start gap-3 rounded-xl border border-black/5 bg-neutral-50 px-4 py-3 text-sm font-bold leading-5 transition hover:border-[var(--vo-color-brand)] hover:bg-white"
                    key={option.id}
                  >
                    <input
                      checked={(surveySelections[surveyQuestions[surveyIndex].id] ?? []).includes(option.id)}
                      className="mt-0.5 size-4 shrink-0 accent-[var(--vo-color-brand)]"
                      onChange={() => toggleSurveyOption(surveyQuestions[surveyIndex].id, option.id)}
                      type="checkbox"
                    />
                    <span>{option.label}</span>
                  </label>
                ) : (
                  <button
                    className="cursor-pointer rounded-xl border border-black/5 bg-neutral-50 px-4 py-3 text-left text-sm font-bold transition hover:border-[var(--vo-color-brand)] hover:bg-white disabled:cursor-wait disabled:opacity-50"
                    disabled={surveySaving}
                    key={option.id}
                    onClick={() => void answerSurvey(surveyQuestions[surveyIndex], [option.id])}
                    type="button"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              {surveyQuestions[surveyIndex].multiple ? (
                <Button
                  className="w-full"
                  disabled={surveySaving || (surveyQuestions[surveyIndex].required && !(surveySelections[surveyQuestions[surveyIndex].id]?.length))}
                  onClick={() => void answerSurvey(surveyQuestions[surveyIndex], surveySelections[surveyQuestions[surveyIndex].id] ?? [])}
                  type="button"
                >
                  {surveySaving ? "저장 중..." : surveyIndex === surveyQuestions.length - 1 ? "결과 보기" : "다음"}
                </Button>
              ) : !surveyQuestions[surveyIndex].required && (
                <button className="w-full cursor-pointer py-1 text-xs font-bold text-neutral-400 hover:text-neutral-700 disabled:cursor-wait disabled:opacity-50" disabled={surveySaving} onClick={() => void answerSurvey(surveyQuestions[surveyIndex], [])} type="button">
                  건너뛰기
                </button>
              )}
              {surveyError && <p className="text-center text-xs font-bold text-rose-600" role="alert">{surveyError}</p>}
            </Card>
          )}
        </div>
      ) : (
        <div className="flex min-h-0 w-full max-w-md flex-1 flex-col justify-center gap-2">
          <div className="space-y-1 text-center">
            <CheckCircle className="mx-auto text-emerald-600" size={30} />
            <h1 className="text-2xl font-black tracking-tight">테스트 완료!</h1>
            <p className="text-xs text-neutral-500">내 결과와 다른 참여자의 인지도를 함께 확인해보세요.</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <PersonalResult title="코리아 마이너 밈" accent="var(--vo-color-brand)" {...personal.minor} />
            <PersonalResult title="그 외 밈·챌린지" accent="var(--vo-color-signal)" {...personal.origin} />
          </div>

          <Card className="border border-black/5 p-2.5">
            <div className="flex items-center justify-between px-1"><h2 className="text-xs font-black">내가 진행한 5개</h2><span className="text-[0.62rem] font-bold text-black/30">상세 페이지로 이동</span></div>
            <div className="mt-1.5 grid gap-1">{cards.map((card) => <Link className="flex min-w-0 items-center gap-2 rounded-lg bg-[#f7f7f8] px-2.5 py-1.5 text-xs font-bold" href={memeHref(card.slug)} key={card.id} onClick={() => void sendLog(card, "open_meme", { destination: memeHref(card.slug), step: cards.length })}><span className={`size-2 shrink-0 rounded-full ${responses[card.id] === "know" ? "bg-[#087b77]" : "bg-[#fe2c55]"}`} /><span className="min-w-0 flex-1 truncate">{card.title}</span><span className="shrink-0 text-[0.6rem] text-black/40">더 알아보기</span><ArrowUpRight className="size-3 shrink-0" /></Link>)}</div>
          </Card>

          <Card className="space-y-2 border border-black/5 p-3 shadow-lg">
            <div className="flex items-center gap-2">
              <BarChart3 size={21} />
              <div>
                <h2 className="text-sm font-black">다른 사람들은?</h2>
              </div>
            </div>
            {statsError ? (
              <div className="rounded-xl bg-neutral-50 p-4 text-center text-sm text-neutral-500">
                누적 통계를 불러오지 못했습니다. 내 응답은 위에서 확인할 수 있어요.
              </div>
            ) : stats ? (
              <div className="grid grid-cols-3 gap-2">
                <Metric label="마이너 밈 인지도" value={`${percentage(stats.stats.minor.know, stats.stats.minor.total)}%`} />
                <Metric label="그 외 인지도" value={`${percentage(stats.stats.origin.know, stats.stats.origin.total)}%`} />
                <Metric
                  label="영상 확인"
                  value={`${stats.stats.minor.view_detail + stats.stats.origin.view_detail}회`}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 py-5 text-sm text-neutral-400"><RefreshCw className="animate-spin" size={16} /> 통계 불러오는 중...</div>
            )}
          </Card>

          <div className="grid grid-cols-2 gap-2">
            <Button className="w-full whitespace-nowrap" size="sm" variant="secondary" onClick={() => void fetchCards()}>테스트 다시 하기</Button>
            <Link className={buttonClassName({ size: "sm", className: "w-full whitespace-nowrap" })} href="/" onClick={() => void postLog({ cardId: "home", cardType: cards[0]?.type ?? "origin", response: "open_service", runId, step: cards.length, destination: "/" })}><Home className="size-4" />서비스 보러 가기</Link>
          </div>
        </div>
      )}

      {selectedCard && (
        <QuizDetailModal
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
          onOpenPage={() => void sendLog(selectedCard, "open_meme", { destination: memeHref(selectedCard.slug), step: currentIndex + 1 })}
        />
      )}
    </QuizShell>
  );
}

function QuizShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-[100dvh] w-full items-center justify-center overflow-hidden bg-white md:bg-[#f4f4f5] md:p-6">
      <main className="relative flex h-[100dvh] w-full touch-none flex-col items-center overflow-hidden overscroll-none bg-white px-3 py-3 md:h-[min(900px,calc(100dvh-3rem))] md:max-w-[430px] md:rounded-[2rem] md:border md:border-black/10 md:px-4 md:py-5 md:shadow-[0_24px_80px_rgba(0,0,0,0.14)]">
        {children}
      </main>
    </div>
  );
}

function StatusState({ icon, title, description, children }: { icon: ReactNode; title: string; description?: string; children?: ReactNode }) {
  return (
    <QuizShell>
      <div className="flex min-h-0 w-full flex-1 flex-col items-center justify-center gap-3 p-4 text-center text-neutral-500">
        <div className="text-[var(--vo-color-brand)]">{icon}</div>
        <h1 className="text-xl font-black text-neutral-900">{title}</h1>
        {description && <p className="max-w-md text-sm leading-6">{description}</p>}
        {children}
      </div>
    </QuizShell>
  );
}

function PersonalResult({ title, know, total, accent }: { title: string; know: number; total: number; accent: string }) {
  return (
    <Card className="space-y-2 border border-black/5 p-3">
      <div className="flex items-end justify-between gap-2"><h2 className="text-xs font-black">{title}</h2><strong className="shrink-0 text-xs">{total > 0 ? `${know} / ${total}` : "출제 없음"}</strong></div>
      <div className="h-2.5 overflow-hidden rounded-full bg-neutral-100"><div className="h-full rounded-full" style={{ background: accent, width: `${percentage(know, total)}%` }} /></div>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-neutral-50 p-2 text-center"><p className="text-[0.62rem] font-bold text-neutral-400">{label}</p><p className="mt-1 text-lg font-black">{value}</p></div>;
}

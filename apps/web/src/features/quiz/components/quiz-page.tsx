"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { AlertCircle, ArrowLeftRight, BarChart3, CheckCircle, RefreshCw } from "lucide-react";

import { Button, Card } from "@origin/ui";

import { getOrCreateSessionId } from "../utils/session";
import { QuizCard } from "./quiz-card";
import { QuizDetailModal } from "./quiz-detail-modal";

interface QuizCardData {
  id: string;
  title: string;
  summary: string;
  type: "minor" | "origin";
  thumbnailUrl?: string;
  accentColor?: string;
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

interface StatsData {
  totalLogs: number;
  stats: { minor: QuizTypeStats; origin: QuizTypeStats };
}

type QuizResponse = "know" | "dont_know" | "view_detail" | "helpful" | "not_helpful";

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
  const [sessionId, setSessionId] = useState("");

  useEffect(() => {
    Promise.resolve().then(() => setSessionId(getOrCreateSessionId()));
  }, []);

  const fetchCards = useCallback(async () => {
    setLoading(true);
    setError(null);
    setStats(null);
    setStatsError(false);
    try {
      const response = await fetch("/api/v1/quiz/cards", { cache: "no-store" });
      if (!response.ok) throw new Error("퀴즈 카드를 불러오지 못했습니다.");
      const data = (await response.json()) as { cards?: QuizCardData[] };
      setCards(Array.isArray(data.cards) ? data.cards : []);
      setCurrentIndex(0);
      setResponses({});
    } catch (cause) {
      setCards([]);
      setError(cause instanceof Error ? cause.message : "퀴즈 카드를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(() => void fetchCards());
  }, [fetchCards]);

  const sendLog = useCallback(async (card: QuizCardData, response: QuizResponse) => {
    const activeSessionId = sessionId || getOrCreateSessionId();
    if (!activeSessionId) return;
    try {
      await fetch("/api/v1/quiz/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: activeSessionId, cardId: card.id, cardType: card.type, response }),
        keepalive: true,
      });
    } catch {
      // 퀴즈 진행은 분석 로그 저장 실패와 독립적으로 유지한다.
    }
  }, [sessionId]);

  const handleSwipe = (direction: "left" | "right") => {
    const card = cards[currentIndex];
    if (!card) return;
    const answer = direction === "right" ? "know" : "dont_know";
    setResponses((current) => ({ ...current, [card.id]: answer }));
    void sendLog(card, answer);
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

  useEffect(() => {
    if (cards.length > 0 && currentIndex >= cards.length) {
      const timer = window.setTimeout(() => void fetchStats(), 250);
      return () => window.clearTimeout(timer);
    }
  }, [cards.length, currentIndex, fetchStats]);

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

  const completed = currentIndex >= cards.length;

  return (
    <div className="flex h-[100dvh] w-full flex-col items-center overflow-hidden px-3 py-3 sm:page-shell sm:min-h-[80vh] sm:h-auto sm:overflow-visible sm:py-8">
      {!completed ? (
        <div className="flex min-h-0 w-full max-w-md flex-1 flex-col items-center gap-2 sm:flex-none sm:gap-6">
          <div className="w-full shrink-0 space-y-1 text-center sm:space-y-2">
            <h1 className="flex items-center justify-center gap-2 text-lg font-black tracking-tight text-neutral-900 sm:text-2xl">
              <ArrowLeftRight className="text-[var(--vo-color-brand)]" size={20} />
              밈 인지도 매치 테스트
            </h1>
            <p className="text-xs font-medium text-neutral-500 sm:text-sm">
              알면 오른쪽, 모르면 왼쪽으로 넘겨주세요.
            </p>
            <div className="flex items-center justify-between px-2 pt-1 text-[0.68rem] font-bold text-neutral-400 sm:pt-2 sm:text-xs">
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

          <div className="relative flex min-h-0 w-full flex-1 items-center justify-center sm:aspect-[3/4.5] sm:flex-none">
            {cards.map((card, index) => (
              <QuizCard
                key={card.id}
                card={card}
                active={index === currentIndex}
                onSwipe={handleSwipe}
                onViewDetail={() => {
                  setSelectedCard(card);
                  void sendLog(card, "view_detail");
                }}
              />
            ))}
          </div>

          <div className="flex w-full shrink-0 items-center justify-between gap-2 px-1 sm:gap-4 sm:px-4">
            <button className="flex-1 cursor-pointer rounded-xl border border-rose-200 px-3 py-2.5 text-xs font-extrabold text-rose-500 hover:bg-rose-50 sm:px-4 sm:py-3 sm:text-sm" onClick={() => handleSwipe("left")}>
              몰라요 (NO)
            </button>
            <button className="flex-1 cursor-pointer rounded-xl border border-emerald-200 px-3 py-2.5 text-xs font-extrabold text-emerald-600 hover:bg-emerald-50 sm:px-4 sm:py-3 sm:text-sm" onClick={() => handleSwipe("right")}>
              알아요 (KNOW)
            </button>
          </div>
        </div>
      ) : (
        <div className="flex min-h-0 w-full max-w-2xl flex-1 flex-col justify-center gap-3 sm:flex-none sm:gap-7">
          <div className="space-y-1 text-center sm:space-y-2">
            <CheckCircle className="mx-auto text-emerald-600" size={30} />
            <h1 className="text-2xl font-black tracking-tight sm:text-3xl">테스트 완료!</h1>
            <p className="text-xs text-neutral-500 sm:text-sm">내 인지도와 설명 도움률을 나눠서 보여드려요.</p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-4">
            <PersonalResult title="코리아 마이너 밈" accent="var(--vo-color-brand)" {...personal.minor} />
            <PersonalResult title="그 외 밈·챌린지" accent="var(--vo-color-signal)" {...personal.origin} />
          </div>

          <Card className="space-y-3 border border-black/5 p-4 shadow-lg sm:space-y-5 sm:p-6">
            <div className="flex items-center gap-2">
              <BarChart3 size={21} />
              <div>
                <h2 className="font-black">전체 누적 효과</h2>
                <p className="text-xs text-neutral-400">인지도 응답과 상세 설명 피드백만 집계합니다.</p>
              </div>
            </div>
            {statsError ? (
              <div className="rounded-xl bg-neutral-50 p-4 text-center text-sm text-neutral-500">
                누적 통계를 불러오지 못했습니다. 내 응답은 위에서 확인할 수 있어요.
              </div>
            ) : stats ? (
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <Metric label="마이너 밈 인지도" value={`${percentage(stats.stats.minor.know, stats.stats.minor.total)}%`} />
                <Metric label="그 외 인지도" value={`${percentage(stats.stats.origin.know, stats.stats.origin.total)}%`} />
                <Metric
                  label="설명 도움률"
                  value={stats.stats.minor.feedbackTotal + stats.stats.origin.feedbackTotal > 0
                    ? `${percentage(stats.stats.minor.helpful + stats.stats.origin.helpful, stats.stats.minor.feedbackTotal + stats.stats.origin.feedbackTotal)}%`
                    : "집계 전"}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 py-5 text-sm text-neutral-400"><RefreshCw className="animate-spin" size={16} /> 통계 불러오는 중...</div>
            )}
          </Card>

          <Button className="mx-auto" size="sm" onClick={() => void fetchCards()}>테스트 다시 하기</Button>
        </div>
      )}

      {selectedCard && (
        <QuizDetailModal
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
          onFeedback={(helpful) => {
            void sendLog(selectedCard, helpful ? "helpful" : "not_helpful");
            setSelectedCard(null);
          }}
        />
      )}
    </div>
  );
}

function StatusState({ icon, title, description, children }: { icon: ReactNode; title: string; description?: string; children?: ReactNode }) {
  return (
    <div className="flex h-[100dvh] w-full flex-col items-center justify-center gap-3 overflow-hidden p-4 text-center text-neutral-500 sm:page-shell sm:min-h-[65vh] sm:h-auto">
      <div className="text-[var(--vo-color-brand)]">{icon}</div>
      <h1 className="text-xl font-black text-neutral-900">{title}</h1>
      {description && <p className="max-w-md text-sm leading-6">{description}</p>}
      {children}
    </div>
  );
}

function PersonalResult({ title, know, total, accent }: { title: string; know: number; total: number; accent: string }) {
  return (
    <Card className="space-y-2 border border-black/5 p-3 sm:space-y-3 sm:p-5">
      <div className="flex items-end justify-between gap-3"><h2 className="font-black">{title}</h2><strong>{total > 0 ? `${know} / ${total}` : "출제 없음"}</strong></div>
      <div className="h-2.5 overflow-hidden rounded-full bg-neutral-100"><div className="h-full rounded-full" style={{ background: accent, width: `${percentage(know, total)}%` }} /></div>
      <p className="text-xs text-neutral-400">{total > 0 ? `내가 알고 있다고 답한 비율 ${percentage(know, total)}%` : "이번 카드 묶음에는 포함되지 않았어요."}</p>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-neutral-50 p-2 text-center sm:p-4"><p className="text-[0.62rem] font-bold text-neutral-400 sm:text-xs">{label}</p><p className="mt-1 text-lg font-black sm:text-2xl">{value}</p></div>;
}

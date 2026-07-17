"use client";

import { useState, useEffect, useCallback } from "react";
import { getOrCreateSessionId } from "../utils/session";
import { QuizCard } from "./quiz-card";
import { QuizDetailModal } from "./quiz-detail-modal";
import { Button, Card } from "@origin/ui";
import { RefreshCw, CheckCircle, BarChart3, AlertCircle, ArrowLeftRight, Flame, Landmark } from "lucide-react";

interface QuizCardData {
  id: string;
  title: string;
  summary: string;
  type: "minor" | "origin";
  thumbnailUrl: string;
  accentColor?: string;
  originDetail: {
    creator?: string;
    originYear?: number;
    platform?: string;
    description: string;
  };
}

interface StatsData {
  totalLogs: number;
  stats: {
    minor: { know: number; dont_know: number; view_detail: number; total: number };
    origin: { know: number; dont_know: number; view_detail: number; total: number };
  };
}

export function QuizPage() {
  const [cards, setCards] = useState<QuizCardData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<QuizCardData | null>(null);
  
  // 사용자의 스와이프 응답 기록
  const [responses, setResponses] = useState<Record<string, "know" | "dont_know">>({});

  // 전체 통계 데이터
  const [stats, setStats] = useState<StatsData | null>(null);

  // 세션 ID 가져오기
  const [sessionId, setSessionId] = useState("");
  useEffect(() => {
    Promise.resolve().then(() => {
      setSessionId(getOrCreateSessionId());
    });
  }, []);

  // 카드 목록 조회
  const fetchCards = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/quiz/cards");
      if (!res.ok) throw new Error("카드 목록을 불러오지 못했습니다.");
      const data = await res.json();
      setCards(data.cards || []);
      setCurrentIndex(0);
      setResponses({});
      setStats(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchCards();
    });
  }, [fetchCards]);

  // 로그 전송
  const sendLog = async (cardId: string, cardType: "minor" | "origin", response: "know" | "dont_know" | "view_detail") => {
    if (!sessionId) return;
    try {
      await fetch("/api/v1/quiz/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          cardId,
          cardType,
          response,
        }),
      });
    } catch (err) {
      console.error("로그 저장 실패:", err);
    }
  };

  // 스와이프 핸들러
  const handleSwipe = (direction: "left" | "right") => {
    if (currentIndex >= cards.length) return;
    
    const card = cards[currentIndex];
    const answer = direction === "right" ? "know" : "dont_know";
    
    setResponses((prev) => ({ ...prev, [card.id]: answer }));
    
    // 로그 전송
    sendLog(card.id, card.type, answer);

    // 다음 카드로 이동
    setCurrentIndex((prev) => prev + 1);
  };

  // 상세 보기 핸들러
  const handleViewDetail = () => {
    if (currentIndex >= cards.length) return;
    const card = cards[currentIndex];
    setSelectedCard(card);
    
    // 로그 전송
    sendLog(card.id, card.type, "view_detail");
  };

  // 퀴즈 소진 시 누적 통계 조회
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/quiz/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error("통계 가져오기 실패:", err);
    }
  }, []);

  useEffect(() => {
    if (currentIndex === cards.length && cards.length > 0) {
      Promise.resolve().then(() => {
        fetchStats();
      });
    }
  }, [currentIndex, cards.length, fetchStats]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <RefreshCw className="animate-spin text-neutral-400" size={32} />
        <p className="text-neutral-500 font-medium">카드를 섞는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center p-4">
        <AlertCircle className="text-rose-500" size={40} />
        <h3 className="text-lg font-bold">오류가 발생했습니다</h3>
        <p className="text-neutral-500 max-w-sm">{error}</p>
        <Button onClick={fetchCards} className="mt-2">
          다시 시도
        </Button>
      </div>
    );
  }

  const isCompleted = currentIndex >= cards.length;

  return (
    <div className="page-shell py-8 min-h-[80vh] flex flex-col items-center">
      
      {!isCompleted ? (
        <div className="w-full max-w-md flex flex-col items-center gap-6">
          {/* 타이틀 및 진행 상태 */}
          <div className="w-full text-center space-y-2">
            <h1 className="text-2xl font-black tracking-tight text-neutral-900 dark:text-white flex items-center justify-center gap-2">
              <ArrowLeftRight className="text-[var(--vo-color-brand)]" size={24} />
              밈 인지도 매치 테스트
            </h1>
            <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
              아는 것은 <strong className="text-emerald-600">오른쪽(KNOW)</strong>, 모르는 것은 <strong className="text-rose-500">왼쪽(NO)</strong>으로 스와이프 하세요.
            </p>
            <div className="flex justify-between items-center text-xs font-bold text-neutral-400 px-2 pt-2">
              <span>PROGRESS</span>
              <span>{currentIndex + 1} / {cards.length} CARDS</span>
            </div>
            {/* 프로그레스 바 */}
            <div className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[var(--vo-color-brand)] transition-all duration-300"
                style={{ width: `${((currentIndex) / cards.length) * 100}%` }}
              />
            </div>
          </div>

          {/* 카드 덱 영역 */}
          <div className="relative w-full aspect-[3/4.5] flex items-center justify-center">
            {cards.map((card, index) => (
              <QuizCard
                key={card.id}
                card={card}
                active={index === currentIndex}
                onSwipe={handleSwipe}
                onViewDetail={handleViewDetail}
              />
            ))}
          </div>

          {/* 보조 버튼 안내 */}
          <div className="w-full flex justify-between items-center gap-4 px-4">
            <button
              onClick={() => handleSwipe("left")}
              className="flex-1 py-3 px-4 border border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-500 dark:text-rose-400 rounded-xl text-sm font-extrabold flex items-center justify-center gap-1.5 transition-colors"
            >
              몰라요 (NO)
            </button>
            <button
              onClick={() => handleSwipe("right")}
              className="flex-1 py-3 px-4 border border-emerald-200 dark:border-emerald-950/50 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-sm font-extrabold flex items-center justify-center gap-1.5 transition-colors"
            >
              알아요 (KNOW)
            </button>
          </div>
        </div>
      ) : (
        /* 결과 분석 리포트 화면 */
        <div className="w-full max-w-2xl flex flex-col gap-8 animate-in fade-in duration-500">
          
          {/* 헤더 */}
          <div className="text-center space-y-3">
            <div className="inline-flex p-3 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40 mb-2">
              <CheckCircle size={32} />
            </div>
            <h1 className="text-3xl font-black text-neutral-950 dark:text-white tracking-tight">
              테스트 완료!
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm max-w-md mx-auto">
              마이너 밈과 원조 챌린지에 대한 인지도를 분석했습니다. 당신의 성향을 확인해 보세요.
            </p>
          </div>

          {/* 내 스와이프 성향 분석 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* 코리아 마이너 밈 성향 */}
            <Card className="p-6 border border-neutral-200/50 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-lg rounded-[var(--vo-radius-lg)] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className="text-[var(--vo-color-brand)]" size={20} />
                  <h3 className="font-extrabold text-neutral-900 dark:text-neutral-50">
                    코리아 마이너 밈
                  </h3>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 bg-rose-50 dark:bg-rose-950/20 text-rose-500 border border-rose-100 dark:border-rose-900/30 rounded-full">
                  서브컬처 성향
                </span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-neutral-400">
                  <span>알고 있음 (KNOW)</span>
                  <span>
                    {cards.filter(c => c.type === "minor" && responses[c.id] === "know").length} / {cards.filter(c => c.type === "minor").length} 개
                  </span>
                </div>
                {/* 진행 게이지 */}
                <div className="w-full h-3 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[var(--vo-color-brand)]"
                    style={{ 
                      width: `${(cards.filter(c => c.type === "minor" && responses[c.id] === "know").length / cards.filter(c => c.type === "minor").length) * 100}%` 
                    }}
                  />
                </div>
              </div>
              <p className="text-xs text-neutral-400 dark:text-neutral-500 leading-relaxed font-medium">
                특정 인터넷 방송이나 매니아 커뮤니티에서 번져나간 마이너한 한국식 유행어에 대한 인지도 수치입니다.
              </p>
            </Card>

            {/* 원조 챌린지 성향 */}
            <Card className="p-6 border border-neutral-200/50 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-lg rounded-[var(--vo-radius-lg)] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Landmark className="text-[var(--vo-color-signal)]" size={20} />
                  <h3 className="font-extrabold text-neutral-900 dark:text-neutral-50">
                    원조 챌린지 밈
                  </h3>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 border border-emerald-100 dark:border-emerald-900/30 rounded-full">
                  글로벌 트렌드
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-neutral-400">
                  <span>알고 있음 (KNOW)</span>
                  <span>
                    {cards.filter(c => c.type === "origin" && responses[c.id] === "know").length} / {cards.filter(c => c.type === "origin").length} 개
                  </span>
                </div>
                {/* 진행 게이지 */}
                <div className="w-full h-3 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[var(--vo-color-signal)]"
                    style={{ 
                      width: `${(cards.filter(c => c.type === "origin" && responses[c.id] === "know").length / cards.filter(c => c.type === "origin").length) * 100}%` 
                    }}
                  />
                </div>
              </div>
              <p className="text-xs text-neutral-400 dark:text-neutral-500 leading-relaxed font-medium">
                음원, 글로벌 댄스, 틱톡 및 인스타그램 숏폼을 중심으로 한 원작 확산형 챌린지 인지도입니다.
              </p>
            </Card>

          </div>

          {/* 전체 누적 수요 비교 그래프 (A/B 검증용) */}
          <Card className="p-6 border border-neutral-200/50 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xl rounded-[var(--vo-radius-lg)] space-y-6">
            <div className="flex items-center gap-2 border-b border-neutral-100 dark:border-neutral-800 pb-4">
              <BarChart3 className="text-neutral-700 dark:text-neutral-300" size={22} />
              <div>
                <h3 className="font-extrabold text-lg text-neutral-950 dark:text-neutral-50">
                  대중들의 관심 및 수요 비교 분석
                </h3>
                <p className="text-xs text-neutral-400">
                  참여한 사람들의 누적 데이터를 기반으로 한 수요 통계 분석표입니다.
                </p>
              </div>
            </div>

            {stats ? (
              <div className="space-y-6">
                
                {/* 마이너 밈 통계 */}
                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-sm font-bold text-neutral-700 dark:text-neutral-300">
                      코리아 마이너 밈 누적 인지도 비율 (Know)
                    </span>
                    <span className="text-sm font-black text-[var(--vo-color-brand)]">
                      {stats.stats.minor.total > 0 
                        ? `${Math.round((stats.stats.minor.know / stats.stats.minor.total) * 100)}%` 
                        : "0%"}
                    </span>
                  </div>
                  <div className="w-full h-4 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[var(--vo-color-brand)] rounded-full"
                      style={{ 
                        width: stats.stats.minor.total > 0 
                          ? `${(stats.stats.minor.know / stats.stats.minor.total) * 100}%` 
                          : "0%" 
                      }}
                    />
                  </div>
                </div>

                {/* 원조 챌린지 통계 */}
                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-sm font-bold text-neutral-700 dark:text-neutral-300">
                      원조 챌린지 밈 누적 인지도 비율 (Know)
                    </span>
                    <span className="text-sm font-black text-[var(--vo-color-signal)]">
                      {stats.stats.origin.total > 0 
                        ? `${Math.round((stats.stats.origin.know / stats.stats.origin.total) * 100)}%` 
                        : "0%"}
                    </span>
                  </div>
                  <div className="w-full h-4 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[var(--vo-color-signal)] rounded-full"
                      style={{ 
                        width: stats.stats.origin.total > 0 
                          ? `${(stats.stats.origin.know / stats.stats.origin.total) * 100}%` 
                          : "0%" 
                      }}
                    />
                  </div>
                </div>

                {/* 상세 보기 열람(수요) 비교 */}
                <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800/80 grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-rose-50/40 dark:bg-rose-950/10 border border-rose-100/50 dark:border-rose-900/20 text-center">
                    <p className="text-xs text-neutral-400 dark:text-neutral-500 font-bold mb-1">
                      마이너 밈 상세정보 열람수
                    </p>
                    <p className="text-2xl font-black text-[var(--vo-color-brand)]">
                      {stats.stats.minor.view_detail}회
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/10 border border-emerald-100/50 dark:border-emerald-900/20 text-center">
                    <p className="text-xs text-neutral-400 dark:text-neutral-500 font-bold mb-1">
                      원조 챌린지 상세정보 열람수
                    </p>
                    <p className="text-2xl font-black text-[var(--vo-color-signal)]">
                      {stats.stats.origin.view_detail}회
                    </p>
                  </div>
                </div>

                <div className="text-center pt-2">
                  <p className="text-xs text-neutral-400 font-medium">
                    (총 누적 데이터 수: {stats.totalLogs}건)
                  </p>
                </div>

              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 gap-2 text-neutral-400">
                <RefreshCw className="animate-spin" size={20} />
                <p className="text-xs font-semibold">누적 통계를 불러오는 중...</p>
              </div>
            )}
          </Card>

          {/* 다시 하기 버튼 */}
          <div className="flex justify-center">
            <Button onClick={fetchCards} className="px-8 py-3 font-bold">
              테스트 다시 하기
            </Button>
          </div>

        </div>
      )}

      {/* 궁금해요 상세 모달 */}
      {selectedCard && (
        <QuizDetailModal
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
        />
      )}

    </div>
  );
}

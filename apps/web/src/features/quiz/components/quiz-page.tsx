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

const fallbackQuizCards: QuizCardData[] = [
  {
    id: "quiz-1",
    title: "아라라키 코코아",
    summary: "특이한 발음과 중독성 있는 멜로디로 한국 서브컬처 커뮤니티에서 유행한 마이너 밈",
    type: "minor",
    thumbnailUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop&q=60",
    accentColor: "#fe2c55",
    originDetail: {
      creator: "일본 버추얼 유튜버",
      originYear: 2024,
      platform: "youtube",
      description: "특정 게임 방송 중 흘러나온 리액션이 국내 트위치 및 유튜브 쇼츠로 편집되어 퍼지며 뇌절과 합성의 대상이 된 대표적 마이너 밈입니다."
    }
  },
  {
    id: "quiz-2",
    title: "디토 댄스 원조 챌린지",
    summary: "뉴진스의 Ditto 뮤뮤직비디오 댄스를 그대로 재현하며 시작된 글로벌 댄스 챌린지",
    type: "origin",
    thumbnailUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=500&auto=format&fit=crop&q=60",
    accentColor: "#25f4ee",
    originDetail: {
      creator: "뉴진스 (NewJeans)",
      originYear: 2022,
      platform: "tiktok",
      description: "Ditto 발매 직후 안무 연습 영상과 Y2K 감성의 캠코더 연출이 틱톡에서 큰 반향을 일으키며 수많은 크리에이터들이 챌린지에 참여했습니다."
    }
  },
  {
    id: "quiz-3",
    title: "어쩔티비 저쩔티비",
    summary: "상대방의 말문이 막히게 하기 위해 가전제품 이름을 뒤에 붙여 반박하는 초등학생 마이너 밈",
    type: "minor",
    thumbnailUrl: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=500&auto=format&fit=crop&q=60",
    accentColor: "#fe2c55",
    originDetail: {
      creator: "인터넷 커뮤니티",
      originYear: 2021,
      platform: "unknown",
      description: "어쩌라고와 가전제품(티비)이 합쳐져 유행했으며, 이후 쿠팡플레이 SNL 코리아 등 미디어에서 패러디되며 대중에게 널리 퍼진 밈입니다."
    }
  },
  {
    id: "quiz-4",
    title: "슬릭백 공중부양 챌린지",
    summary: "공중을 걷는 듯한 독특한 스텝으로 전 세계 2억 뷰 이상을 달성한 댄스 챌린지",
    type: "origin",
    thumbnailUrl: "https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?w=500&auto=format&fit=crop&q=60",
    accentColor: "#25f4ee",
    originDetail: {
      creator: "한국 중학생 크리에이터 (이효철)",
      originYear: 2023,
      platform: "tiktok",
      description: "해외 스케이트 스텝인 Jubi Slide를 초고속 슬라이딩 스텝으로 완벽히 재해석해 업로드한 영상이 알고리즘을 타고 글로벌 챌린지로 확대되었습니다."
    }
  },
  {
    id: "quiz-5",
    title: "홍박사님을 아세요?",
    summary: "조주봉 캐릭터의 가사와 엉덩이 댄스가 병맛 코드로 인기를 끈 소셜 플랫폼 밈",
    type: "minor",
    thumbnailUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=60",
    accentColor: "#fe2c55",
    originDetail: {
      creator: "개그맨 조훈",
      originYear: 2023,
      platform: "youtube",
      description: "독특하고 뻔뻔한 멜로디의 댄스 챌린지로 인기를 얻었으나 선정성 논란과 호불호가 갈리며 특정 커뮤니티 성향을 띠게 된 마이너 밈입니다."
    }
  },
  {
    id: "quiz-6",
    title: "마라탕후루 챌린지",
    summary: "선배 맘에 탕탕 후루후루라는 킬링 파트로 엄청난 양의 챌린지 커버를 양산한 원조 댄스 곡",
    type: "origin",
    thumbnailUrl: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=500&auto=format&fit=crop&q=60",
    accentColor: "#25f4ee",
    originDetail: {
      creator: "크리에이터 서이브",
      originYear: 2024,
      platform: "tiktok",
      description: "중독성 있는 멜로디와 초등학생의 최애 음식인 마라탕+탕후루를 조합한 가사에 쉬운 포인트 안무가 결합되어 최단기간 메이저 챌린지로 등극했습니다."
    }
  }
];

const fallbackStats: StatsData = {
  totalLogs: 120,
  stats: {
    minor: { know: 42, dont_know: 78, view_detail: 25, total: 120 },
    origin: { know: 96, dont_know: 24, view_detail: 12, total: 120 }
  }
};

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
      setCards(data.cards || fallbackQuizCards);
      setCurrentIndex(0);
      setResponses({});
      setStats(null);
    } catch (err) {
      console.warn("API 호출 실패, 로컬 폴백 데이터를 사용합니다:", err);
      setCards(fallbackQuizCards);
      setCurrentIndex(0);
      setResponses({});
      setStats(null);
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
      } else {
        setStats(fallbackStats);
      }
    } catch (err) {
      console.warn("통계 가져오기 실패, 로컬 폴백 데이터를 사용합니다:", err);
      setStats(fallbackStats);
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
    <div className={`w-full flex flex-col items-center justify-between overflow-hidden ${!isCompleted ? "h-[100dvh] py-4 px-4 sm:py-6" : "page-shell py-8 min-h-[80vh]"}`}>
      
      {!isCompleted ? (
        <div className="w-full max-w-sm flex-1 flex flex-col justify-between gap-3">
          {/* 타이틀 및 진행 상태 */}
          <div className="w-full text-center space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-neutral-400/80 px-1">
              <span className="flex items-center gap-1">
                <ArrowLeftRight className="text-[var(--vo-color-brand)] size-3.5" />
                MEME MATCH
              </span>
              <span>{currentIndex + 1} / {cards.length} CARDS</span>
            </div>
            
            {/* 프로그레스 바 */}
            <div className="w-full h-1 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden mt-1">
              <div 
                className="h-full bg-[var(--vo-color-brand)] transition-all duration-300"
                style={{ width: `${((currentIndex) / cards.length) * 100}%` }}
              />
            </div>
          </div>

          {/* 카드 덱 영역 - 스크롤 유발 최소화 */}
          <div className="flex-1 w-full flex items-center justify-center relative my-auto min-h-[360px] max-h-[55dvh] overflow-hidden">
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

          {/* 보조 버튼 안내 - 화면 바닥 밀착 */}
          <div className="w-full flex justify-between items-center gap-3 pb-2">
            <button
              onClick={() => handleSwipe("left")}
              className="flex-1 py-3 px-4 border border-rose-200 dark:border-rose-950/50 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-500 dark:text-rose-400 rounded-2xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-1.5 transition-colors"
            >
              몰라요 (NO)
            </button>
            <button
              onClick={() => handleSwipe("right")}
              className="flex-1 py-3 px-4 border border-emerald-200 dark:border-emerald-950/50 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-2xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-1.5 transition-colors"
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

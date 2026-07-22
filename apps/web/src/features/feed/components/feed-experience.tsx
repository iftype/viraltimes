"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import {
  LoaderCircle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  HelpCircle,
  Play,
} from "lucide-react";
import { Badge } from "@origin/ui";
import { VideoEmbed } from "@/features/video-embed/components/video-embed";
import { platformLabels } from "@/features/video-embed/lib/video-url";
import { memeHref } from "@/lib/meme-href";
import type { Meme, Video } from "@/types/meme";

function getFeedVideo(meme: Meme): Video | undefined {
  return meme.trendingVideos[0] ?? meme.origin.video;
}

function shuffled<T>(items: readonly T[]): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

export function FeedExperience() {
  const [memes, setMemes] = useState<Meme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  // 전역 음소거 지속 상태 (다음 영상으로 넘어가도 소리 상태 유지)
  const [globalMuted, setGlobalMuted] = useState(true);

  const rawMemesRef = useRef<Meme[]>([]);

  useEffect(() => {
    let active = true;
    fetch("/api/v1/memes?page=1&pageSize=30&sort=latest", { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) throw new Error("피드 데이터를 불러오지 못했습니다.");
        return (await res.json()) as { items: Meme[] };
      })
      .then((data) => {
        if (!active) return;
        const playableMemes = (data.items ?? []).filter((meme) =>
          Boolean(getFeedVideo(meme)),
        );
        rawMemesRef.current = playableMemes;
        setMemes(shuffled(playableMemes));
      })
      .catch((cause) => {
        if (!active) return;
        setError(cause instanceof Error ? cause.message : "오류가 발생했습니다.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  // 무한 랜덤 스크롤: 끝 3개 남았을 때 새로운 랜덤 배치 추가
  useEffect(() => {
    if (rawMemesRef.current.length > 0 && activeIndex >= memes.length - 3) {
      const nextBatch = shuffled(rawMemesRef.current);
      setMemes((prev) => [...prev, ...nextBatch]);
    }
  }, [activeIndex, memes.length]);

  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  // 네이티브 GPU 최적화 IntersectionObserver
  useEffect(() => {
    if (!memes.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute("data-index"));
            if (!isNaN(index)) {
              setActiveIndex((prev) => (prev !== index ? index : prev));
            }
          }
        });
      },
      {
        root: containerRef.current,
        threshold: 0.45,
      }
    );

    itemRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => {
      observer.disconnect();
    };
  }, [memes]);

  const scrollToNext = useCallback(() => {
    if (activeIndex < memes.length - 1) {
      itemRefs.current[activeIndex + 1]?.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeIndex, memes.length]);

  const scrollToPrev = useCallback(() => {
    if (activeIndex > 0) {
      itemRefs.current[activeIndex - 1]?.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeIndex]);

  return (
    <div className="relative h-[calc(100dvh-3.5rem)] w-full overflow-hidden bg-black text-white">
      {loading ? (
        <div className="flex size-full items-center justify-center">
          <LoaderCircle className="size-8 animate-spin text-white/40" />
        </div>
      ) : error ? (
        <div className="flex size-full items-center justify-center p-6 text-center text-sm font-bold text-rose-400">
          {error}
        </div>
      ) : memes.length === 0 ? (
        <div className="flex size-full items-center justify-center p-6 text-center text-sm font-bold text-white/40">
          등록된 유행 피드가 없습니다.
        </div>
      ) : (
        /* 네이티브 모바일 뷰포트 100% 꽉 채움 Strict Snap Container */
        <div
          ref={containerRef}
          className="h-full w-full overflow-y-scroll snap-y snap-mandatory overscroll-y-contain scroll-smooth no-scrollbar"
        >
          {memes.map((meme, index) => {
            const video = getFeedVideo(meme);
            if (!video) return null;

            const platform = video.platform;
            const platformName = platformLabels[platform] ?? platform;
            const isActive = index === activeIndex;

            // 시야에서 멀어진 오프스크린 영상 언마운트 (VM 인스턴스/네트워크 소켓 메모리 누수 방지)
            const shouldRenderVideo = Math.abs(index - activeIndex) <= 1;

            return (
              <div
                key={`${meme.id}-${index}`}
                data-index={index}
                ref={(el) => {
                  itemRefs.current[index] = el;
                }}
                className="relative flex h-full w-full snap-start snap-always shrink-0 flex-col items-center justify-center bg-black overflow-hidden"
              >
                {/* 100% 모바일 뷰포트 꽉 찬 비디오 구역 */}
                <div className="relative size-full max-w-[480px] flex flex-col justify-center">
                  {shouldRenderVideo ? (
                    <VideoEmbed
                      video={video}
                      autoPlayOnScroll={isActive}
                      feedMode={true}
                      isMuted={globalMuted}
                      onToggleMute={() => setGlobalMuted((prev) => !prev)}
                    />
                  ) : (
                    <div className="relative size-full bg-zinc-950 flex flex-col items-center justify-center text-white/20">
                      <Play className="size-12 animate-pulse" />
                    </div>
                  )}

                  {/* 틱톡 오버레이 최하단 정보 구역 */}
                  <div className="absolute left-0 right-0 bottom-0 z-20 p-4 sm:p-5 pb-3.5 pt-10 bg-gradient-to-t from-black/95 via-black/80 to-transparent text-left pointer-events-auto">
                    {/* "원본 영상을 안다면?" 제보/수정 지원 칩 (미확정 항목에만 표시) */}
                    {meme.origin.status !== "verified" && (
                      <div className="mb-2">
                        <Link
                          href={`/submit?type=request&slug=${meme.slug}`}
                          className="inline-flex items-center gap-1 rounded-full bg-amber-500/25 px-2.5 py-1 text-[0.65rem] font-extrabold text-amber-300 backdrop-blur-md hover:bg-amber-500/40 transition border border-amber-400/30"
                        >
                          <HelpCircle className="size-3" />
                          <span>원본 영상을 안다면? 수정 제보하기</span>
                        </Link>
                      </div>
                    )}

                    <div>
                      <a
                        className="inline-flex items-center gap-2 transition hover:opacity-85"
                        href={video.url}
                        rel="noreferrer"
                        target="_blank"
                        title={`${video.title} 원문 영상 열기`}
                      >
                        <span
                          className="flex size-7 items-center justify-center rounded-xl font-black text-white text-xs shadow-sm"
                          style={{ backgroundColor: meme.accent || "#fe2c55" }}
                        >
                          <Sparkles className="size-3.5" />
                        </span>
                        <span className="text-base font-black text-white tracking-tight hover:underline">
                          @{video.creator || "viral_origin"}
                        </span>
                        <Badge className="bg-white/20 text-white text-[0.68rem] font-bold backdrop-blur-md">
                          {platformName}
                        </Badge>
                      </a>

                      <a
                        className="group mt-2 block"
                        href={video.url}
                        rel="noreferrer"
                        target="_blank"
                        title={`${video.title} 원문 영상 열기`}
                      >
                        <h2 className="text-lg sm:text-xl font-black leading-snug text-white transition group-hover:text-rose-400">
                          {meme.title}
                        </h2>
                      </a>
                      <p className="mt-1 line-clamp-2 text-xs sm:text-sm leading-relaxed text-white/90 font-medium">
                        {meme.summary}
                      </p>
                    </div>

                    {/* 선명하게 띄워놓은 "밈의 원본이 궁금하다면?" CTA 버튼 */}
                    <div className="mt-3.5 flex items-center justify-between border-t border-white/15 pt-2.5">
                      <span className="text-[0.68rem] font-bold text-white/60">
                        {meme.lifecycle?.originYear ? `${meme.lifecycle.originYear}년 유행` : "바이럴 밈"}
                      </span>
                      <Link
                        href={memeHref(meme.slug)}
                        className="inline-flex items-center gap-1.5 rounded-full bg-rose-600 px-4 py-1.5 text-xs font-black text-white shadow-lg transition hover:bg-rose-700 active:scale-95"
                      >
                        <Sparkles className="size-3.5" />
                        <span>밈의 원본이 궁금하다면?</span>
                        <ExternalLink className="size-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 데스크톱 상/하 컨트롤러 화살표 (PC 조작 편의성) */}
      {memes.length > 0 && !loading && (
        <div className="hidden sm:flex fixed right-6 top-1/2 z-30 -translate-y-1/2 flex-col gap-3">
          <button
            type="button"
            onClick={scrollToPrev}
            disabled={activeIndex === 0}
            className="flex size-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition hover:bg-white/40 disabled:opacity-35"
            title="이전 영상 (위로)"
          >
            <ChevronUp className="size-6" />
          </button>
          <button
            type="button"
            onClick={scrollToNext}
            disabled={activeIndex === memes.length - 1}
            className="flex size-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition hover:bg-white/40 disabled:opacity-35"
            title="다음 영상 (아래로)"
          >
            <ChevronDown className="size-6" />
          </button>
        </div>
      )}
    </div>
  );
}

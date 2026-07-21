"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import {
  Flame,
  LoaderCircle,
  Sparkles,
  Share2,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Badge } from "@origin/ui";
import { VideoEmbed } from "@/features/video-embed/components/video-embed";
import { platformLabels } from "@/features/video-embed/lib/video-url";
import { memeHref } from "@/lib/meme-href";
import type { Meme } from "@/types/meme";

export function FeedExperience() {
  const [memes, setMemes] = useState<Meme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    let active = true;
    fetch("/api/v1/memes?page=1&pageSize=30&sort=latest", { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) throw new Error("피드 데이터를 불러오지 못했습니다.");
        return (await res.json()) as { items: Meme[] };
      })
      .then((data) => {
        if (!active) return;
        setMemes(data.items || []);
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
        threshold: 0.6,
      }
    );

    itemRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => {
      observer.disconnect();
    };
  }, [memes]);

  const handleShare = useCallback(async (meme: Meme) => {
    const url = `${window.location.origin}${memeHref(meme.slug)}`;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: meme.title,
          text: meme.summary,
          url,
        });
        return;
      } catch {
        // fallback
      }
    }
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      setCopiedId(meme.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  }, []);

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
            const video = meme.origin?.video;
            if (!video) return null;

            const platform = video.platform;
            const platformName = platformLabels[platform] ?? platform;
            const isActive = index === activeIndex;

            return (
              <div
                key={meme.id}
                data-index={index}
                ref={(el) => {
                  itemRefs.current[index] = el;
                }}
                className="relative flex h-full w-full snap-start snap-always shrink-0 flex-col items-center justify-center bg-black overflow-hidden"
              >
                {/* 100% 모바일 뷰포트 꽉 찬 비디오 구역 */}
                <div className="relative size-full max-w-[480px] flex flex-col justify-center">
                  <VideoEmbed video={video} autoPlayOnScroll={isActive} feedMode={true} />

                  {/* 틱톡 오버레이 상단 바 */}
                  <div className="absolute left-0 right-0 top-0 z-20 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none">
                    <div className="flex items-center gap-1.5 text-xs font-black text-rose-500 pointer-events-auto">
                      <Flame className="size-4" />
                      <span className="tracking-wider uppercase">VIRAL SHORTS</span>
                    </div>
                    <span className="rounded-full bg-black/50 px-3 py-1 text-[0.68rem] font-bold text-white/80 backdrop-blur-md pointer-events-auto">
                      {index + 1} / {memes.length}
                    </span>
                  </div>

                  {/* 틱톡 오버레이 우측 아이콘 액션 바 (공유 버튼) */}
                  <div className="absolute right-3 bottom-14 z-20 flex flex-col items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleShare(meme)}
                      className="flex size-11 flex-col items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md transition hover:scale-110 active:scale-95 shadow-md"
                      title="공유하기"
                    >
                      {copiedId === meme.id ? (
                        <CheckCircle2 className="size-5 text-emerald-400" />
                      ) : (
                        <Share2 className="size-5" />
                      )}
                      <span className="text-[0.6rem] font-bold mt-0.5">공유</span>
                    </button>
                  </div>

                  {/* 틱톡 오버레이 최하단 밀착 정보 구역 (클릭 시 밈 상세 설명 페이지로 즉시 이동) */}
                  <Link
                    href={memeHref(meme.slug)}
                    className="absolute left-0 right-0 bottom-0 z-20 block p-4 pb-3 pt-8 bg-gradient-to-t from-black/95 via-black/75 to-transparent text-left group transition hover:opacity-95"
                    title={`${meme.title} 상세 사전 보기`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="flex size-7 items-center justify-center rounded-xl font-black text-white text-xs shadow-sm"
                        style={{ backgroundColor: meme.accent || "#fe2c55" }}
                      >
                        <Sparkles className="size-3.5" />
                      </span>
                      <span className="text-sm font-black text-white tracking-tight group-hover:underline">
                        @{video.creator || "viral_origin"}
                      </span>
                      <Badge className="bg-white/20 text-white text-[0.65rem] font-bold backdrop-blur-md">
                        {platformName}
                      </Badge>
                    </div>

                    <h2 className="mt-1.5 text-base sm:text-lg font-black leading-snug text-white group-hover:text-rose-400 transition">
                      {meme.title}
                    </h2>
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-white/85 font-medium">
                      {meme.summary}
                    </p>

                    {/* 태그 해시태그 */}
                    {meme.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {meme.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-white/15 px-2.5 py-0.5 text-[0.68rem] font-bold text-white/90 backdrop-blur-md"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </Link>
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

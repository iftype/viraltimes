"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Flame,
  LoaderCircle,
  ExternalLink,
  BookOpen,
  Sparkles,
  Share2,
  CheckCircle2,
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
  const [copiedId, setCopiedId] = useState<string | null>(null);

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

  const handleShare = async (meme: Meme) => {
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
        // fallback to clipboard
      }
    }
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      setCopiedId(meme.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  return (
    <div className="page-shell max-w-2xl py-6 sm:py-10">
      {/* 피드 상단 헤더 Banner */}
      <section className="mb-6 rounded-3xl bg-black p-6 text-white shadow-xl">
        <div className="flex items-center gap-2 text-xs font-black text-[#fe2c55]">
          <Flame className="size-4 animate-bounce" />
          <span>TRENDING VIRAL FEED</span>
        </div>
        <h1 className="mt-2 text-2xl font-black tracking-[-0.04em] sm:text-3xl">
          실시간 유행 밈 & 챌린지 피드
        </h1>
        <p className="mt-1.5 text-xs text-white/60 leading-relaxed sm:text-sm">
          지금 인터넷을 뜨겁게 달구는 원본 영상과 챌린지를 인스타그램·틱톡 스타일 피드로 만나보세요.
        </p>
      </section>

      {/* 로딩 & 에러 상태 */}
      {loading ? (
        <div className="flex min-h-[50vh] items-center justify-center">
          <LoaderCircle className="size-8 animate-spin text-black/30" />
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-dashed border-red-200 bg-red-50 p-8 text-center text-sm font-bold text-red-600">
          {error}
        </div>
      ) : memes.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-black/10 bg-white p-12 text-center text-sm font-bold text-black/40">
          등록된 유행 피드가 없습니다.
        </div>
      ) : (
        /* 숏폼 / 바이럴 피드 카드 스크롤 스트림 */
        <div className="space-y-6">
          {memes.map((meme) => {
            const video = meme.origin?.video;
            if (!video) return null;

            const platform = video.platform;
            const platformName = platformLabels[platform] ?? platform;

            return (
              <article
                key={meme.id}
                className="overflow-hidden rounded-3xl border border-black/8 bg-white shadow-[0_12px_40px_rgba(0,0,0,0.06)] transition-all hover:shadow-[0_16px_50px_rgba(0,0,0,0.1)]"
              >
                {/* 카드 프로필 Header */}
                <div className="flex items-center justify-between border-b border-black/5 p-4 sm:p-5">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex size-10 shrink-0 items-center justify-center rounded-2xl font-black text-white shadow-sm"
                      style={{ backgroundColor: meme.accent || "#fe2c55" }}
                    >
                      <Sparkles className="size-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-black tracking-tight text-black">
                          {meme.title}
                        </span>
                        <Badge className="text-[0.65rem] font-black">
                          {platformName}
                        </Badge>
                      </div>
                      <p className="mt-0.5 font-mono text-xs font-bold text-black/35">
                        /{meme.slug} {meme.lifecycle?.originYear ? `· ${meme.lifecycle.originYear}년` : ""}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleShare(meme)}
                    className="flex size-9 items-center justify-center rounded-full bg-black/5 text-black/60 transition hover:bg-black/10 hover:text-black"
                    title="공유하기"
                  >
                    {copiedId === meme.id ? (
                      <CheckCircle2 className="size-4 text-emerald-600" />
                    ) : (
                      <Share2 className="size-4" />
                    )}
                  </button>
                </div>

                {/* 임베드 미디어 영역 */}
                <div className="bg-black">
                  <VideoEmbed video={video} />
                </div>

                {/* 카드 본문 & 하단 릴레이션 */}
                <div className="p-5 sm:p-6">
                  <p className="text-sm font-medium leading-relaxed text-black/80 sm:text-base">
                    {meme.summary}
                  </p>

                  {/* 태그 해시태그 */}
                  {meme.tags.length > 0 && (
                    <div className="mt-3.5 flex flex-wrap gap-1.5">
                      {meme.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-black/5 px-2.5 py-1 text-xs font-bold text-black/50"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* 사전 링크 이동 CTA 버튼 */}
                  <div className="mt-5 flex items-center justify-between border-t border-black/5 pt-4">
                    <span className="text-xs font-bold text-black/40">
                      원조 크리에이터: {video.creator || "확인 중"}
                    </span>

                    <Link
                      href={memeHref(meme.slug)}
                      className="inline-flex items-center gap-1.5 rounded-full bg-black px-4 py-2 text-xs font-black text-white shadow transition hover:bg-black/80 hover:scale-105 active:scale-95"
                    >
                      <BookOpen className="size-3.5" />
                      <span>사전 항목 보기</span>
                      <ExternalLink className="size-3" />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

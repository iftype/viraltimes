"use client";

import { useEffect, useRef, useState } from "react";
import { ExternalLink, Play, Pause, Volume2, VolumeX, ShieldAlert } from "lucide-react";
import Image from "next/image";

import type { Video } from "@/types/meme";

import {
  getInstagramEmbedUrl,
  getTikTokEmbedUrl,
  getYouTubeVideoId,
  platformLabels,
} from "../lib/video-url";

type VideoEmbedProps = {
  video: Video;
  priority?: boolean;
  autoPlayOnScroll?: boolean;
  feedMode?: boolean;
};

export function VideoEmbed({
  video,
  priority = false,
  autoPlayOnScroll = true,
  feedMode = false,
}: VideoEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const youtubeId =
    video.platform === "youtube" ? getYouTubeVideoId(video.url) : null;

  // YouTube iframe 재생 URL (enablejsapi=1 및 mute=1 파라미터 추가)
  const embedUrl =
    video.platform === "youtube" && youtubeId
      ? `https://www.youtube-nocookie.com/embed/${youtubeId}?enablejsapi=1&autoplay=0&mute=${isMuted ? 1 : 0}&playsinline=1`
      : video.platform === "instagram"
        ? getInstagramEmbedUrl(video.url)
        : video.platform === "tiktok"
          ? getTikTokEmbedUrl(video.url)
          : null;

  const canEmbed = Boolean(embedUrl);
  const imageUrl = video.thumbnailUrl
    ? video.thumbnailUrl.startsWith("/")
      ? `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${video.thumbnailUrl}`
      : video.thumbnailUrl
    : null;
  const hasMedia = canEmbed || Boolean(imageUrl);
  const isShortForm =
    ["instagram", "tiktok"].includes(video.platform) || Boolean(imageUrl);

  // IntersectionObserver 기반 스크롤 자동 재생 및 이탈 시 자동 멈춤
  useEffect(() => {
    if (!autoPlayOnScroll || !canEmbed || !containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const isVisible = entry.isIntersecting;

          if (video.platform === "youtube" && iframeRef.current?.contentWindow) {
            const command = isVisible ? "playVideo" : "pauseVideo";
            iframeRef.current.contentWindow.postMessage(
              JSON.stringify({ event: "command", func: command, args: [] }),
              "*"
            );
            setIsPlaying(isVisible);
          }
        });
      },
      {
        threshold: 0.55,
      }
    );

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [autoPlayOnScroll, canEmbed, video.platform]);

  // 음소거 토글
  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);

    if (video.platform === "youtube" && iframeRef.current?.contentWindow) {
      const command = nextMuted ? "mute" : "unMute";
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: "command", func: command, args: [] }),
        "*"
      );
    }
  };

  return (
    <article
      ref={containerRef}
      className={
        feedMode
          ? "relative size-full overflow-hidden bg-black flex items-center justify-center"
          : "group overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_8px_24px_rgba(0,0,0,0.06)]"
      }
    >
      <div className={isShortForm && !feedMode ? "bg-[#171719]" : "size-full"}>
        <div
          className={
            feedMode
              ? "relative size-full overflow-hidden bg-black"
              : `relative overflow-hidden bg-[#171719] ${
                  isShortForm
                    ? "mx-auto aspect-[9/16] w-full max-w-[420px]"
                    : "aspect-video"
                }`
          }
        >
          {embedUrl ? (
            <>
              <iframe
                ref={iframeRef}
                className="absolute inset-0 size-full border-0"
                src={embedUrl}
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; fullscreen; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="lazy"
              />

              {/* 스크롤 감지 자동재생 및 소리 상태 인디케이터 배지 */}
              <div className="absolute left-3 top-3 z-30 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 text-[0.68rem] font-black text-white backdrop-blur-md">
                {isPlaying ? (
                  <>
                    <span className="relative flex size-2">
                      <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                    </span>
                    <span>자동 재생 중</span>
                  </>
                ) : (
                  <>
                    <Pause className="size-3 text-white/50" />
                    <span className="text-white/70">일시 정지됨</span>
                  </>
                )}
              </div>

              {/* 음소거 토글 버튼 */}
              <button
                type="button"
                onClick={toggleMute}
                className="absolute right-3 top-3 z-30 flex size-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md transition hover:bg-black/80"
                title={isMuted ? "음소거 해제 (소리 켜기)" : "음소거 설정"}
              >
                {isMuted ? (
                  <VolumeX className="size-4 text-rose-400" />
                ) : (
                  <Volume2 className="size-4 text-emerald-400" />
                )}
              </button>
            </>
          ) : imageUrl ? (
            <a
              className="absolute inset-0 block"
              href={video.url}
              target="_blank"
              rel="noreferrer"
            >
              <Image
                className="object-cover"
                src={imageUrl}
                alt={video.title}
                fill
                priority={priority}
                sizes="(max-width: 768px) 100vw, 420px"
              />
            </a>
          ) : (
            <a
              className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[radial-gradient(circle_at_30%_10%,#fe2c5555,transparent_35%),radial-gradient(circle_at_80%_90%,#25f4ee44,transparent_35%)] px-7 text-center text-white"
              href={video.url}
              target="_blank"
              rel="noreferrer"
            >
              <span className="flex size-12 items-center justify-center rounded-full bg-white text-black shadow-[-3px_0_0_#25f4ee,3px_0_0_#fe2c55] transition-transform group-hover:scale-105">
                <Play
                  className="ml-0.5 size-4 fill-current"
                  aria-hidden="true"
                />
              </span>
              <span className="max-w-sm text-xs leading-5 text-white/65">
                임베드가 제한될 수 있어요. 원본 링크에서 확인해 주세요.
              </span>
            </a>
          )}
        </div>
      </div>

      {!feedMode && (
        <div className="flex items-start justify-between gap-3 p-4 sm:p-5">
          <div className="min-w-0">
            <div className="mb-1.5 flex items-center gap-2 text-[0.65rem] font-black uppercase tracking-[0.1em] text-black/35">
              <span>{platformLabels[video.platform]}</span>
              {!hasMedia && (
                <span className="inline-flex items-center gap-1 text-[#fe2c55]">
                  <ShieldAlert className="size-3" aria-hidden="true" /> 링크
                </span>
              )}
            </div>
            <h3 className="line-clamp-2 text-sm font-bold leading-snug text-black sm:text-base">
              {video.title}
            </h3>
            {(video.creator || video.viewCountLabel) && (
              <p className="mt-1 flex flex-wrap gap-x-2 text-xs text-black/40">
                {video.creator && <span>@{video.creator}</span>}
                {video.viewCountLabel && <span>{video.viewCountLabel}</span>}
              </p>
            )}
          </div>

          <a
            className="flex shrink-0 items-center gap-1 rounded-full bg-black/5 px-3 py-2 text-xs font-bold text-black/60 hover:bg-black hover:text-white"
            href={video.url}
            target="_blank"
            rel="noreferrer"
            aria-label={`${video.title} 원본 열기`}
          >
            원본
            <ExternalLink className="size-3" aria-hidden="true" />
          </a>
        </div>
      )}
    </article>
  );
}

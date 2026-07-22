"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ExternalLink, Play, Volume2, VolumeX, ShieldAlert } from "lucide-react";
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
  isMuted?: boolean;
  onToggleMute?: () => void;
  onEmbedUnavailable?: () => void;
};

export function VideoEmbed({
  video,
  priority = false,
  autoPlayOnScroll = true,
  feedMode = false,
  isMuted = true,
  onToggleMute,
  onEmbedUnavailable,
}: VideoEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const unavailableReportedRef = useRef(false);
  const [instagramAvailable, setInstagramAvailable] = useState<boolean | null>(
    video.platform === "instagram" ? null : true,
  );

  useEffect(() => {
    if (video.platform !== "instagram") return;
    let active = true;
    void fetch(`/api/v1/embeds/instagram?url=${encodeURIComponent(video.url)}`)
      .then(async (response) => {
        if (!response.ok) return null;
        const result = (await response.json()) as { available?: boolean | null };
        return typeof result.available === "boolean" ? result.available : null;
      })
      .then((available) => {
        if (active) setInstagramAvailable(available);
      })
      .catch(() => {
        if (active) setInstagramAvailable(null);
      });
    return () => {
      active = false;
    };
  }, [video.platform, video.url]);

  useEffect(() => {
    unavailableReportedRef.current = false;
  }, [video.id, video.url]);

  const reportUnavailable = useCallback(() => {
    if (unavailableReportedRef.current) return;
    unavailableReportedRef.current = true;
    onEmbedUnavailable?.();
  }, [onEmbedUnavailable]);

  useEffect(() => {
    if (instagramAvailable === false) reportUnavailable();
  }, [instagramAvailable, reportUnavailable]);

  const youtubeId =
    video.platform === "youtube" ? getYouTubeVideoId(video.url) : null;

  // YouTube iframe 재생 URL (autoplay=1, mute=1 및 playsinline=1 파라미터 추가)
  const embedUrl =
    video.platform === "youtube" && youtubeId
      ? `https://www.youtube-nocookie.com/embed/${youtubeId}?enablejsapi=1&autoplay=${autoPlayOnScroll ? 1 : 0}&mute=${isMuted ? 1 : 0}&playsinline=1&controls=1`
      : video.platform === "instagram"
        ? getInstagramEmbedUrl(video.url)
        : video.platform === "tiktok"
          ? getTikTokEmbedUrl(video.url)
          : null;

  const canEmbed = Boolean(embedUrl) && (video.platform !== "instagram" || instagramAvailable !== false);
  const instagramUnavailable = video.platform === "instagram" && instagramAvailable === false;
  const imageUrl = video.thumbnailUrl
    ? video.thumbnailUrl.startsWith("/")
      ? `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${video.thumbnailUrl}`
      : video.thumbnailUrl
    : null;
  const hasMedia = canEmbed || Boolean(imageUrl);
  const isShortForm =
    ["instagram", "tiktok"].includes(video.platform) || Boolean(imageUrl);

  // 음소거 상태가 상위에서 변경될 때 iframe에 postMessage로 무음/소리 전송
  useEffect(() => {
    if (!iframeRef.current?.contentWindow) return;
    if (video.platform === "youtube") {
      const command = isMuted ? "mute" : "unMute";
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: "command", func: command, args: [] }),
        "*"
      );
    } else if (video.platform === "tiktok") {
      iframeRef.current.contentWindow.postMessage(
        { type: isMuted ? "mute" : "unMute", "x-tiktok-player": true },
        "*",
      );
    }
  }, [isMuted, video.platform]);

  useEffect(() => {
    if (video.platform !== "tiktok") return;
    const handlePlayerMessage = (event: MessageEvent) => {
      if (event.origin !== "https://www.tiktok.com" || event.source !== iframeRef.current?.contentWindow) return;
      const message = event.data as { type?: string; "x-tiktok-player"?: boolean } | null;
      if (!message?.["x-tiktok-player"]) return;
      if (message.type === "onPlayerError") {
        reportUnavailable();
        return;
      }
      if (message.type !== "onPlayerReady") return;
      iframeRef.current?.contentWindow?.postMessage(
        { type: isMuted ? "mute" : "unMute", "x-tiktok-player": true },
        "https://www.tiktok.com",
      );
      if (autoPlayOnScroll) {
        iframeRef.current?.contentWindow?.postMessage(
          { type: "play", "x-tiktok-player": true },
          "https://www.tiktok.com",
        );
      }
    };
    window.addEventListener("message", handlePlayerMessage);
    return () => window.removeEventListener("message", handlePlayerMessage);
  }, [autoPlayOnScroll, isMuted, reportUnavailable, video.platform]);

  // active 상태 및 IntersectionObserver에 의한 자동재생 확정 트리거 (3단계 재시도로 끊김 100% 방지)
  useEffect(() => {
    if (!canEmbed || video.platform !== "youtube") return;
    const playerWindow = iframeRef.current?.contentWindow;
    if (!playerWindow) return;

    const triggerPlay = () => {
      const command = autoPlayOnScroll ? "playVideo" : "pauseVideo";
      playerWindow.postMessage(
        JSON.stringify({ event: "command", func: command, args: [] }),
        "*"
      );
    };

    if (autoPlayOnScroll) {
      triggerPlay();
      const t1 = setTimeout(triggerPlay, 100);
      const t2 = setTimeout(triggerPlay, 350);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        playerWindow.postMessage(
          JSON.stringify({ event: "command", func: "pauseVideo", args: [] }),
          "*",
        );
      };
    } else {
      triggerPlay();
    }
  }, [autoPlayOnScroll, canEmbed, video.platform]);

  useEffect(() => {
    const playerWindow = iframeRef.current?.contentWindow;
    if (!canEmbed || video.platform !== "tiktok" || !playerWindow) return;
    playerWindow.postMessage(
      { type: autoPlayOnScroll ? "play" : "pause", "x-tiktok-player": true },
      "https://www.tiktok.com",
    );
    return () => {
      playerWindow.postMessage(
        { type: "pause", "x-tiktok-player": true },
        "https://www.tiktok.com",
      );
    };
  }, [autoPlayOnScroll, canEmbed, video.platform]);

  return (
    <article
      ref={containerRef}
      className={
        feedMode
          ? "relative size-full overflow-hidden bg-black flex items-center justify-center pointer-events-auto"
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
          {canEmbed ? (
            <>
              <iframe
                ref={iframeRef}
                className="absolute inset-0 size-full border-0"
                src={embedUrl ?? undefined}
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; fullscreen; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="eager"
                onError={reportUnavailable}
              />
              {feedMode && video.platform === "youtube" && (
                <div
                  aria-hidden="true"
                  className="absolute inset-0 z-10 touch-pan-y md:hidden"
                />
              )}
              {feedMode && ["instagram", "tiktok"].includes(video.platform) && (
                <>
                  <div aria-hidden="true" className="absolute inset-y-0 left-0 z-10 w-5 touch-pan-y bg-gradient-to-r from-black/20 to-transparent md:hidden" />
                  <div aria-hidden="true" className="absolute inset-y-0 right-0 z-10 w-5 touch-pan-y bg-gradient-to-l from-black/20 to-transparent md:hidden" />
                  <span className={`pointer-events-none absolute right-3 z-20 rounded-full bg-black/65 px-2.5 py-1 text-[0.62rem] font-bold text-white/80 backdrop-blur-md ${video.platform === "tiktok" ? "top-16" : "top-3"}`}>
                    영상에서 소리 조작 · 양옆으로 스와이프
                  </span>
                </>
              )}
              {feedMode && ["youtube", "tiktok"].includes(video.platform) && onToggleMute && (
                <button
                  aria-label={isMuted ? "소리 켜기" : "음소거"}
                  className="absolute right-3 top-3 z-20 flex size-10 cursor-pointer items-center justify-center rounded-full bg-black/65 text-white shadow-md backdrop-blur-md transition hover:bg-black/85"
                  onClick={onToggleMute}
                  title={isMuted ? "소리 켜기" : "음소거"}
                  type="button"
                >
                  {isMuted ? (
                    <VolumeX className="size-5" aria-hidden="true" />
                  ) : (
                    <Volume2 className="size-5" aria-hidden="true" />
                  )}
                </button>
              )}
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
                {instagramUnavailable
                  ? "이 Instagram 게시물은 외부 임베드를 허용하지 않습니다. Instagram에서 확인해 주세요."
                  : "임베드가 제한될 수 있어요. 원본 링크에서 확인해 주세요."}
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

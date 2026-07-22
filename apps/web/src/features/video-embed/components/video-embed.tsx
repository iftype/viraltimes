"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ExternalLink, Play, Volume2, VolumeX, ShieldAlert } from "lucide-react";

import { ResilientImage } from "@/components/resilient-image";
import type { Video } from "@/types/meme";

import {
  getInstagramEmbedUrl,
  getTikTokEmbedUrl,
  getYouTubeVideoId,
  platformLabels,
} from "../lib/video-url";
import { loadYouTubeIframeApi, type YouTubePlayer } from "../lib/youtube-player-api";

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
  const youtubePlayerRef = useRef<YouTubePlayer | null>(null);
  const isMutedRef = useRef(isMuted);
  const autoPlayRef = useRef(autoPlayOnScroll);
  const onEmbedUnavailableRef = useRef(onEmbedUnavailable);
  const unavailableReportedRef = useRef(false);
  const [embedLoaded, setEmbedLoaded] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [instagramAvailable, setInstagramAvailable] = useState<boolean | null>(
    video.platform === "instagram" ? null : true,
  );

  useEffect(() => {
    isMutedRef.current = isMuted;
    autoPlayRef.current = autoPlayOnScroll;
    onEmbedUnavailableRef.current = onEmbedUnavailable;
  }, [autoPlayOnScroll, isMuted, onEmbedUnavailable]);

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
    onEmbedUnavailableRef.current?.();
  }, []);

  useEffect(() => {
    if (instagramAvailable === false) reportUnavailable();
  }, [instagramAvailable, reportUnavailable]);

  const youtubeId =
    video.platform === "youtube" ? getYouTubeVideoId(video.url) : null;

  // 모바일 autoplay 정책을 통과하도록 새 player는 항상 muted 상태로 시작한다.
  // 사용자가 소리를 켠 상태는 iframe 준비 뒤 postMessage로 복원한다.
  const embedUrl =
    video.platform === "youtube" && youtubeId
      ? `https://www.youtube-nocookie.com/embed/${youtubeId}?enablejsapi=1&autoplay=${autoPlayOnScroll ? 1 : 0}&mute=1&playsinline=1&controls=1`
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

  // 준비된 YouTube player에는 API로 즉시 소리 상태를 적용한다.
  useEffect(() => {
    if (video.platform === "youtube" && youtubePlayerRef.current) {
      if (isMuted) youtubePlayerRef.current.mute();
      else youtubePlayerRef.current.unMute();
      return;
    }
    const playerWindow = iframeRef.current?.contentWindow;
    if (!embedLoaded || !playerWindow || video.platform !== "tiktok") return;
    const syncAudio = () => {
      playerWindow.postMessage(
        { type: isMuted ? "mute" : "unMute", "x-tiktok-player": true },
        "https://www.tiktok.com",
      );
    };
    syncAudio();
    const timers = [250, 750, 1_500].map((delay) => setTimeout(syncAudio, delay));
    return () => timers.forEach(clearTimeout);
  }, [embedLoaded, isMuted, video.platform]);

  // YouTube 공식 IFrame API의 onReady에서 재생해야 모바일의 느린 player 준비에도 명령이 유실되지 않는다.
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!canEmbed || !embedLoaded || video.platform !== "youtube" || !iframe) return;
    let disposed = false;
    let player: YouTubePlayer | null = null;

    void loadYouTubeIframeApi()
      .then((youtube) => {
        if (disposed) return;
        player = new youtube.Player(iframe, {
          events: {
            onReady: (event) => {
              if (disposed) return;
              youtubePlayerRef.current = event.target;
              event.target.mute();
              if (autoPlayRef.current) event.target.playVideo();
              else event.target.pauseVideo();
              if (!isMutedRef.current) event.target.unMute();
            },
            onStateChange: (event) => {
              if (!disposed && event.data === 1) setAutoplayBlocked(false);
            },
            onAutoplayBlocked: () => {
              if (!disposed) setAutoplayBlocked(true);
            },
            onError: () => {
              if (!disposed) reportUnavailable();
            },
          },
        });
      })
      .catch(() => {
        if (!disposed) setAutoplayBlocked(true);
      });

    return () => {
      disposed = true;
      if (player && youtubePlayerRef.current === player) {
        player.pauseVideo();
        player.destroy();
        youtubePlayerRef.current = null;
      }
    };
  }, [canEmbed, embedLoaded, reportUnavailable, video.platform]);

  useEffect(() => {
    const player = youtubePlayerRef.current;
    if (video.platform !== "youtube" || !player) return;
    if (autoPlayOnScroll) player.playVideo();
    else player.pauseVideo();
  }, [autoPlayOnScroll, video.platform]);

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

  useEffect(() => {
    const playerWindow = iframeRef.current?.contentWindow;
    if (!canEmbed || !embedLoaded || video.platform !== "tiktok" || !playerWindow) return;
    const syncPlayback = () => playerWindow.postMessage(
      { type: autoPlayOnScroll ? "play" : "pause", "x-tiktok-player": true },
      "https://www.tiktok.com",
    );
    syncPlayback();
    const timers = autoPlayOnScroll
      ? [250, 750, 1_500, 3_000].map((delay) => setTimeout(syncPlayback, delay))
      : [];
    return () => {
      timers.forEach(clearTimeout);
      playerWindow.postMessage(
        { type: "pause", "x-tiktok-player": true },
        "https://www.tiktok.com",
      );
    };
  }, [autoPlayOnScroll, canEmbed, embedLoaded, video.platform]);

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
                onLoad={() => setEmbedLoaded(true)}
                onError={reportUnavailable}
              />
              {feedMode && video.platform === "youtube" && (
                <div
                  aria-hidden="true"
                  className="absolute inset-0 z-10 touch-pan-y md:hidden"
                />
              )}
              {feedMode && video.platform === "youtube" && autoplayBlocked && (
                <button
                  className="absolute left-1/2 top-1/2 z-30 flex -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-black text-black shadow-xl"
                  onClick={() => {
                    const player = youtubePlayerRef.current;
                    if (!player) return;
                    player.mute();
                    player.playVideo();
                    if (!isMutedRef.current) player.unMute();
                    setAutoplayBlocked(false);
                  }}
                  type="button"
                >
                  <Play className="size-4 fill-current" aria-hidden="true" /> 재생하기
                </button>
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
              <ResilientImage
                className="object-cover"
                src={imageUrl}
                alt={video.title}
                fallback={<VideoLinkPlaceholder instagramUnavailable={instagramUnavailable} />}
                fill
                priority={priority}
                sizes="(max-width: 768px) 100vw, 420px"
              />
            </a>
          ) : (
            <a
              className="absolute inset-0 block"
              href={video.url}
              target="_blank"
              rel="noreferrer"
            >
              <VideoLinkPlaceholder instagramUnavailable={instagramUnavailable} />
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

function VideoLinkPlaceholder({ instagramUnavailable }: { instagramUnavailable: boolean }) {
  return (
    <span className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[radial-gradient(circle_at_30%_10%,#fe2c5555,transparent_35%),radial-gradient(circle_at_80%_90%,#25f4ee44,transparent_35%)] px-7 text-center text-white">
      <span className="flex size-12 items-center justify-center rounded-full bg-white text-black shadow-[-3px_0_0_#25f4ee,3px_0_0_#fe2c55] transition-transform group-hover:scale-105">
        <Play className="ml-0.5 size-4 fill-current" aria-hidden="true" />
      </span>
      <span className="max-w-sm text-xs leading-5 text-white/65">
        {instagramUnavailable
          ? "이 Instagram 게시물은 외부 임베드를 허용하지 않습니다. Instagram에서 확인해 주세요."
          : "미리보기를 불러오지 못했습니다. 원본 링크에서 확인해 주세요."}
      </span>
    </span>
  );
}

"use client";

import { ExternalLink, MousePointerClick, Play, ScrollText } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

import type { Video } from "@/types/meme";

import { getInstagramEmbedUrl, getTikTokEmbedUrl, getYouTubeVideoId } from "../lib/video-url";

function embedUrlFor(video: Video) {
  if (video.platform === "youtube") {
    const id = getYouTubeVideoId(video.url);
    return id ? `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&playsinline=1&rel=0&enablejsapi=1` : null;
  }
  if (video.platform === "instagram") return getInstagramEmbedUrl(video.url);
  if (video.platform === "tiktok") return getTikTokEmbedUrl(video.url);
  return null;
}

export function FeedMedia({ posterUrl, priority = false, video }: { posterUrl?: string | null; priority?: boolean; video?: Video }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [nearViewport, setNearViewport] = useState(priority);
  const [instagramInteractive, setInstagramInteractive] = useState(true);
  const embedUrl = useMemo(() => video ? embedUrlFor(video) : null, [video]);
  const isInstagram = video?.platform === "instagram";
  const isVertical = video?.platform === "instagram" || video?.platform === "tiktok" || video?.url.includes("/shorts/");

  useEffect(() => {
    if (nearViewport || !rootRef.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setNearViewport(true);
        observer.disconnect();
      }
    }, { rootMargin: "800px 0px" });
    observer.observe(rootRef.current);
    return () => observer.disconnect();
  }, [nearViewport]);

  const frameClass = isVertical
    ? "mx-auto aspect-[9/16] max-h-[78dvh] w-full max-w-[30rem]"
    : video
      ? "aspect-video w-full"
      : "aspect-[4/5] max-h-[78dvh] w-full";

  return (
    <div className="bg-[#111]" ref={rootRef}>
      <div className={`relative overflow-hidden bg-[#151517] ${frameClass}`}>
        {embedUrl && nearViewport ? (
          <iframe
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; fullscreen; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className={`absolute inset-0 size-full border-0 ${isInstagram && !instagramInteractive ? "pointer-events-none" : ""}`}
            loading="lazy"
            scrolling="no"
            src={embedUrl}
            title={video?.title ?? "밈 영상"}
          />
        ) : posterUrl ? (
          <Image alt={video?.title ?? "밈 대표 장면"} className="object-cover" fill priority={priority} sizes="(max-width: 640px) 100vw, 640px" src={posterUrl} />
        ) : (
          <div aria-label="영상 미리보기" className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_25%_20%,#fe2c5566,transparent_40%),radial-gradient(circle_at_75%_80%,#25f4ee44,transparent_40%)]" role="img"><Play className="size-10 fill-white text-white" /></div>
        )}

        {isInstagram && embedUrl && !instagramInteractive && (
          <button className="absolute inset-0 z-10 flex cursor-pointer flex-col items-center justify-center gap-2 bg-black/12 text-white" onClick={() => setInstagramInteractive(true)} type="button">
            <span className="flex size-14 items-center justify-center rounded-full bg-white text-black shadow-xl"><MousePointerClick className="size-5" /></span>
            <span className="rounded-full bg-black/70 px-3 py-1.5 text-xs font-black backdrop-blur-sm">탭해서 재생·조작</span>
            <span className="text-[0.65rem] font-bold text-white/75">세로 스와이프는 피드가 먼저 움직여요</span>
          </button>
        )}

        {isInstagram && instagramInteractive && (
          <>
            <button className="absolute right-2 top-2 z-20 flex items-center gap-1 rounded-full bg-black/75 px-3 py-2 text-[0.65rem] font-black text-white shadow-lg backdrop-blur-sm" onClick={() => setInstagramInteractive(false)} type="button"><ScrollText className="size-3.5" />피드 스크롤</button>
            <div aria-hidden="true" className="absolute inset-y-0 left-0 z-10 w-3 touch-pan-y" />
            <div aria-hidden="true" className="absolute inset-y-0 right-0 z-10 w-3 touch-pan-y" />
            <div aria-hidden="true" className="absolute inset-x-0 bottom-0 z-10 h-5 touch-pan-y bg-gradient-to-t from-black/30 to-transparent" />
          </>
        )}

        {!embedUrl && video && (
          <a className="absolute inset-x-3 bottom-3 z-10 flex items-center justify-center gap-1.5 rounded-xl bg-white px-3 py-2.5 text-xs font-black text-black" href={video.url} rel="noreferrer" target="_blank">원문에서 보기<ExternalLink className="size-3.5" /></a>
        )}
      </div>
    </div>
  );
}

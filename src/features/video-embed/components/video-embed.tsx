import { ExternalLink, Play, ShieldAlert } from "lucide-react";

import type { Video } from "@/types/meme";

import {
  getYouTubeVideoId,
  platformLabels,
} from "../lib/video-url";

type VideoEmbedProps = {
  video: Video;
  priority?: boolean;
};

export function VideoEmbed({ video }: VideoEmbedProps) {
  const youtubeId =
    video.platform === "youtube" ? getYouTubeVideoId(video.url) : null;
  const canEmbed = Boolean(youtubeId);

  return (
    <article className="group overflow-hidden rounded-[1.5rem] border border-black/10 bg-white shadow-[0_18px_60px_rgba(26,25,23,0.08)]">
      <div className="relative aspect-video overflow-hidden bg-[#171714]">
        {canEmbed ? (
          <iframe
            className="absolute inset-0 size-full"
            src={`https://www.youtube-nocookie.com/embed/${youtubeId}`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
          />
        ) : (
          <a
            className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[radial-gradient(circle_at_top,#3b3b34,transparent_65%)] px-8 text-center text-white"
            href={video.url}
            target="_blank"
            rel="noreferrer"
          >
            <span className="flex size-14 items-center justify-center rounded-full border border-white/20 bg-white/10 transition-transform group-hover:scale-105">
              <Play className="ml-0.5 size-5 fill-current" aria-hidden="true" />
            </span>
            <span className="max-w-sm text-sm leading-6 text-white/70">
              이 플랫폼은 로그인, 지역 또는 정책에 따라 임베드가 제한될 수
              있어요. 원본 링크에서 확인해 주세요.
            </span>
          </a>
        )}
      </div>

      <div className="flex items-start justify-between gap-4 p-5 sm:p-6">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-black/45">
            <span>{platformLabels[video.platform]}</span>
            {!canEmbed && (
              <span className="inline-flex items-center gap-1 text-[#a04d2e]">
                <ShieldAlert className="size-3" aria-hidden="true" />
                링크로 보기
              </span>
            )}
          </div>
          <h3 className="line-clamp-2 text-base font-semibold leading-snug text-[#1b1b18]">
            {video.title}
          </h3>
          {video.creator && (
            <p className="mt-1 text-sm text-black/50">{video.creator}</p>
          )}
        </div>

        <a
          className="flex shrink-0 items-center gap-1.5 rounded-full border border-black/10 px-3 py-2 text-xs font-semibold text-black/65 transition-colors hover:border-black/25 hover:text-black"
          href={video.url}
          target="_blank"
          rel="noreferrer"
          aria-label={`${video.title} 원본 열기`}
        >
          원본
          <ExternalLink className="size-3.5" aria-hidden="true" />
        </a>
      </div>
    </article>
  );
}

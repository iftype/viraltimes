import { ExternalLink, Play, ShieldAlert } from "lucide-react";

import type { Video } from "@/types/meme";

import { getYouTubeVideoId, platformLabels } from "../lib/video-url";

type VideoEmbedProps = {
  video: Video;
  priority?: boolean;
};

export function VideoEmbed({ video }: VideoEmbedProps) {
  const youtubeId =
    video.platform === "youtube" ? getYouTubeVideoId(video.url) : null;
  const canEmbed = Boolean(youtubeId);

  return (
    <article className="group overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
      <div className="relative aspect-video overflow-hidden bg-[#171719]">
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
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[radial-gradient(circle_at_30%_10%,#fe2c5555,transparent_35%),radial-gradient(circle_at_80%_90%,#25f4ee44,transparent_35%)] px-7 text-center text-white"
            href={video.url}
            target="_blank"
            rel="noreferrer"
          >
            <span className="flex size-12 items-center justify-center rounded-full bg-white text-black shadow-[-3px_0_0_#25f4ee,3px_0_0_#fe2c55] transition-transform group-hover:scale-105">
              <Play className="ml-0.5 size-4 fill-current" aria-hidden="true" />
            </span>
            <span className="max-w-sm text-xs leading-5 text-white/65">
              임베드가 제한될 수 있어요. 원본 링크에서 확인해 주세요.
            </span>
          </a>
        )}
      </div>

      <div className="flex items-start justify-between gap-3 p-4 sm:p-5">
        <div className="min-w-0">
          <div className="mb-1.5 flex items-center gap-2 text-[0.65rem] font-black uppercase tracking-[0.1em] text-black/35">
            <span>{platformLabels[video.platform]}</span>
            {!canEmbed && (
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
    </article>
  );
}

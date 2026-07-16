import { ExternalLink } from "lucide-react";

import type { Video } from "@/types/meme";

import { platformLabels } from "../lib/video-url";
import { VideoThumbnail } from "./video-thumbnail";

export function ChallengeVideoRail({ videos }: { videos: Video[] }) {
  return (
    <div className={`hide-scrollbar grid snap-x auto-cols-[calc((100%_-_0.75rem)/2)] grid-flow-col gap-3 overflow-x-auto overscroll-x-contain pb-3 ${videos.length > 1 ? "grid-rows-2" : "grid-rows-1"}`} role="list">
      {videos.map((video) => (
        <a
          className="group flex min-w-0 snap-start gap-3 rounded-2xl border border-black/5 bg-white p-2.5 shadow-sm transition hover:-translate-y-0.5 hover:border-black/15"
          href={video.url}
          key={video.id}
          rel="noreferrer"
          role="listitem"
          target="_blank"
        >
          <span className="relative aspect-[4/5] w-16 shrink-0 overflow-hidden rounded-xl bg-black sm:w-24">
            <VideoThumbnail sizes="96px" video={video} />
          </span>
          <span className="flex min-w-0 flex-1 flex-col py-1">
            <span className="text-[0.62rem] font-black uppercase tracking-[0.08em] text-[#8b5cf6]">{platformLabels[video.platform]}</span>
            <span className="mt-1 line-clamp-3 text-xs font-black leading-5 text-black">{video.title}</span>
            <span className="mt-auto flex items-center justify-between gap-2 pt-2 text-[0.68rem] font-bold text-black/35">
              <span className="truncate">{video.creator ? `@${video.creator}` : "참여 영상"}</span>
              <ExternalLink className="size-3 shrink-0" aria-hidden="true" />
            </span>
          </span>
        </a>
      ))}
    </div>
  );
}

"use client";

import { ExternalLink, Play } from "lucide-react";
import { useMemo, useState } from "react";

import { cn } from "@origin/ui";
import type { Platform, Video } from "@/types/meme";

import { platformLabels } from "../lib/video-url";
import { VideoEmbed } from "./video-embed";
import { VideoThumbnail } from "./video-thumbnail";

type VideoFilter = Platform | "all";

export function ViralVideoGallery({ videos }: { videos: Video[] }) {
  const rankedVideos = useMemo(() => videos.slice(0, 10), [videos]);
  const platforms = useMemo(() => [...new Set(rankedVideos.map((video) => video.platform))], [rankedVideos]);
  const [activePlatform, setActivePlatform] = useState<VideoFilter>("all");
  const [activeVideoId, setActiveVideoId] = useState(rankedVideos[0]?.id ?? "");
  const visibleVideos = activePlatform === "all"
    ? rankedVideos
    : rankedVideos.filter((video) => video.platform === activePlatform);
  const activeVideo = visibleVideos.find((video) => video.id === activeVideoId) ?? visibleVideos[0];
  const tabs: Array<{ id: VideoFilter; label: string }> = [
    { id: "all", label: "전체" },
    ...platforms.map((platform) => ({ id: platform, label: platformLabels[platform] })),
  ];

  return (
    <div>
      {platforms.length > 1 && (
        <div className="hide-scrollbar mb-4 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="바이럴 영상 플랫폼">
          {tabs.map((tab) => (
            <button
              aria-selected={activePlatform === tab.id}
              className={cn(
                "shrink-0 rounded-full px-3.5 py-2 text-xs font-black transition",
                activePlatform === tab.id ? "bg-black text-white" : "bg-black/5 text-black/45 hover:text-black",
              )}
              key={tab.id}
              onClick={() => {
                setActivePlatform(tab.id);
                const next = tab.id === "all" ? rankedVideos[0] : rankedVideos.find((video) => video.platform === tab.id);
                if (next) setActiveVideoId(next.id);
              }}
              role="tab"
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {activeVideo && (
        <div className="grid gap-4 md:grid-cols-[minmax(0,1.15fr)_minmax(15rem,0.85fr)]">
          <div className="min-w-0">
            <VideoEmbed key={activeVideo.id} priority video={activeVideo} />
          </div>
          <div className="hide-scrollbar flex snap-x gap-3 overflow-x-auto pb-2 md:max-h-[42rem] md:block md:space-y-2 md:overflow-y-auto md:overflow-x-hidden md:pr-1">
            {visibleVideos.map((video) => {
              const rank = rankedVideos.findIndex((candidate) => candidate.id === video.id) + 1;
              const selected = video.id === activeVideo.id;
              return (
                <button
                  aria-pressed={selected}
                  className={cn(
                    "group flex w-[78%] shrink-0 snap-start items-center gap-3 rounded-2xl border p-2.5 text-left transition md:w-full",
                    selected ? "border-black bg-black text-white" : "border-black/5 bg-[#f7f7f8] hover:border-black/20",
                  )}
                  key={video.id}
                  onClick={() => setActiveVideoId(video.id)}
                  type="button"
                >
                  <span className="relative aspect-video w-28 shrink-0 overflow-hidden rounded-xl bg-black md:w-32">
                    <VideoThumbnail sizes="128px" video={video} />
                    <span className="absolute left-2 top-2 rounded-full bg-black/70 px-2 py-1 text-[0.62rem] font-black text-white">#{rank}</span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={cn("block text-[0.62rem] font-black uppercase tracking-[0.08em]", selected ? "text-white/50" : "text-black/35")}>{platformLabels[video.platform]}</span>
                    <span className="mt-1 line-clamp-2 block text-xs font-black leading-5">{video.title}</span>
                    <span className={cn("mt-1 block truncate text-[0.68rem]", selected ? "text-white/45" : "text-black/35")}>{video.viewCountLabel ?? video.creator ?? "원본 링크에서 보기"}</span>
                  </span>
                  {selected ? <Play className="size-4 shrink-0 fill-current" /> : <ExternalLink className="size-3.5 shrink-0 text-black/25" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

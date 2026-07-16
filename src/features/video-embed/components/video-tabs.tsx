"use client";

import { useState } from "react";

import type { Platform, Video } from "@/types/meme";

import { platformLabels } from "../lib/video-url";
import { VideoEmbed } from "./video-embed";

type VideoFilter = Platform | "all";

export function VideoTabs({ videos }: { videos: Video[] }) {
  const [activePlatform, setActivePlatform] = useState<VideoFilter>("all");
  const platforms = Array.from(new Set(videos.map((video) => video.platform)));
  const visibleVideos =
    activePlatform === "all"
      ? videos
      : videos.filter((video) => video.platform === activePlatform);

  const tabs: Array<{ id: VideoFilter; label: string }> = [
    { id: "all", label: "전체" },
    ...platforms.map((platform) => ({
      id: platform,
      label: platformLabels[platform],
    })),
  ];

  return (
    <div>
      <div className="mb-5 flex gap-2 overflow-x-auto pb-1" role="tablist">
        {tabs.map((tab) => {
          const isActive = activePlatform === tab.id;

          return (
            <button
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition-colors ${
                isActive
                  ? "bg-black text-white"
                  : "bg-[#f2f2f4] text-black/45 hover:text-black"
              }`}
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActivePlatform(tab.id)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {visibleVideos.map((video) => (
          <VideoEmbed key={video.id} video={video} />
        ))}
      </div>
    </div>
  );
}

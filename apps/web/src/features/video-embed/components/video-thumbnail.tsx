import { Play } from "lucide-react";
import Image from "next/image";

import type { Video } from "@/types/meme";

import { getYouTubeVideoId, platformLabels } from "../lib/video-url";

export function getVideoThumbnailUrl(video: Video) {
  if (video.thumbnailUrl) {
    return video.thumbnailUrl.startsWith("/")
      ? `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${video.thumbnailUrl}`
      : video.thumbnailUrl;
  }
  const youtubeId = video.platform === "youtube" ? getYouTubeVideoId(video.url) : null;
  return youtubeId ? `https://i3.ytimg.com/vi/${youtubeId}/hqdefault.jpg` : null;
}

export function VideoThumbnail({ video, sizes }: { video: Video; sizes: string }) {
  const thumbnailUrl = getVideoThumbnailUrl(video);
  return thumbnailUrl ? (
    <Image alt="" className="object-cover" fill loading="lazy" sizes={sizes} src={thumbnailUrl} />
  ) : (
    <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_20%_10%,#fe2c5570,transparent_38%),radial-gradient(circle_at_80%_90%,#25f4ee55,transparent_38%),#171719] text-white">
      <span className="flex size-9 items-center justify-center rounded-full bg-white text-black shadow-[-2px_0_0_#25f4ee,2px_0_0_#fe2c55]">
        <Play className="ml-0.5 size-3.5 fill-current" aria-hidden="true" />
      </span>
      <span className="absolute bottom-2 left-2 text-[0.62rem] font-black uppercase tracking-[0.08em] text-white/60">
        {platformLabels[video.platform]}
      </span>
    </div>
  );
}

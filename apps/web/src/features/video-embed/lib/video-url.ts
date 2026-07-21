import type { Platform } from "@/types/meme";

export function getYouTubeVideoId(url: string) {
  try {
    const parsedUrl = new URL(url);

    if (parsedUrl.hostname === "youtu.be") {
      return parsedUrl.pathname.split("/").filter(Boolean)[0] ?? null;
    }

    if (
      parsedUrl.hostname.endsWith("youtube.com") ||
      parsedUrl.hostname.endsWith("youtube-nocookie.com")
    ) {
      if (parsedUrl.pathname === "/watch") {
        return parsedUrl.searchParams.get("v");
      }

      const [, route, id] = parsedUrl.pathname.split("/");
      if (["embed", "shorts", "live"].includes(route) && id) {
        return id;
      }
    }
  } catch {
    return null;
  }

  return null;
}

export function getInstagramEmbedUrl(url: string) {
  try {
    const parsedUrl = new URL(url);

    if (
      parsedUrl.hostname !== "instagram.com" &&
      !parsedUrl.hostname.endsWith(".instagram.com")
    ) {
      return null;
    }

    const [, route, shortcode] = parsedUrl.pathname.split("/");

    if (!["p", "reel", "tv"].includes(route) || !shortcode) {
      return null;
    }

    return `https://www.instagram.com/${route}/${shortcode}/embed/`;
  } catch {
    return null;
  }
}

export function getTikTokEmbedUrl(url: string) {
  try {
    const parsedUrl = new URL(url);

    if (
      parsedUrl.hostname !== "tiktok.com" &&
      !parsedUrl.hostname.endsWith(".tiktok.com")
    ) {
      return null;
    }

    const videoId = parsedUrl.pathname.match(/\/video\/(\d+)/)?.[1];

    return videoId
      ? `https://www.tiktok.com/player/v1/${videoId}?autoplay=1&mute=1&loop=1&music_info=0`
      : null;
  } catch {
    return null;
  }
}

export const platformLabels: Record<Platform, string> = {
  youtube: "YouTube",
  tiktok: "TikTok",
  instagram: "Instagram",
  x: "X",
  unknown: "외부 링크",
};

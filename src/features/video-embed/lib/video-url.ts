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

export const platformLabels: Record<Platform, string> = {
  youtube: "YouTube",
  tiktok: "TikTok",
  instagram: "Instagram",
  x: "X",
  unknown: "외부 링크",
};


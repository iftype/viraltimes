import type { Meme, Video } from "@/types/meme";

import { getYouTubeVideoId } from "@/features/video-embed/lib/video-url";

/**
 * 지정된 비디오 또는 origin.video 플랫폼 기반으로 카드 썸네일 URL을 자동 추론한다.
 *
 * 우선순위:
 * 1. meme.thumbnailUrl이 명시된 경우 그대로 사용 (단, "/thumbnails/" 로컬 경로는 basePath 처리)
 * 2. 전달된 video 또는 origin.video가 YouTube인 경우 ytimg CDN에서 고화질 썸네일 자동 추론
 * 3. 그 외 플랫폼은 null 반환 → 카드에서 플랫폼 컬러 placeholder 표시
 */
export function getMemeCardThumbnail(
  meme: Pick<Meme, "thumbnailUrl" | "origin">,
  basePath = "",
  video?: Video,
): string | null {
  // 1. 명시된 thumbnailUrl 우선
  if (meme.thumbnailUrl) {
    return meme.thumbnailUrl.startsWith("/")
      ? `${basePath}${meme.thumbnailUrl}`
      : meme.thumbnailUrl;
  }

  // 2. YouTube 비디오 → ytimg 자동 추론
  const targetVideo = video ?? meme.origin?.video;
  if (targetVideo?.platform === "youtube") {
    const id = getYouTubeVideoId(targetVideo.url);
    if (id) return `https://i3.ytimg.com/vi/${id}/hqdefault.jpg`;
  }

  // 3. TikTok/Instagram/X → 임베드가 있으므로 썸네일 없이 placeholder
  return null;
}

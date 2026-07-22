import type { Meme, Video } from "@/types/meme";

import { getYouTubeVideoId } from "@/features/video-embed/lib/video-url";

/**
 * 지정된 비디오 또는 origin.video 플랫폼 기반으로 카드 썸네일 URL을 자동 추론한다.
 *
 * 우선순위:
 * 1. 특정 video가 전달되면 해당 영상의 명시 썸네일 또는 YouTube 썸네일
 * 2. meme.thumbnailUrl이 명시된 경우 그대로 사용 (단, 로컬 경로는 basePath 처리)
 * 3. 원본 영상, 바이럴 영상 순으로 명시 썸네일 또는 YouTube 썸네일 자동 추론
 * 4. 찾지 못하면 null 반환 → 카드에서 플랫폼 컬러 placeholder 표시
 */
export function getMemeCardThumbnail(
  meme: Pick<Meme, "thumbnailUrl" | "origin"> & Partial<Pick<Meme, "trendingVideos">>,
  basePath = "",
  video?: Video,
): string | null {
  const resolveLocalUrl = (url: string) => url.startsWith("/") ? `${basePath}${url}` : url;
  const videoThumbnail = (candidate?: Video) => {
    if (!candidate) return null;
    if (candidate.thumbnailUrl) return resolveLocalUrl(candidate.thumbnailUrl);
    if (candidate.platform !== "youtube") return null;
    const id = getYouTubeVideoId(candidate.url);
    return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null;
  };

  // 피드에서 특정 영상이 선택된 경우 같은 밈의 다른 대표 이미지로 덮지 않는다.
  if (video) {
    const selectedVideoThumbnail = videoThumbnail(video);
    if (selectedVideoThumbnail) return selectedVideoThumbnail;
  }

  if (meme.thumbnailUrl) {
    return resolveLocalUrl(meme.thumbnailUrl);
  }

  const candidates = [meme.origin?.video, ...(meme.trendingVideos ?? [])];
  for (const candidate of candidates) {
    const thumbnail = videoThumbnail(candidate);
    if (thumbnail) return thumbnail;
  }

  return null;
}

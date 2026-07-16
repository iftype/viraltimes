export type Platform =
  | "youtube"
  | "tiktok"
  | "instagram"
  | "x"
  | "unknown";

export type OriginStatus = "verified" | "likely" | "needs-review";
export type MemeKind = "challenge" | "video-meme" | "community-meme";

export type Video = {
  id: string;
  platform: Platform;
  url: string;
  title: string;
  creator?: string;
  uploadedAt?: string;
  thumbnailUrl?: string;
  viewCountLabel?: string;
};

export type Evidence = {
  title: string;
  detail: string;
  url?: string;
};

export type OriginClaim = {
  status: OriginStatus;
  video: Video;
  summary: string;
  evidence: Evidence[];
  lastReviewedAt: string;
};

export type TimelineEventKind =
  | "origin"
  | "spread"
  | "variation"
  | "mainstream"
  | "remix";

export type TimelineEvent = {
  id: string;
  dateLabel: string;
  title: string;
  description: string;
  sourceUrl?: string;
  sourceLabel?: string;
  video?: Video;
  kind: TimelineEventKind;
};

export type Meme = {
  id: string;
  slug: string;
  title: string;
  kind: MemeKind;
  thumbnailUrl: string;
  thumbnailFit?: "cover" | "contain";
  aliases: string[];
  summary: string;
  origin: OriginClaim;
  timeline: TimelineEvent[];
  trendingVideos: Video[];
  relatedVideos: Video[];
  tags: string[];
  accent: string;
};

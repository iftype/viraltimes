export type Platform =
  | "youtube"
  | "tiktok"
  | "instagram"
  | "x"
  | "unknown";

export type OriginStatus = "verified" | "likely" | "needs-review";
export type MemeKind = "challenge" | "video-meme" | "community-meme";

export type MemeCategory = {
  id: string;
  slug: string;
  label: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
};

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
  lifecycle?: {
    originYear?: number;
    firstSeenAt?: string;
    lastObservedAt?: string;
    ageYears?: number;
    daysSinceLastObserved?: number;
  };
  categoryIds: string[];
  categories?: MemeCategory[];
  tags: string[];
  accent: string;
  participation?: {
    commentCount: number;
    proposalCount: number;
  };
};

export type ParticipationEntry = {
  id: string;
  type: "comment" | "proposal";
  memeId: string;
  author: string;
  body: string;
  section?: "description" | "origin" | "trending" | "related" | "timeline";
  action?: string;
  evidenceUrl?: string;
  status: "visible" | "pending" | "hidden";
  createdAt: string;
  updatedAt: string;
};

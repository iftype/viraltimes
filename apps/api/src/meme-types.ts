export const memeKinds = ["challenge", "video-meme", "community-meme"] as const;
export const originStatuses = ["verified", "likely", "needs-review"] as const;
export const platforms = ["youtube", "tiktok", "instagram", "x", "unknown"] as const;
export const timelineKinds = ["origin", "spread", "variation", "mainstream", "remix"] as const;
export const publicationStatuses = ["draft", "published", "archived"] as const;

export type MemeKind = (typeof memeKinds)[number];
export type OriginStatus = (typeof originStatuses)[number];
export type Platform = (typeof platforms)[number];
export type TimelineKind = (typeof timelineKinds)[number];
export type PublicationStatus = (typeof publicationStatuses)[number];

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

export type MemeLifecycle = {
  originYear?: number;
  firstSeenAt?: string;
  lastObservedAt?: string;
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
  origin: {
    status: OriginStatus;
    video: Video;
    summary: string;
    evidence: Array<{ title: string; detail: string; url?: string }>;
    lastReviewedAt: string;
  };
  timeline: Array<{
    id: string;
    dateLabel: string;
    title: string;
    description: string;
    sourceUrl?: string;
    sourceLabel?: string;
    video?: Video;
    kind: TimelineKind;
  }>;
  trendingVideos: Video[];
  relatedVideos: Video[];
  lifecycle?: MemeLifecycle;
  categoryIds: string[];
  tags: string[];
  accent: string;
};

export type StoredMeme = Meme & {
  publicationStatus: PublicationStatus;
  createdAt: string;
  updatedAt: string;
};

export type MemeDocument = { items: StoredMeme[] };

export const trendSources = [
  "youtube",
  "tiktok",
  "instagram",
  "google-trends",
  "community",
  "manual",
] as const;

export const trendMetrics = [
  "views",
  "likes",
  "posts",
  "mentions",
  "search-interest",
  "relative-score",
] as const;

export type TrendSource = (typeof trendSources)[number];
export type TrendMetric = (typeof trendMetrics)[number];

export type TrendSnapshot = {
  memeId: string;
  observedOn: string;
  source: TrendSource;
  metric: TrendMetric;
  value: number;
  sampleSize?: number;
  collectedAt: string;
};

export type TrendDocument = { items: TrendSnapshot[] };

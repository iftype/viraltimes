import {
  memeKinds,
  originStatuses,
  platforms,
  publicationStatuses,
  timelineKinds,
  type Meme,
  type MemeKind,
  type OriginStatus,
  type Platform,
  type PublicationStatus,
  type TimelineKind,
  type Video,
} from "./meme-types.js";

type ParseResult =
  | { ok: true; meme: Meme; publicationStatus: PublicationStatus }
  | { ok: false; error: string };

const text = (value: unknown, maxLength: number) =>
  typeof value === "string" ? value.trim().slice(0, maxLength) : "";

const optionalText = (value: unknown, maxLength: number) =>
  text(value, maxLength) || undefined;

const safeUrl = (value: unknown, allowRelative = false) => {
  const candidate = text(value, 2000);
  if (!candidate) return undefined;
  if (allowRelative && candidate.startsWith("/")) return candidate;
  try {
    const url = new URL(candidate);
    return url.protocol === "http:" || url.protocol === "https:"
      ? candidate
      : undefined;
  } catch {
    return undefined;
  }
};

const stringList = (value: unknown, limit: number) =>
  Array.isArray(value)
    ? value.map((item) => text(item, 80)).filter(Boolean).slice(0, limit)
    : [];

function parseVideo(value: unknown, fallbackId: string): Video | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  const url = safeUrl(raw.url);
  const title = text(raw.title, 160);
  const platform = platforms.includes(raw.platform as Platform)
    ? (raw.platform as Platform)
    : "unknown";
  if (!url || !title) return null;

  return {
    id: text(raw.id, 120) || fallbackId,
    platform,
    url,
    title,
    creator: optionalText(raw.creator, 120),
    uploadedAt: optionalText(raw.uploadedAt, 40),
    thumbnailUrl: safeUrl(raw.thumbnailUrl, true),
    viewCountLabel: optionalText(raw.viewCountLabel, 80),
  };
}

export function parseMemeInput(value: unknown): ParseResult {
  if (!value || typeof value !== "object") {
    return { ok: false, error: "사전 항목 데이터가 필요합니다." };
  }
  const raw = value as Record<string, unknown>;
  const slug = text(raw.slug, 80).toLowerCase();
  const title = text(raw.title, 120);
  const summary = text(raw.summary, 1000);
  const thumbnailUrl = safeUrl(raw.thumbnailUrl, true);
  const accent = text(raw.accent, 20) || "#fe2c55";
  const kind = memeKinds.includes(raw.kind as MemeKind)
    ? (raw.kind as MemeKind)
    : null;
  const publicationStatus = publicationStatuses.includes(
    raw.publicationStatus as PublicationStatus,
  )
    ? (raw.publicationStatus as PublicationStatus)
    : "draft";

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return { ok: false, error: "slug는 영문 소문자, 숫자, 하이픈만 사용할 수 있습니다." };
  }
  if (!title || !kind) {
    return { ok: false, error: "제목과 종류를 확인해 주세요." };
  }

  const originRaw = raw.origin as Record<string, unknown> | undefined;
  const originVideoRaw = originRaw?.video as Record<string, unknown> | undefined;
  const originVideoUrl = text(originVideoRaw?.url, 2000);
  const originVideoTitle = text(originVideoRaw?.title, 160);
  if (originVideoUrl && !safeUrl(originVideoUrl)) {
    return { ok: false, error: "원본 URL은 http 또는 https 주소여야 합니다." };
  }
  const originVideo = originVideoUrl && originVideoTitle
    ? parseVideo(originVideoRaw, `${slug}-origin`) ?? undefined
    : undefined;
  if ((originVideoUrl && !originVideoTitle) || (!originVideoUrl && originVideoTitle)) {
    return { ok: false, error: "원본 URL과 제목은 함께 입력하거나 모두 비워 주세요." };
  }
  const originSummary = text(originRaw?.summary, 1500);
  const originStatus = originStatuses.includes(originRaw?.status as OriginStatus)
    ? (originRaw?.status as OriginStatus)
    : "needs-review";
  const evidence = Array.isArray(originRaw?.evidence)
    ? originRaw.evidence
        .map((item) => {
          const entry = item as Record<string, unknown>;
          const entryTitle = text(entry?.title, 160);
          const detail = text(entry?.detail, 1500);
          if (!entryTitle || !detail) return null;
          return {
            title: entryTitle,
            detail,
            url: safeUrl(entry.url),
          };
        })
        .filter((item): item is NonNullable<typeof item> => Boolean(item))
        .slice(0, 20)
    : [];

  const timeline = Array.isArray(raw.timeline)
    ? raw.timeline
        .map((item, index) => {
          const entry = item as Record<string, unknown>;
          const dateLabel = text(entry?.dateLabel, 80);
          const entryTitle = text(entry?.title, 160);
          const description = text(entry?.description, 1500);
          const timelineKind = timelineKinds.includes(entry?.kind as TimelineKind)
            ? (entry.kind as TimelineKind)
            : "spread";
          if (!dateLabel || !entryTitle || !description) return null;
          return {
            id: text(entry.id, 120) || `${slug}-timeline-${index + 1}`,
            dateLabel,
            title: entryTitle,
            description,
            sourceUrl: safeUrl(entry.sourceUrl),
            sourceLabel: optionalText(entry.sourceLabel, 100),
            video: entry.video
              ? parseVideo(entry.video, `${slug}-timeline-video-${index + 1}`) ?? undefined
              : undefined,
            kind: timelineKind,
          };
        })
        .filter((item): item is NonNullable<typeof item> => Boolean(item))
        .slice(0, 30)
    : [];

  const parseVideos = (videos: unknown, prefix: string) =>
    Array.isArray(videos)
      ? videos
          .map((video, index) => parseVideo(video, `${slug}-${prefix}-${index + 1}`))
          .filter((video): video is Video => Boolean(video))
          .slice(0, 20)
      : [];

  const sourceLinkInputs = Array.isArray(raw.sourceLinks) ? raw.sourceLinks : [];
  const hasInvalidSourceLink = sourceLinkInputs.some((item) => {
    const entry = item as Record<string, unknown>;
    const url = text(entry?.url, 2000);
    return Boolean(url) && !safeUrl(url);
  });
  if (hasInvalidSourceLink) {
    return { ok: false, error: "커뮤니티 링크는 http 또는 https 주소여야 합니다." };
  }

  const sourceLinks = sourceLinkInputs
        .map((item, index) => {
          const entry = item as Record<string, unknown>;
          const url = safeUrl(entry.url);
          if (!url) return null;
          return {
            id: text(entry.id, 120) || `${slug}-source-${index + 1}`,
            title: text(entry.title, 160) || "관련 커뮤니티 링크",
            url,
            siteName: optionalText(entry.siteName, 100),
          };
        })
        .filter((item): item is NonNullable<typeof item> => Boolean(item))
        .slice(0, 30);

  const lifecycleRaw = raw.lifecycle as Record<string, unknown> | undefined;
  const originYearValue = Number(lifecycleRaw?.originYear);
  const originYear = Number.isInteger(originYearValue) && originYearValue >= 1900 && originYearValue <= new Date().getFullYear() + 1
    ? originYearValue
    : undefined;
  const firstSeenAt = optionalText(lifecycleRaw?.firstSeenAt, 40);
  const lastObservedAt = optionalText(lifecycleRaw?.lastObservedAt, 40);

  return {
    ok: true,
    publicationStatus,
    meme: {
      id: text(raw.id, 120) || slug,
      slug,
      title,
      kind,
      thumbnailUrl,
      thumbnailFit: raw.thumbnailFit === "contain" ? "contain" : "cover",
      aliases: stringList(raw.aliases, 20),
      summary,
      accent: /^#[0-9a-f]{6}$/i.test(accent) ? accent : "#fe2c55",
      origin: {
        status: originStatus,
        video: originVideo,
        summary: originSummary,
        evidence,
        lastReviewedAt: text(originRaw?.lastReviewedAt, 40) || new Date().toISOString().slice(0, 10),
      },
      timeline,
      trendingVideos: parseVideos(raw.trendingVideos, "trending"),
      relatedVideos: parseVideos(raw.relatedVideos, "related"),
      sourceLinks,
      lifecycle: {
        originYear,
        firstSeenAt,
        lastObservedAt,
      },
      categoryIds: stringList(raw.categoryIds, 20),
      tags: stringList(raw.tags, 30),
    },
  };
}

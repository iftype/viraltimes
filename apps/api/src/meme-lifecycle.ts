import type { Meme, MemeLifecycle } from "./meme-types.js";

const minimumYear = 1900;
const maximumYear = new Date().getFullYear() + 1;

function yearFromText(value?: string) {
  const year = Number(value?.match(/(?:19|20)\d{2}/)?.[0]);
  return Number.isInteger(year) && year >= minimumYear && year <= maximumYear
    ? year
    : undefined;
}

export function resolveOriginYear(meme: Meme) {
  const explicit = meme.lifecycle?.originYear;
  if (
    Number.isInteger(explicit) &&
    explicit !== undefined &&
    explicit >= minimumYear &&
    explicit <= maximumYear
  ) {
    return explicit;
  }

  const originEvent = meme.timeline.find((event) => event.kind === "origin");
  return (
    yearFromText(originEvent?.dateLabel) ??
    yearFromText(meme.lifecycle?.firstSeenAt) ??
    yearFromText(meme.origin.video?.uploadedAt)
  );
}

export function enrichLifecycle(meme: Meme): MemeLifecycle & {
  ageYears?: number;
  daysSinceLastObserved?: number;
} {
  const originYear = resolveOriginYear(meme);
  const lastObservedAt = meme.lifecycle?.lastObservedAt;
  const lastObservedTimestamp = lastObservedAt ? Date.parse(lastObservedAt) : Number.NaN;
  return {
    ...meme.lifecycle,
    originYear,
    firstSeenAt:
      meme.lifecycle?.firstSeenAt ??
      (/^\d{4}-\d{2}-\d{2}$/.test(meme.origin.video?.uploadedAt ?? "")
        ? meme.origin.video?.uploadedAt
        : undefined),
    ageYears: originYear === undefined ? undefined : Math.max(0, new Date().getFullYear() - originYear),
    daysSinceLastObserved: Number.isFinite(lastObservedTimestamp)
      ? Math.max(0, Math.floor((Date.now() - lastObservedTimestamp) / 86_400_000))
      : undefined,
  };
}

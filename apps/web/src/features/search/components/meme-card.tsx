import { ArrowUpRight, BookOpenText, Check, CircleHelp, Clock3, Play } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Badge, cn } from "@origin/ui";
import { getMemeCardThumbnail } from "@/lib/meme-thumbnail";
import { memeHref } from "@/lib/meme-href";
import type { Meme, MemeKind, OriginStatus } from "@/types/meme";

const kindLabels: Record<MemeKind, string> = {
  challenge: "챌린지",
  "video-meme": "영상 밈",
  "community-meme": "커뮤니티 밈",
  "minor-meme": "코리아 마이너 밈",
};

const statusMeta: Record<OriginStatus, { label: string; icon: typeof Check }> = {
  verified: { label: "출처 확인", icon: Check },
  likely: { label: "유력", icon: Clock3 },
  "needs-review": { label: "검토 중", icon: CircleHelp },
};

export function MemeCard({
  categoryLabel,
  meme,
  priority = false,
}: {
  categoryLabel?: string;
  meme: Meme;
  priority?: boolean;
}) {
  const status = statusMeta[meme.origin.status];
  const StatusIcon = status.icon;
  const MediaIcon = meme.kind === "community-meme" ? BookOpenText : Play;
  const thumbnailUrl = getMemeCardThumbnail(
    meme,
    process.env.NEXT_PUBLIC_BASE_PATH ?? "",
  );

  return (
    <Link
      className="group overflow-hidden rounded-[var(--vo-radius-xl)] border border-[var(--vo-color-border)] bg-white shadow-[var(--vo-shadow-card)] transition duration-200 hover:-translate-y-1 hover:shadow-[var(--vo-shadow-float)]"
      href={memeHref(meme.slug)}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-black">
        {thumbnailUrl ? (
          <Image
            alt={`${meme.title} 썸네일`}
            className={cn(
              "transition-transform duration-300 group-hover:scale-[1.03]",
              meme.thumbnailFit === "contain" ? "object-contain" : "object-cover",
            )}
            fill
            priority={priority}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            src={thumbnailUrl}
          />
        ) : (
          <MemeCardPlaceholder
            accentColor={meme.accent}
            platform={meme.origin.video?.platform}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/80" />

        <div className="absolute inset-x-0 top-0 flex items-center justify-between gap-3 p-4">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge className="bg-white/90 text-black">
              <StatusIcon className="size-3" aria-hidden="true" /> {status.label}
            </Badge>
            {meme.participation?.proposalCount ? (
              <Badge className="bg-[#fff7df] text-[#9a6200]">제안 {meme.participation.proposalCount}</Badge>
            ) : null}
            {meme.origin.video && meme.origin.video.url && meme.origin.video.url.trim().length > 0 && (
              <Badge className="bg-[#fe2c55] text-white">
                <Play className="size-3 fill-white" aria-hidden="true" /> 원본 영상
              </Badge>
            )}
          </div>
          <span className="flex size-9 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm">
            <MediaIcon className="size-4" aria-hidden="true" />
          </span>
        </div>
        <div className="absolute inset-x-0 bottom-0 p-4 text-white">
          <Badge className="bg-white/15 text-white backdrop-blur-sm">
            {meme.lifecycle?.originYear ? `${meme.lifecycle.originYear} · ` : ""}{categoryLabel ?? kindLabels[meme.kind]}
          </Badge>
          <h3 className="mt-3 text-2xl font-black leading-none tracking-[-0.045em]">
            {meme.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-xs leading-5 text-white/70">
            {meme.summary || "아직 설명이 등록되지 않았어요."}
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 px-4 py-3.5">
        <p className="min-w-0 truncate text-xs font-bold text-black/35">
          {meme.tags.slice(0, 3).map((tag) => `#${tag}`).join(" ")}
        </p>
        <ArrowUpRight className="size-4 shrink-0 text-black/30 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
      </div>
    </Link>
  );
}

/** 썸네일 URL이 없을 때 플랫폼·accent 컬러 기반 배경을 보여준다. */
function MemeCardPlaceholder({
  accentColor,
  platform,
}: {
  accentColor: string;
  platform?: string;
}) {
  const platformGradient: Record<string, string> = {
    tiktok:
      "radial-gradient(circle at 25% 15%, #fe2c5570, transparent 40%), radial-gradient(circle at 75% 85%, #25f4ee55, transparent 40%), #0d0d0d",
    instagram:
      "radial-gradient(circle at 20% 80%, #f09433aa, transparent 40%), radial-gradient(circle at 80% 20%, #bc1888aa, transparent 40%), #1a0a1a",
    x: "radial-gradient(circle at 50% 50%, #1d9bf055, transparent 60%), #000000",
    youtube:
      "radial-gradient(circle at 50% 35%, #ff000055, transparent 50%), #0f0f0f",
  };
  const bg =
    platformGradient[platform ?? ""] ??
    `radial-gradient(circle at 30% 30%, ${accentColor}66, transparent 55%), #111`;

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0"
      style={{ background: bg }}
    />
  );
}

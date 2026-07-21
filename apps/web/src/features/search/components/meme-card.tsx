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
  "minor-meme": "마이너 밈",
};

const statusMeta: Record<OriginStatus, { label: string; icon: typeof Check }> = {
  verified: { label: "확인", icon: Check },
  likely: { label: "유력", icon: Clock3 },
  "needs-review": { label: "검토중", icon: CircleHelp },
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
      className="group overflow-hidden rounded-2xl border border-black/8 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
      href={memeHref(meme.slug)}
    >
      {/* 1/4 콤팩트 비율 (aspect-[4/3]) */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-black">
        {thumbnailUrl ? (
          <Image
            alt={`${meme.title} 썸네일`}
            className={cn(
              "transition-transform duration-300 group-hover:scale-[1.03]",
              meme.thumbnailFit === "contain" ? "object-contain" : "object-cover",
            )}
            fill
            priority={priority}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            src={thumbnailUrl}
          />
        ) : (
          <MemeCardPlaceholder
            accentColor={meme.accent}
            platform={meme.origin.video?.platform}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/85" />

        {/* 상단 콤팩트 뱃지 */}
        <div className="absolute inset-x-0 top-0 flex items-center justify-between gap-1.5 p-2">
          <div className="flex flex-wrap items-center gap-1">
            <Badge className="bg-white/90 px-1.5 py-0.5 text-[0.58rem] font-bold text-black backdrop-blur-sm">
              <StatusIcon className="size-2.5" aria-hidden="true" /> {status.label}
            </Badge>
            {meme.origin.video?.url && (
              <Badge className="bg-[#fe2c55] px-1.5 py-0.5 text-[0.58rem] font-bold text-white">
                <Play className="size-2.5 fill-white" aria-hidden="true" /> 영상
              </Badge>
            )}
          </div>
          <span className="flex size-6 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm">
            <MediaIcon className="size-3" aria-hidden="true" />
          </span>
        </div>

        {/* 하단 콤팩트 제목 & 요약문 */}
        <div className="absolute inset-x-0 bottom-0 p-2.5 sm:p-3 text-white">
          <span className="inline-block rounded-md bg-white/20 px-1.5 py-0.5 text-[0.58rem] font-bold backdrop-blur-sm mb-1">
            {meme.lifecycle?.originYear ? `${meme.lifecycle.originYear} · ` : ""}{categoryLabel ?? kindLabels[meme.kind]}
          </span>
          <h3 className="line-clamp-1 text-sm sm:text-base font-black leading-snug tracking-tight">
            {meme.title}
          </h3>
          <p className="mt-0.5 line-clamp-2 text-[0.68rem] leading-tight text-white/80 font-medium">
            {meme.summary || "아직 설명이 등록되지 않았어요."}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 px-2.5 py-2">
        <p className="min-w-0 truncate text-[0.62rem] font-bold text-black/40">
          {meme.tags.slice(0, 2).map((tag) => `#${tag}`).join(" ") || `#${meme.slug}`}
        </p>
        <ArrowUpRight className="size-3.5 shrink-0 text-black/30 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
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

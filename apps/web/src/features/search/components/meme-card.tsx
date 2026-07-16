import { ArrowUpRight, BookOpenText, Check, CircleHelp, Clock3, Play } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Badge, cn } from "@origin/ui";
import { memeHref } from "@/lib/meme-href";
import type { Meme, OriginStatus } from "@/types/meme";

const kindLabels = {
  challenge: "챌린지",
  "video-meme": "영상 밈",
  "community-meme": "커뮤니티 밈",
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
  const thumbnailUrl = meme.thumbnailUrl.startsWith("/")
    ? `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${meme.thumbnailUrl}`
    : meme.thumbnailUrl;

  return (
    <Link
      className="group overflow-hidden rounded-[var(--vo-radius-xl)] border border-[var(--vo-color-border)] bg-white shadow-[var(--vo-shadow-card)] transition duration-200 hover:-translate-y-1 hover:shadow-[var(--vo-shadow-float)]"
      href={memeHref(meme.slug)}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-black">
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
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/75" />
        <div className="absolute inset-x-0 top-0 flex items-center justify-between gap-3 p-4">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge className="bg-white/90 text-black">
              <StatusIcon className="size-3" aria-hidden="true" /> {status.label}
            </Badge>
            <Badge className="bg-[#fff7df] text-[#9a6200]">제안 {meme.participation?.proposalCount ?? 0}</Badge>
          </div>
          <span className="flex size-9 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm">
            <MediaIcon className="size-4" aria-hidden="true" />
          </span>
        </div>
        <div className="absolute inset-x-0 bottom-0 p-4 text-white">
          <Badge className="bg-white/15 text-white backdrop-blur-sm">
            {categoryLabel ?? kindLabels[meme.kind]}
          </Badge>
          <h3 className="mt-3 text-2xl font-black leading-none tracking-[-0.045em]">
            {meme.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-xs leading-5 text-white/70">
            {meme.summary}
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

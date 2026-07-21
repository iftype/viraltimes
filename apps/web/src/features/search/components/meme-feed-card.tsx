import { ArrowUpRight, Check, CircleHelp, Clock3, MessageSquareText } from "lucide-react";
import Link from "next/link";

import { Badge } from "@origin/ui";
import { FeedMedia } from "@/features/video-embed/components/feed-media";
import { getMemeCardThumbnail } from "@/lib/meme-thumbnail";
import { memeHref } from "@/lib/meme-href";
import type { Meme, OriginStatus } from "@/types/meme";

const statusMeta: Record<OriginStatus, { label: string; icon: typeof Check }> = {
  verified: { label: "출처 확인", icon: Check },
  likely: { label: "유력", icon: Clock3 },
  "needs-review": { label: "검토 중", icon: CircleHelp },
};

export function MemeFeedCard({ categoryLabel, meme, priority = false }: { categoryLabel?: string; meme: Meme; priority?: boolean }) {
  const media = meme.trendingVideos[0] ?? meme.origin.video;
  const thumbnail = getMemeCardThumbnail(meme, process.env.NEXT_PUBLIC_BASE_PATH ?? "", media);
  const status = statusMeta[meme.origin.status];
  const StatusIcon = status.icon;

  return (
    <article className="overflow-hidden border-y border-black/6 bg-white sm:rounded-3xl sm:border sm:shadow-[var(--vo-shadow-card)]">
      <header className="flex items-center justify-between gap-3 px-4 py-3.5 sm:px-5">
        <Link className="min-w-0" href={memeHref(meme.slug)}>
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge className="bg-[#e8fffe] text-[#087b77]"><StatusIcon className="size-3" />{status.label}</Badge>
            <span className="text-[0.68rem] font-black text-black/35">{meme.lifecycle?.originYear ? `${meme.lifecycle.originYear} · ` : ""}{categoryLabel ?? "밈·챌린지"}</span>
          </div>
          <h2 className="mt-1.5 truncate text-xl font-black tracking-[-0.045em] sm:text-2xl">{meme.title}</h2>
        </Link>
        <Link aria-label={`${meme.title} 상세 보기`} className="flex size-10 shrink-0 items-center justify-center rounded-full bg-black text-white" href={memeHref(meme.slug)}><ArrowUpRight className="size-4" /></Link>
      </header>

      <FeedMedia posterUrl={thumbnail} priority={priority} video={media} />

      <div className="px-4 py-4 sm:px-5 sm:py-5">
        <p className="text-sm font-bold leading-6 text-black/72">{meme.summary || "아직 설명을 정리하고 있어요. 영상이나 원문을 먼저 확인해보세요."}</p>
        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="min-w-0 truncate text-xs font-bold text-black/35">{meme.tags.slice(0, 4).map((tag) => `#${tag}`).join(" ")}</p>
          <Link className="flex shrink-0 items-center gap-1 rounded-full bg-black/5 px-3 py-2 text-xs font-black text-black/60" href={`/proposals?meme=${encodeURIComponent(meme.slug)}`}><MessageSquareText className="size-3.5" />제안 {meme.participation?.proposalCount ?? 0}</Link>
        </div>
      </div>
    </article>
  );
}

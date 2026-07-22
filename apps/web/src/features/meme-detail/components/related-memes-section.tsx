import { ArrowUpRight, Link2 } from "lucide-react";
import Link from "next/link";

import { Badge, buttonClassName, cn } from "@origin/ui";
import { ResilientImage } from "@/components/resilient-image";
import { getMemeCardThumbnail } from "@/lib/meme-thumbnail";
import { memeHref } from "@/lib/meme-href";
import type { Meme } from "@/types/meme";

const statusLabel = { verified: "출처 확인", likely: "유력", "needs-review": "검토 중" };

export function RelatedMemesSection({ meme, memes }: { meme: Meme; memes: Meme[] }) {
  return (
    <section className="page-shell py-8 sm:py-12">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-black text-black/35">MEME CONNECTIONS</p>
        <h2 className="mt-1 text-xl font-black tracking-[-0.035em]">연결된 밈</h2>
        <p className="mt-1 text-xs leading-5 text-black/45">실제로 파생되었거나 함께 쓰이는 항목만 연결합니다.</p>
        {memes.length ? (
          <div className="hide-scrollbar -mx-4 mt-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
            {memes.map((related) => {
              const thumbnailUrl = getMemeCardThumbnail(related, process.env.NEXT_PUBLIC_BASE_PATH ?? "");
              return (
                <Link className="group w-[42%] min-w-[9rem] max-w-[11rem] shrink-0 snap-start overflow-hidden rounded-xl border border-black/5 bg-white shadow-[var(--vo-shadow-card)]" href={memeHref(related.slug)} key={related.id}>
                  <div className="relative aspect-square overflow-hidden bg-black">
                    {thumbnailUrl ? <ResilientImage alt={`${related.title} 미리보기`} className={cn("transition-transform duration-300 group-hover:scale-[1.04]", related.thumbnailFit === "contain" ? "object-contain" : "object-cover")} fallback={<div aria-hidden="true" className="absolute inset-0" style={{ background: `radial-gradient(circle at 30% 30%, ${related.accent}66, transparent 55%), #111` }} />} fill sizes="176px" src={thumbnailUrl} /> : <div aria-hidden="true" className="absolute inset-0" style={{ background: `radial-gradient(circle at 30% 30%, ${related.accent}66, transparent 55%), #111` }} />}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/20" />
                    <Badge className="absolute left-2 top-2 bg-white/90 px-2 py-1 text-[0.6rem] text-black">{statusLabel[related.origin.status]}</Badge>
                    <h3 className="absolute inset-x-2 bottom-2 text-sm font-black tracking-[-0.03em] text-white">{related.title}</h3>
                  </div>
                  <div className="flex items-center justify-between gap-2 p-2.5 text-[0.68rem] font-black text-black/35"><span>연결 보기</span><ArrowUpRight className="size-3.5" /></div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-dashed border-black/10 bg-white p-4">
            <div className="flex min-w-0 items-center gap-3"><span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-black/5"><Link2 className="size-4" /></span><p className="text-xs leading-5 text-black/45">아직 확인된 연결 관계가 없어요.</p></div>
            <Link className={buttonClassName({ variant: "secondary", size: "sm", className: "shrink-0" })} href={`/proposals?meme=${encodeURIComponent(meme.slug)}`}>연결 제안</Link>
          </div>
        )}
      </div>
    </section>
  );
}

import { ArrowUpRight, MessageSquareText } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Badge, buttonClassName, cn } from "@origin/ui";
import { getMemeCardThumbnail } from "@/lib/meme-thumbnail";
import { memeHref } from "@/lib/meme-href";
import type { Meme } from "@/types/meme";

const statusLabel = { verified: "출처 확인", likely: "유력", "needs-review": "검토 중" };

export function RelatedMemesSection({ memes }: { memes: Meme[] }) {
  return (
    <section className="page-shell py-14 sm:py-20">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-black text-black/35">MEME DICTIONARY</p>
        <h2 className="mt-1 text-2xl font-black tracking-[-0.04em]">다른 밈·챌린지 알아보기</h2>
        <p className="mt-2 text-sm text-black/45">대표 장면과 검토 상태를 보고 다음 항목을 골라보세요.</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {memes.map((meme) => {
            const thumbnailUrl = getMemeCardThumbnail(
              meme,
              process.env.NEXT_PUBLIC_BASE_PATH ?? "",
            );
            return (
              <Link className="group overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[var(--vo-shadow-card)]" href={memeHref(meme.slug)} key={meme.id}>
                <div className="relative aspect-[4/3] overflow-hidden bg-black">
                  {thumbnailUrl ? (
                    <Image alt={`${meme.title} 미리보기`} className={cn("transition-transform duration-300 group-hover:scale-[1.04]", meme.thumbnailFit === "contain" ? "object-contain" : "object-cover")} fill sizes="(max-width: 640px) 100vw, 33vw" src={thumbnailUrl} />
                  ) : (
                    <div
                      aria-hidden="true"
                      className="absolute inset-0"
                      style={{
                        background: `radial-gradient(circle at 30% 30%, ${meme.accent}66, transparent 55%), #111`,
                      }}
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
                  <Badge className="absolute left-3 top-3 bg-white/90 text-black">{statusLabel[meme.origin.status]}</Badge>
                  <h3 className="absolute inset-x-3 bottom-3 text-xl font-black tracking-[-0.04em] text-white">{meme.title}</h3>
                </div>
                <div className="p-4">
                  <p className="line-clamp-2 text-xs leading-5 text-black/45">{meme.summary}</p>
                  <div className="mt-3 flex items-center justify-between gap-2 text-[0.68rem] font-black text-black/30">
                    <span className="inline-flex items-center gap-1"><MessageSquareText className="size-3" />제안 {meme.participation?.proposalCount ?? 0}</span>
                    <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
        <Link className={buttonClassName({ className: "mt-5" })} href="/">사전 전체 보기<ArrowUpRight className="size-4" /></Link>
      </div>
    </section>
  );
}

import { ExternalLink } from "lucide-react";

import { Card } from "@origin/ui";
import { ProposalButton } from "@/features/contributions/components/proposal-button";
import { VideoEmbed } from "@/features/video-embed/components/video-embed";
import type { Meme } from "@/types/meme";

export function OriginSection({ meme }: { meme: Meme }) {
  return (
    <section className="page-shell pb-14 sm:pb-20">
      <Card className="mx-auto max-w-3xl p-4 sm:p-7">
        <div className="mb-5 flex flex-col gap-4 px-1 sm:flex-row sm:items-start sm:justify-between">
          <div><p className="text-xs font-black text-[#fe2c55]">ORIGINAL</p><h2 className="mt-1 text-2xl font-black tracking-[-0.04em]">현재 확인된 원본</h2><p className="mt-2 text-sm leading-6 text-black/50">{meme.origin.summary}</p></div>
          <ProposalButton className="w-full sm:w-auto" memeId={meme.id} memeTitle={meme.title} section="origin" />
        </div>
        <VideoEmbed video={meme.origin.video} priority />
        <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-[#f7f7f8] p-4"><dt className="text-[0.65rem] font-bold text-black/35">업로더</dt><dd className="mt-1 truncate text-sm font-bold">{meme.origin.video.creator ?? "알 수 없음"}</dd></div>
          <div className="rounded-2xl bg-[#f7f7f8] p-4"><dt className="text-[0.65rem] font-bold text-black/35">업로드</dt><dd className="mt-1 text-sm font-bold">{meme.origin.video.uploadedAt ?? "날짜 미상"}</dd></div>
          <a className="col-span-2 flex items-center justify-between rounded-2xl bg-black p-4 text-white sm:col-span-1" href={meme.origin.video.url} target="_blank" rel="noreferrer"><span className="text-sm font-bold">원본 열기</span><ExternalLink className="size-4" /></a>
        </dl>
        <div className="mt-10 border-t border-black/5 pt-8">
          <p className="text-xs font-black text-[#8b5cf6]">EVIDENCE</p><h2 className="mt-1 text-xl font-black tracking-[-0.03em]">이 원본을 지지하는 근거</h2>
          <ol className="mt-5 space-y-3">
            {meme.origin.evidence.map((evidence, index) => (
              <li className="flex gap-4 rounded-2xl border border-black/5 bg-[#f7f7f8] p-5" key={`${evidence.title}-${index}`}>
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white text-[0.65rem] font-black text-black/35 shadow-sm">{index + 1}</span>
                <div><h3 className="font-black">{evidence.title}</h3><p className="mt-1.5 text-sm leading-6 text-black/50">{evidence.detail}</p>{evidence.url && <a className="mt-3 inline-flex items-center gap-1.5 text-xs font-black text-[#fe2c55]" href={evidence.url} target="_blank" rel="noreferrer">근거 링크<ExternalLink className="size-3" /></a>}</div>
              </li>
            ))}
          </ol>
        </div>
      </Card>
    </section>
  );
}

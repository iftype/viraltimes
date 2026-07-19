import { ExternalLink } from "lucide-react";

import { Card } from "@origin/ui";
import { ProposalButton } from "@/features/contributions/components/proposal-button";
import { VideoEmbed } from "@/features/video-embed/components/video-embed";
import type { Meme } from "@/types/meme";

export function OriginSection({ meme }: { meme: Meme }) {
  const video = meme.origin.video;
  const hasVideo = Boolean(video?.url.trim());
  const isMinorMeme = meme.kind === "minor-meme";
  const sourceLinks = meme.sourceLinks ?? [];

  return (
    <section className="page-shell pb-14 sm:pb-20">
      <Card className="mx-auto max-w-3xl p-4 sm:p-7">
        <div className="mb-5 flex flex-col gap-4 px-1 sm:flex-row sm:items-start sm:justify-between">
          <div><p className="text-xs font-black text-[#fe2c55]">{isMinorMeme ? "SOURCE & CONTEXT" : "ORIGINAL"}</p><h2 className="mt-1 text-2xl font-black tracking-[-0.04em]">{isMinorMeme ? "알려진 출처와 사용 맥락" : "현재 확인된 원본"}</h2><p className="mt-2 text-sm leading-6 text-black/50">{meme.origin.summary || (isMinorMeme ? "특정 원본이 없거나 아직 확인되지 않은 밈입니다. 커뮤니티 링크와 사용례를 함께 모읍니다." : "원본 설명을 검토 중입니다.")}</p></div>
          <ProposalButton className="w-full sm:w-auto" memeId={meme.id} memeTitle={meme.title} section="origin" />
        </div>

        {hasVideo && video ? (
          <>
            <VideoEmbed video={video} priority />
            <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-[#f7f7f8] p-4"><dt className="text-[0.65rem] font-bold text-black/35">업로더</dt><dd className="mt-1 truncate text-sm font-bold">{video.creator ?? "알 수 없음"}</dd></div>
              <div className="rounded-2xl bg-[#f7f7f8] p-4"><dt className="text-[0.65rem] font-bold text-black/35">업로드</dt><dd className="mt-1 text-sm font-bold">{video.uploadedAt ?? "날짜 미상"}</dd></div>
              <a className="col-span-2 flex items-center justify-between rounded-2xl bg-black p-4 text-white sm:col-span-1" href={video.url} target="_blank" rel="noreferrer"><span className="text-sm font-bold">원본 영상 열기</span><ExternalLink className="size-4" /></a>
            </dl>
          </>
        ) : (
          <div className="rounded-[var(--vo-radius-xl)] border border-dashed border-black/10 bg-[#f7f7f8]/50 p-6 text-center text-sm font-bold text-black/35">
            단일 원본 영상이 없거나 아직 확인되지 않았습니다. 아래 링크와 사용례를 먼저 확인해 주세요.
          </div>
        )}
        {sourceLinks.length > 0 && <div className="mt-6 grid gap-2 sm:grid-cols-2">
          {sourceLinks.map((link) => <a className="flex items-center justify-between gap-3 rounded-2xl border border-black/5 bg-[#f7f7f8] p-4 text-sm font-black hover:border-black/20" href={link.url} key={link.id} rel="noreferrer" target="_blank"><span className="min-w-0"><span className="block truncate">{link.title}</span>{link.siteName && <span className="mt-1 block text-[0.68rem] text-black/35">{link.siteName}</span>}</span><ExternalLink className="size-4 shrink-0 text-black/35" /></a>)}
        </div>}
        {meme.origin.evidence.length > 0 && <div className="mt-8 border-t border-black/5 pt-7">
          <p className="text-xs font-black text-[#8b5cf6]">EVIDENCE</p><h2 className="mt-1 text-xl font-black tracking-[-0.03em]">{isMinorMeme ? "확인된 사용례와 근거" : "이 원본을 지지하는 근거"}</h2>
          <ol className="mt-5 space-y-3">
            {meme.origin.evidence.map((evidence, index) => (
              <li className="flex gap-4 rounded-2xl border border-black/5 bg-[#f7f7f8] p-5" key={`${evidence.title}-${index}`}>
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white text-[0.65rem] font-black text-black/35 shadow-sm">{index + 1}</span>
                <div><h3 className="font-black">{evidence.title}</h3><p className="mt-1.5 text-sm leading-6 text-black/50">{evidence.detail}</p>{evidence.url && <a className="mt-3 inline-flex items-center gap-1.5 text-xs font-black text-[#fe2c55]" href={evidence.url} target="_blank" rel="noreferrer">근거 링크<ExternalLink className="size-3" /></a>}</div>
              </li>
            ))}
          </ol>
        </div>}
      </Card>
    </section>
  );
}

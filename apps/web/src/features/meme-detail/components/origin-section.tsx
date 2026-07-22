import { ExternalLink } from "lucide-react";

import { Card } from "@origin/ui";
import { ResilientImage } from "@/components/resilient-image";
import { VideoEmbed } from "@/features/video-embed/components/video-embed";
import type { Meme } from "@/types/meme";

export function OriginSection({ meme }: { meme: Meme }) {
  const video = meme.origin?.video;
  const hasVideo = Boolean(video?.url?.trim());
  const isMinorMeme = meme.kind === "minor-meme";
  const sourceLinks = meme.sourceLinks ?? [];
  const primarySource = sourceLinks[0];
  const thumbnailUrl = meme.thumbnailUrl ? (meme.thumbnailUrl.startsWith("/") ? `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${meme.thumbnailUrl}` : meme.thumbnailUrl) : null;
  const supportingOrigins = meme.kind === "challenge"
    ? [
        meme.origin.musicVideo ? { label: "원곡", video: meme.origin.musicVideo } : null,
        meme.origin.choreographyVideo ? { label: "안무 원본", video: meme.origin.choreographyVideo } : null,
      ].filter((item): item is { label: string; video: NonNullable<typeof meme.origin.video> } => Boolean(item))
    : [];

  return (
    <section className="page-shell pb-14 sm:pb-20">
      <Card className="mx-auto max-w-3xl p-4 sm:p-7">
        <div className="mb-5 px-1"><p className="text-xs font-black text-[#fe2c55]">{isMinorMeme ? "SOURCE" : "ORIGINAL"}</p><h2 className="mt-1 text-2xl font-black tracking-[-0.04em]">{isMinorMeme ? "처음 알려진 자료" : "원본부터 보기"}</h2></div>

        {hasVideo && video ? (
          <>
            <VideoEmbed video={video} priority />
            <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-[#f7f7f8] p-4"><dt className="text-[0.65rem] font-bold text-black/35">업로더</dt><dd className="mt-1 truncate text-sm font-bold">{video.creator ?? "알 수 없음"}</dd></div>
              <div className="rounded-2xl bg-[#f7f7f8] p-4"><dt className="text-[0.65rem] font-bold text-black/35">업로드</dt><dd className="mt-1 text-sm font-bold">{video.uploadedAt ?? "날짜 미상"}</dd></div>
              <a className="col-span-2 flex items-center justify-between rounded-2xl bg-black p-4 text-white sm:col-span-1" href={video.url} target="_blank" rel="noreferrer"><span className="text-sm font-bold">원본 영상 열기</span><ExternalLink className="size-4" /></a>
            </dl>
          </>
        ) : primarySource ? (
          <a className="group block overflow-hidden rounded-2xl bg-black" href={primarySource.url} rel="noreferrer" target="_blank">
            <div className="relative aspect-[4/3] sm:aspect-video">{thumbnailUrl ? <ResilientImage alt={`${primarySource.title} 게시글 미리보기`} className="object-cover opacity-90 transition group-hover:scale-[1.02]" fallback={<div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,#fe2c5566,transparent_45%),#171719]" />} fill priority sizes="(max-width: 768px) 100vw, 768px" src={thumbnailUrl} /> : <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,#fe2c5566,transparent_45%),#171719]" />}<div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/10" /><div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3 text-white"><div><p className="text-[0.65rem] font-black text-white/50">{primarySource.siteName ?? "원문 게시글"}</p><h3 className="mt-1 text-lg font-black">{primarySource.title}</h3></div><ExternalLink className="size-5 shrink-0" /></div></div>
          </a>
        ) : (
          <div className="rounded-[var(--vo-radius-xl)] border border-dashed border-black/10 bg-[#f7f7f8]/50 p-6 text-center text-sm font-bold text-black/35">
            원본을 찾고 있습니다. 확인된 바이럴 영상과 아래 자료를 먼저 확인해 주세요.
          </div>
        )}
        {supportingOrigins.length > 0 && (
          <div className="mt-6 border-t border-black/5 pt-5">
            <p className="mb-3 text-xs font-black text-black/40">챌린지 구성 원본</p>
            <div className="grid grid-cols-2 gap-3">
              {supportingOrigins.map(({ label, video: supportingVideo }) => (
                <div className="min-w-0" key={label}>
                  <p className="mb-2 text-[0.68rem] font-black text-[#fe2c55]">{label}</p>
                  <VideoEmbed video={supportingVideo} />
                </div>
              ))}
            </div>
          </div>
        )}
        {sourceLinks.length > (hasVideo ? 0 : 1) && <div className="mt-6 grid gap-2 sm:grid-cols-2">
          {sourceLinks.slice(hasVideo ? 0 : 1).map((link) => <a className="flex items-center justify-between gap-3 rounded-2xl border border-black/5 bg-[#f7f7f8] p-4 text-sm font-black hover:border-black/20" href={link.url} key={link.id} rel="noreferrer" target="_blank"><span className="min-w-0"><span className="block truncate">{link.title}</span>{link.siteName && <span className="mt-1 block text-[0.68rem] text-black/35">{link.siteName}</span>}</span><ExternalLink className="size-4 shrink-0 text-black/35" /></a>)}
        </div>}
      </Card>
    </section>
  );
}

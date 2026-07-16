import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  CircleHelp,
  Clock3,
  ExternalLink,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getMemeBySlug, sampleMemes } from "@/data/sample-memes";
import { ProposalButton } from "@/features/contributions/components/proposal-button";
import { ProposalDiscussion } from "@/features/contributions/components/proposal-discussion";
import { OriginTimeline } from "@/features/timeline/components/origin-timeline";
import { VideoEmbed } from "@/features/video-embed/components/video-embed";
import { VideoTabs } from "@/features/video-embed/components/video-tabs";
import type { OriginStatus } from "@/types/meme";

type MemePageProps = {
  params: Promise<{ slug: string }>;
};

const statusMeta: Record<
  OriginStatus,
  { label: string; icon: typeof Check; className: string }
> = {
  verified: {
    label: "출처 확인",
    icon: Check,
    className: "bg-[#e8fff4] text-[#14804a]",
  },
  likely: {
    label: "유력한 원본",
    icon: Clock3,
    className: "bg-[#fff7df] text-[#9a6200]",
  },
  "needs-review": {
    label: "검토 필요",
    icon: CircleHelp,
    className: "bg-[#f4efff] text-[#7047a5]",
  },
};

export const dynamicParams = false;

export function generateStaticParams() {
  return sampleMemes.map((meme) => ({ slug: meme.slug }));
}

export async function generateMetadata({
  params,
}: MemePageProps): Promise<Metadata> {
  const { slug } = await params;
  const meme = getMemeBySlug(slug);

  if (!meme) return {};

  return { title: meme.title, description: meme.summary };
}

export default async function MemePage({ params }: MemePageProps) {
  const { slug } = await params;
  const meme = getMemeBySlug(slug);

  if (!meme) notFound();

  const status = statusMeta[meme.origin.status];
  const StatusIcon = status.icon;
  const otherMemes = sampleMemes
    .filter((candidate) => candidate.id !== meme.id)
    .slice(0, 3);

  return (
    <>
      <article>
        <header className="page-shell py-10 sm:py-14">
          <div className="mx-auto max-w-3xl">
            <Link
              className="inline-flex items-center gap-1.5 text-sm font-bold text-black/45 hover:text-black"
              href="/"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              돌아가기
            </Link>

            <div className="mt-8 flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${status.className}`}
              >
                <StatusIcon className="size-3.5" aria-hidden="true" />
                {status.label}
              </span>
              <span className="text-xs font-medium text-black/35">
                {meme.origin.lastReviewedAt} 업데이트
              </span>
            </div>

            <h1 className="mt-5 text-5xl font-black leading-none tracking-[-0.065em] sm:text-7xl">
              {meme.title}
            </h1>
            <p className="mt-3 text-sm font-medium text-black/35">
              {meme.aliases.join(" · ")}
            </p>
            <p className="mt-6 max-w-2xl text-base leading-7 text-black/60 sm:text-lg">
              {meme.summary}
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <div className="flex flex-wrap gap-2">
                {meme.tags.map((tag) => (
                  <span
                    className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-black/50 shadow-sm"
                    key={tag}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
              <ProposalButton
                memeId={meme.id}
                memeTitle={meme.title}
                section="description"
              />
            </div>
          </div>
        </header>

        <section className="page-shell pb-14 sm:pb-20">
          <div className="mx-auto max-w-3xl rounded-3xl bg-white p-4 shadow-[0_8px_30px_rgba(0,0,0,0.05)] sm:p-7">
            <div className="mb-5 flex items-start justify-between gap-4 px-1">
              <div>
                <p className="text-xs font-black text-[#fe2c55]">ORIGINAL</p>
                <h2 className="mt-1 text-2xl font-black tracking-[-0.04em]">
                  현재 확인된 원본
                </h2>
                <p className="mt-2 text-sm leading-6 text-black/50">
                  {meme.origin.summary}
                </p>
              </div>
              <ProposalButton
                memeId={meme.id}
                memeTitle={meme.title}
                section="origin"
              />
            </div>

            <VideoEmbed video={meme.origin.video} priority />

            <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-[#f7f7f8] p-4">
                <dt className="text-[0.65rem] font-bold text-black/35">업로더</dt>
                <dd className="mt-1 truncate text-sm font-bold">
                  {meme.origin.video.creator ?? "알 수 없음"}
                </dd>
              </div>
              <div className="rounded-2xl bg-[#f7f7f8] p-4">
                <dt className="text-[0.65rem] font-bold text-black/35">업로드</dt>
                <dd className="mt-1 text-sm font-bold">
                  {meme.origin.video.uploadedAt ?? "날짜 미상"}
                </dd>
              </div>
              <a
                className="col-span-2 flex items-center justify-between rounded-2xl bg-black p-4 text-white sm:col-span-1"
                href={meme.origin.video.url}
                target="_blank"
                rel="noreferrer"
              >
                <span className="text-sm font-bold">원본 열기</span>
                <ExternalLink className="size-4" aria-hidden="true" />
              </a>
            </dl>

            <div className="mt-10 border-t border-black/5 pt-8">
              <p className="text-xs font-black text-[#8b5cf6]">EVIDENCE</p>
              <h2 className="mt-1 text-xl font-black tracking-[-0.03em]">
                이 원본을 지지하는 근거
              </h2>

              <ol className="mt-5 space-y-3">
                {meme.origin.evidence.map((evidence, index) => (
                  <li
                    className="flex gap-4 rounded-2xl border border-black/5 bg-[#f7f7f8] p-5"
                    key={evidence.title}
                  >
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white text-[0.65rem] font-black text-black/35 shadow-sm">
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="font-black">{evidence.title}</h3>
                      <p className="mt-1.5 text-sm leading-6 text-black/50">
                        {evidence.detail}
                      </p>
                      {evidence.url && (
                        <a
                          className="mt-3 inline-flex items-center gap-1.5 text-xs font-black text-[#fe2c55]"
                          href={evidence.url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          근거 링크
                          <ExternalLink className="size-3" aria-hidden="true" />
                        </a>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section className="border-y border-black/5 bg-white py-14 sm:py-20">
          <div className="page-shell">
            <div className="mx-auto max-w-3xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black text-[#fe2c55]">TRENDING CLIPS</p>
                  <h2 className="mt-1 text-2xl font-black tracking-[-0.04em]">
                    유행을 크게 만든 영상
                  </h2>
                </div>
                <ProposalButton
                  memeId={meme.id}
                  memeTitle={meme.title}
                  section="trending"
                />
              </div>
              <p className="mt-2 text-sm text-black/45">
                원본을 더 넓은 사람들에게 퍼뜨린 대표 게시물이에요. 수치는 마지막
                검토 시점 기준입니다.
              </p>
              {meme.trendingVideos.length ? (
                <div className="mt-6">
                  <VideoTabs videos={meme.trendingVideos} />
                </div>
              ) : (
                <div className="mt-6 rounded-2xl border border-dashed border-black/10 bg-[#f7f7f8] px-6 py-9 text-center text-sm text-black/40">
                  아직 확인된 트렌딩 영상이 없어요. 수정 제안으로 알려주세요.
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="page-shell py-14 sm:py-20">
          <div className="mx-auto max-w-3xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black text-[#8b5cf6]">RELATED</p>
                <h2 className="mt-1 text-2xl font-black tracking-[-0.04em]">
                  관련 영상
                </h2>
              </div>
              <ProposalButton
                memeId={meme.id}
                memeTitle={meme.title}
                section="related"
              />
            </div>
            <p className="mt-2 text-sm text-black/45">
              같은 포맷의 변형, 후속 참여, 맥락을 이해하는 데 도움이 되는
              영상이에요.
            </p>
            {meme.relatedVideos.length ? (
              <div className="mt-6">
                <VideoTabs videos={meme.relatedVideos} />
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-dashed border-black/10 bg-white px-6 py-9 text-center text-sm text-black/40">
                아직 등록된 관련 영상이 없어요. 수정 제안으로 알려주세요.
              </div>
            )}
          </div>
        </section>

        <section className="border-y border-black/5 bg-white py-14 sm:py-20">
          <div className="page-shell">
            <div className="mx-auto max-w-3xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black text-[#25a9a4]">TIMELINE</p>
                  <h2 className="mt-1 text-2xl font-black tracking-[-0.04em]">
                    시작부터 유행까지
                  </h2>
                </div>
                <ProposalButton
                  memeId={meme.id}
                  memeTitle={meme.title}
                  section="timeline"
                />
              </div>
              <p className="mt-2 text-sm text-black/45">
                각 단계의 링크를 열어 근거와 확산 흐름을 함께 확인해 보세요.
              </p>
              <div className="mt-8">
                <OriginTimeline events={meme.timeline} />
              </div>
            </div>
          </div>
        </section>

        <ProposalDiscussion memeId={meme.id} />

        <section className="page-shell py-14 sm:py-20">
          <div className="mx-auto max-w-3xl">
            <p className="text-xs font-black text-black/35">MEME DICTIONARY</p>
            <h2 className="mt-1 text-2xl font-black tracking-[-0.04em]">
              다른 밈·챌린지 알아보기
            </h2>
            <p className="mt-2 text-sm text-black/45">
              챌린지부터 오래된 인터넷 밈까지, 다음 항목을 넘겨보세요.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {otherMemes.map((otherMeme) => (
                  <Link
                    className="group flex min-h-48 flex-col rounded-2xl border border-black/5 bg-white p-5 shadow-[0_6px_20px_rgba(0,0,0,0.04)] transition-transform hover:-translate-y-1"
                    href={`/memes/${otherMeme.slug}`}
                    key={otherMeme.id}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="inline-flex items-center gap-2 text-xs font-black text-black/40">
                        <span
                          className="size-2 rounded-full"
                          style={{ backgroundColor: otherMeme.accent }}
                        />
                        {otherMeme.kind === "challenge"
                          ? "챌린지"
                          : otherMeme.kind === "video-meme"
                            ? "영상 밈"
                            : "커뮤니티 밈"}
                      </span>
                      <ArrowUpRight
                        className="size-4 text-black/25 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        aria-hidden="true"
                      />
                    </div>
                    <h3 className="mt-auto text-2xl font-black tracking-[-0.04em]">
                      {otherMeme.title}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-xs leading-5 text-black/45">
                      {otherMeme.summary}
                    </p>
                  </Link>
                ))}
            </div>

            <Link
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-black px-5 py-3 text-sm font-black text-white"
              href="/"
            >
              사전 전체 보기
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </article>
    </>
  );
}

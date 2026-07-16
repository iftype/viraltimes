import {
  ArrowLeft,
  Check,
  CircleHelp,
  Clock3,
  ExternalLink,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getMemeBySlug, sampleMemes } from "@/data/sample-memes";
import { SubmissionCta } from "@/features/submissions/components/submission-cta";
import { OriginTimeline } from "@/features/timeline/components/origin-timeline";
import { VideoEmbed } from "@/features/video-embed/components/video-embed";
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
            <div className="mt-5 flex flex-wrap gap-2">
              {meme.tags.map((tag) => (
                <span
                  className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-black/50 shadow-sm"
                  key={tag}
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </header>

        <section className="page-shell pb-14 sm:pb-20">
          <div className="mx-auto max-w-3xl rounded-3xl bg-white p-4 shadow-[0_8px_30px_rgba(0,0,0,0.05)] sm:p-7">
            <div className="mb-5 px-1">
              <p className="text-xs font-black text-[#fe2c55]">ORIGINAL</p>
              <h2 className="mt-1 text-2xl font-black tracking-[-0.04em]">
                현재 확인된 원본
              </h2>
              <p className="mt-2 text-sm leading-6 text-black/50">
                {meme.origin.summary}
              </p>
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
          </div>
        </section>

        <section className="border-y border-black/5 bg-white py-14 sm:py-20">
          <div className="page-shell">
            <div className="mx-auto max-w-3xl">
              <p className="text-xs font-black text-[#8b5cf6]">WHY THIS ONE?</p>
              <h2 className="mt-1 text-2xl font-black tracking-[-0.04em]">
                왜 이 영상인가요?
              </h2>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {meme.origin.evidence.map((evidence, index) => (
                  <article
                    className="rounded-2xl border border-black/5 bg-[#f7f7f8] p-5"
                    key={evidence.title}
                  >
                    <span className="text-xs font-black text-black/25">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h3 className="mt-3 font-black">{evidence.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-black/50">
                      {evidence.detail}
                    </p>
                    {evidence.url && (
                      <a
                        className="mt-4 inline-flex items-center gap-1.5 text-xs font-black text-[#fe2c55]"
                        href={evidence.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        근거 보기
                        <ExternalLink className="size-3" aria-hidden="true" />
                      </a>
                    )}
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="page-shell py-14 sm:py-20">
          <div className="mx-auto max-w-3xl">
            <p className="text-xs font-black text-[#25a9a4]">TIMELINE</p>
            <h2 className="mt-1 text-2xl font-black tracking-[-0.04em]">
              시작부터 유행까지
            </h2>
            <p className="mt-2 text-sm text-black/45">
              아래로 내려가며 퍼진 흐름을 확인해 보세요.
            </p>
            <div className="mt-8">
              <OriginTimeline events={meme.timeline} />
            </div>
          </div>
        </section>

        <section className="border-y border-black/5 bg-white py-14 sm:py-20">
          <div className="page-shell">
            <div className="mx-auto max-w-3xl">
              <p className="text-xs font-black text-[#fe2c55]">MORE CLIPS</p>
              <h2 className="mt-1 text-2xl font-black tracking-[-0.04em]">
                같이 보면 좋은 영상
              </h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {meme.topVideos.map((video) => (
                  <VideoEmbed key={video.id} video={video} />
                ))}
              </div>
            </div>
          </div>
        </section>
      </article>

      <div className="page-shell pt-14 sm:pt-20">
        <div className="mx-auto max-w-3xl">
          <SubmissionCta memeTitle={meme.title} />
        </div>
      </div>
    </>
  );
}

import {
  ArrowLeft,
  CalendarDays,
  Check,
  CircleHelp,
  Clock3,
  ExternalLink,
  Link2,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { sampleMemes, getMemeBySlug } from "@/data/sample-memes";
import { SubmissionCta } from "@/features/submissions/components/submission-cta";
import { OriginTimeline } from "@/features/timeline/components/origin-timeline";
import { VideoEmbed } from "@/features/video-embed/components/video-embed";
import type { OriginStatus } from "@/types/meme";

type MemePageProps = {
  params: Promise<{ slug: string }>;
};

const statusMeta: Record<
  OriginStatus,
  { label: string; description: string; icon: typeof Check; className: string }
> = {
  verified: {
    label: "출처 확인",
    description: "현재 자료에서 출처 연결이 확인된 상태",
    icon: Check,
    className: "bg-[#d9ead8] text-[#245b2d]",
  },
  likely: {
    label: "유력한 원본",
    description: "가장 이른 후보지만 추가 자료를 기다리는 상태",
    icon: Clock3,
    className: "bg-[#f5dfb5] text-[#7d5017]",
  },
  "needs-review": {
    label: "검토 필요",
    description: "최초 게시물을 특정하기 위해 더 많은 근거가 필요한 상태",
    icon: CircleHelp,
    className: "bg-[#e6dfef] text-[#60477b]",
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

  return {
    title: meme.title,
    description: meme.summary,
  };
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
        <header className="page-shell py-12 sm:py-20">
          <Link
            className="inline-flex items-center gap-2 text-sm font-semibold text-black/55 transition-colors hover:text-black"
            href="/"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            모든 기록
          </Link>

          <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_19rem] lg:items-end">
            <div>
              <div className="mb-7 flex flex-wrap items-center gap-3">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${status.className}`}
                >
                  <StatusIcon className="size-3.5" aria-hidden="true" />
                  {status.label}
                </span>
                <span className="text-xs font-semibold text-black/40">
                  마지막 검토 {meme.origin.lastReviewedAt}
                </span>
              </div>

              <h1 className="display-serif max-w-5xl text-[clamp(4.2rem,11vw,9rem)] leading-[0.82] tracking-[-0.075em]">
                {meme.title}
              </h1>
              <p className="mt-7 text-sm font-semibold text-black/40">
                {meme.aliases.join(" · ")}
              </p>
            </div>

            <div className="border-l-2 pl-6" style={{ borderColor: meme.accent }}>
              <p className="text-base leading-7 text-black/60">{meme.summary}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {meme.tags.map((tag) => (
                  <span
                    className="text-xs font-bold text-black/45"
                    key={tag}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </header>

        <section className="border-y border-black/15 bg-white/35 py-20 sm:py-28">
          <div className="page-shell">
            <div className="mb-10 grid gap-5 sm:grid-cols-[11rem_1fr]">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-black/40">
                01 / Current origin
              </p>
              <div>
                <h2 className="display-serif text-4xl tracking-[-0.05em] sm:text-6xl">
                  현재 확인된 원본
                </h2>
                <p className="mt-4 max-w-2xl leading-7 text-black/55">
                  {meme.origin.summary}
                </p>
              </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
              <VideoEmbed video={meme.origin.video} priority />

              <aside className="flex flex-col border border-black/15 bg-[#f3f0e8] p-7 sm:p-9">
                <div className="flex items-start gap-3 border-b border-black/10 pb-6">
                  <StatusIcon className="mt-0.5 size-5" aria-hidden="true" />
                  <div>
                    <p className="font-bold">{status.label}</p>
                    <p className="mt-1 text-sm leading-6 text-black/50">
                      {status.description}
                    </p>
                  </div>
                </div>

                <dl className="grid gap-5 py-7 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <dt className="flex items-center gap-2 text-black/45">
                      <Link2 className="size-4" aria-hidden="true" /> 플랫폼
                    </dt>
                    <dd className="font-semibold capitalize">
                      {meme.origin.video.platform}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt className="flex items-center gap-2 text-black/45">
                      <CalendarDays className="size-4" aria-hidden="true" /> 업로드
                    </dt>
                    <dd className="font-semibold">
                      {meme.origin.video.uploadedAt ?? "날짜 미상"}
                    </dd>
                  </div>
                </dl>

                <a
                  className="mt-auto flex items-center justify-between border-t border-black/10 pt-6 text-sm font-bold transition-opacity hover:opacity-50"
                  href={meme.origin.video.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  원본 페이지 열기
                  <ExternalLink className="size-4" aria-hidden="true" />
                </a>
              </aside>
            </div>
          </div>
        </section>

        <section className="page-shell py-20 sm:py-28">
          <div className="grid gap-12 lg:grid-cols-[18rem_1fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-black/40">
                02 / Evidence
              </p>
              <h2 className="display-serif mt-4 text-4xl tracking-[-0.045em]">
                왜 이 영상인가요?
              </h2>
            </div>

            <ol className="border-t border-black/15">
              {meme.origin.evidence.map((evidence, index) => (
                <li
                  className="grid gap-4 border-b border-black/15 py-7 sm:grid-cols-[3rem_1fr_auto] sm:items-start sm:gap-6"
                  key={evidence.title}
                >
                  <span className="text-xs font-bold tabular-nums text-black/35">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="font-bold">{evidence.title}</h3>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-black/55">
                      {evidence.detail}
                    </p>
                  </div>
                  {evidence.url && (
                    <a
                      className="inline-flex items-center gap-1.5 text-xs font-bold underline underline-offset-4"
                      href={evidence.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      근거 열기
                      <ExternalLink className="size-3" aria-hidden="true" />
                    </a>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="border-y border-black/15 bg-[#e9e5da] py-20 sm:py-28">
          <div className="page-shell">
            <div className="mb-12 grid gap-5 sm:grid-cols-[11rem_1fr]">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-black/40">
                03 / Timeline
              </p>
              <h2 className="display-serif text-4xl tracking-[-0.05em] sm:text-6xl">
                시작에서 유행까지
              </h2>
            </div>
            <OriginTimeline events={meme.timeline} />
          </div>
        </section>

        <section className="page-shell py-20 sm:py-28">
          <div className="mb-12 grid gap-5 sm:grid-cols-[11rem_1fr]">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-black/40">
              04 / Watchlist
            </p>
            <div>
              <h2 className="display-serif text-4xl tracking-[-0.05em] sm:text-6xl">
                대표 영상
              </h2>
              <p className="mt-4 text-sm text-black/50">
                원본과 확산 과정을 이해하는 데 도움이 되는 큐레이션입니다.
              </p>
            </div>
          </div>
          <div className="grid gap-7 lg:grid-cols-2">
            {meme.topVideos.map((video) => (
              <VideoEmbed key={video.id} video={video} />
            ))}
          </div>
        </section>
      </article>

      <div className="page-shell">
        <SubmissionCta memeTitle={meme.title} />
      </div>
    </>
  );
}

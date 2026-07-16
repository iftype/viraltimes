"use client";

import {
  ArrowUpRight,
  BookOpenText,
  Check,
  CircleHelp,
  Clock3,
  HelpCircle,
  Lightbulb,
  Play,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";

import { sampleMemes } from "@/data/sample-memes";
import type { OriginStatus } from "@/types/meme";

const kindLabels = {
  challenge: "챌린지",
  "video-meme": "영상 밈",
  "community-meme": "커뮤니티 밈",
};

const statusMeta: Record<
  OriginStatus,
  { label: string; icon: typeof Check }
> = {
  verified: { label: "출처 확인", icon: Check },
  likely: { label: "유력", icon: Clock3 },
  "needs-review": { label: "검토 중", icon: CircleHelp },
};

export function SearchExperience() {
  const [query, setQuery] = useState("");

  const filteredMemes = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("ko");
    if (!normalizedQuery) return sampleMemes;

    return sampleMemes.filter((meme) =>
      [meme.title, ...meme.aliases, ...meme.tags]
        .join(" ")
        .toLocaleLowerCase("ko")
        .includes(normalizedQuery),
    );
  }, [query]);

  return (
    <>
      <section className="page-shell pb-12 pt-14 text-center sm:pb-16 sm:pt-20">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fff0f3] px-3 py-1.5 text-xs font-bold text-[#e11d48]">
          <Sparkles className="size-3.5" aria-hidden="true" />
          밈 원본 찾기
        </span>
        <h1 className="mx-auto mt-5 max-w-2xl text-4xl font-black leading-[1.08] tracking-[-0.055em] sm:text-6xl">
          이 밈, 대체 어디서
          <br />
          시작된 거야? 👀
        </h1>
        <p className="mx-auto mt-5 max-w-lg text-sm leading-6 text-black/50 sm:text-base">
          원본 영상부터 유행 과정까지 짧고 쉽게 확인해 보세요.
        </p>

        <label
          className="mx-auto mt-8 flex max-w-xl items-center gap-3 rounded-2xl border border-black/5 bg-white p-2 pl-4 shadow-[0_8px_30px_rgba(0,0,0,0.08)]"
          htmlFor="meme-search"
        >
          <Search className="size-5 shrink-0 text-black/35" aria-hidden="true" />
          <span className="sr-only">밈 검색</span>
          <input
            id="meme-search"
            className="min-w-0 flex-1 bg-transparent py-2.5 text-base font-semibold outline-none placeholder:text-black/30"
            type="search"
            placeholder="밈 이름을 검색해 보세요"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          {query ? (
            <button
              className="rounded-xl p-2 text-black/40 hover:bg-black/5"
              type="button"
              onClick={() => setQuery("")}
              aria-label="검색어 지우기"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          ) : (
            <span className="hidden rounded-xl bg-black px-4 py-2.5 text-sm font-bold text-white sm:block">
              검색
            </span>
          )}
        </label>

        <div className="mx-auto mt-4 flex max-w-xl flex-col gap-2 sm:flex-row">
          <Link
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-4 py-3 text-sm font-black text-black/65 hover:border-black"
            href="/submit?type=request"
          >
            <HelpCircle className="size-4" aria-hidden="true" />
            알고 싶은 밈·챌린지
          </Link>
          <Link
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-black px-4 py-3 text-sm font-black text-white"
            href="/submit?type=origin"
          >
            <Lightbulb className="size-4" aria-hidden="true" />
            원본을 아는 밈·챌린지
          </Link>
        </div>
      </section>

      <div className="page-shell">
        <div className="flex items-center gap-2 rounded-xl bg-[#eefcff] px-4 py-3 text-xs font-medium text-black/55">
          <span className="size-2 shrink-0 rounded-full bg-[#25c4bd]" />
          지금은 프로토타입 샘플이에요. 공개 전 출처를 한 번 더 확인합니다.
        </div>
      </div>

      <section className="page-shell py-12 sm:py-16" id="explore">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="text-xs font-bold text-[#fe2c55]">ORIGIN FEED</p>
            <h2 className="mt-1 text-2xl font-black tracking-[-0.04em] sm:text-3xl">
              {query ? `“${query}” 검색 결과` : "지금 많이 찾는 밈"}
            </h2>
          </div>
          <span className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-black/45">
            {filteredMemes.length}개
          </span>
        </div>

        {filteredMemes.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {filteredMemes.map((meme, index) => {
              const status = statusMeta[meme.origin.status];
              const StatusIcon = status.icon;
              const thumbnailUrl = meme.thumbnailUrl.startsWith("/")
                ? `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${meme.thumbnailUrl}`
                : meme.thumbnailUrl;
              const MediaIcon =
                meme.kind === "community-meme" ? BookOpenText : Play;

              return (
                <Link
                  className="group overflow-hidden rounded-[1.75rem] border border-black/5 bg-white shadow-[0_10px_26px_rgba(0,0,0,0.08)] transition-transform hover:-translate-y-1"
                  href={`/memes/${meme.slug}`}
                  key={meme.id}
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-black">
                    <Image
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      src={thumbnailUrl}
                      alt={`${meme.title} 썸네일`}
                      fill
                      priority={index === 0}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/65" />
                    <div className="absolute inset-x-0 top-0 flex items-center justify-between gap-3 p-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-black">
                        <StatusIcon className="size-3" aria-hidden="true" />
                        {status.label}
                      </span>
                      <span className="flex size-10 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm">
                        <MediaIcon className="size-4" aria-hidden="true" />
                      </span>
                    </div>
                    <span className="absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-black text-black">
                      {kindLabels[meme.kind]}
                    </span>
                  </div>

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-2xl font-black leading-none tracking-[-0.045em]">
                        {meme.title}
                      </h3>
                      <ArrowUpRight
                        className="size-5 shrink-0 text-black/25 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        aria-hidden="true"
                      />
                    </div>
                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-black/50">
                      {meme.summary}
                    </p>
                    <p className="mt-4 truncate text-xs font-bold text-black/35">
                      {meme.tags.slice(0, 3).map((tag) => `#${tag}`).join(" ")}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="flex min-h-60 flex-col items-center justify-center rounded-3xl border border-dashed border-black/10 bg-white px-6 text-center">
            <p className="text-4xl">🫥</p>
            <p className="mt-3 text-lg font-bold">아직 기록이 없어요.</p>
            <p className="mt-1 text-sm text-black/45">다른 이름으로 찾아보세요.</p>
          </div>
        )}
      </section>
    </>
  );
}

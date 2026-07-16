"use client";

import {
  ArrowUpRight,
  Check,
  CircleHelp,
  Clock3,
  Play,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { sampleMemes } from "@/data/sample-memes";
import type { OriginStatus } from "@/types/meme";

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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredMemes.map((meme) => {
              const status = statusMeta[meme.origin.status];
              const StatusIcon = status.icon;

              return (
                <Link
                  className="group relative flex min-h-[380px] overflow-hidden rounded-[1.75rem] p-5 text-white shadow-[0_12px_30px_rgba(0,0,0,0.12)] transition-transform hover:-translate-y-1"
                  href={`/memes/${meme.slug}`}
                  key={meme.id}
                  style={{
                    background: `linear-gradient(155deg, ${meme.accent} 0%, #1f1f24 78%)`,
                  }}
                >
                  <span className="absolute -right-10 top-14 size-40 rounded-full border-[24px] border-white/10" />
                  <span className="absolute -bottom-12 -left-8 size-44 rounded-full bg-white/10 blur-2xl" />

                  <div className="relative z-10 flex w-full flex-col">
                    <div className="flex items-center justify-between gap-3">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-black">
                        <StatusIcon className="size-3" aria-hidden="true" />
                        {status.label}
                      </span>
                      <span className="flex size-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                        <Play className="ml-0.5 size-4 fill-current" aria-hidden="true" />
                      </span>
                    </div>

                    <div className="mt-auto">
                      <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-white/60">
                        Origin story
                      </p>
                      <h3 className="text-4xl font-black leading-none tracking-[-0.055em]">
                        {meme.title}
                      </h3>
                      <p className="mt-4 line-clamp-2 text-sm leading-6 text-white/70">
                        {meme.summary}
                      </p>
                      <div className="mt-5 flex items-end justify-between gap-3">
                        <p className="text-xs font-bold text-white/70">
                          {meme.tags.slice(0, 3).map((tag) => `#${tag}`).join(" ")}
                        </p>
                        <ArrowUpRight
                          className="size-5 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                          aria-hidden="true"
                        />
                      </div>
                    </div>
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

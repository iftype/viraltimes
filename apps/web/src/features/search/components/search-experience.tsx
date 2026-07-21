"use client";

import { CircleHelp, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Badge, buttonClassName } from "@origin/ui";
import { sampleMemes } from "@/data/sample-memes";
import type { Meme, MemeCategory } from "@/types/meme";

import { MemeCard } from "./meme-card";
import { VerificationTabs, type VerificationFilter } from "./verification-tabs";
import { YearTabs, type YearFilter } from "./year-tabs";
import { fallbackCategories, filterMemes } from "../lib/categories";

export function SearchExperience() {
  const query = useSearchParams().get("q")?.trim() ?? "";
  const [memes, setMemes] = useState<Meme[]>([]);
  const [categories, setCategories] = useState<MemeCategory[]>([]);
  const [verificationFilter, setVerificationFilter] = useState<VerificationFilter>("all");
  const [yearFilter, setYearFilter] = useState<YearFilter>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isFallback, setIsFallback] = useState(false);

  useEffect(() => {
    let active = true;
    void Promise.all([
      fetch("/api/v1/memes?page=1&pageSize=48&sort=latest", { cache: "no-store" }),
      fetch("/api/v1/categories", { cache: "no-store" }),
    ])
      .then(async ([memeResponse, categoryResponse]) => {
        if (!memeResponse.ok || !categoryResponse.ok) throw new Error("dictionary unavailable");
        const memeData = (await memeResponse.json()) as { items: Meme[] };
        const categoryData = (await categoryResponse.json()) as { items: MemeCategory[] };
        return { categories: categoryData.items, memes: memeData.items };
      })
      .then((data) => {
        if (!active) return;
        setMemes(data.memes);
        setCategories(data.categories);
        setIsFallback(false);
      })
      .catch(() => {
        if (!active) return;
        setMemes(sampleMemes);
        setCategories(fallbackCategories);
        setIsFallback(true);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const verificationCounts = useMemo(
    () => ({
      all: memes.length,
      verified: memes.filter((meme) => meme.origin.status === "verified").length,
      open: memes.filter((meme) => meme.origin.status !== "verified").length,
    }),
    [memes],
  );

  const statusFilteredMemes = useMemo(
    () => memes.filter((meme) => {
      if (verificationFilter === "verified") return meme.origin.status === "verified";
      if (verificationFilter === "open") return meme.origin.status !== "verified";
      return true;
    }),
    [memes, verificationFilter],
  );

  const years = useMemo(
    () => [...new Set(memes.map((meme) => meme.lifecycle?.originYear).filter((year): year is number => year !== undefined))].sort((a, b) => b - a),
    [memes],
  );
  const newestYear = years[0] ?? new Date().getFullYear();
  const yearCounts = useMemo(() => {
    const result: Record<string, number> = { all: statusFilteredMemes.length, recent: 0 };
    for (const meme of statusFilteredMemes) {
      const year = meme.lifecycle?.originYear;
      if (year === undefined) continue;
      result[String(year)] = (result[String(year)] ?? 0) + 1;
      if (year >= newestYear - 1) result.recent += 1;
    }
    return result;
  }, [newestYear, statusFilteredMemes]);
  const yearFilteredMemes = useMemo(
    () => statusFilteredMemes.filter((meme) => {
      if (yearFilter === "recent") return (meme.lifecycle?.originYear ?? 0) >= newestYear - 1;
      if (typeof yearFilter === "number") return meme.lifecycle?.originYear === yearFilter;
      return true;
    }),
    [newestYear, statusFilteredMemes, yearFilter],
  );

  const visibleMemes = useMemo(
    () => filterMemes(yearFilteredMemes, "all", query),
    [query, yearFilteredMemes],
  );

  return (
    <div className="page-shell pb-6 pt-3 sm:pt-4" id="explore">
      <section className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Badge className="bg-[#fff0f3] text-[#d91d46] text-[0.65rem] px-2 py-0.5">
            <Sparkles className="size-3" aria-hidden="true" /> ORIGIN FEED
          </Badge>
          <h1 className="mt-1.5 text-xl font-black leading-tight tracking-[-0.04em] sm:text-2xl">
            {query ? `“${query}” 검색 결과` : "밈·챌린지 원본 사전"}
          </h1>
          <p className="mt-1 text-xs text-black/45">
            원본과 확산 맥락이 확인된 항목을 골라보세요.
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-[0.68rem] font-bold text-black/35">
          <span className={`size-1.5 rounded-full ${isFallback ? "bg-[#f59e0b]" : "bg-[#25c4bd]"}`} />
          {isFallback ? "기본 사전" : "검토 완료 데이터"}
        </div>
      </section>

      {/* 퀴즈 테스트 유도 콤팩트 배너 */}
      <div className="mt-3 p-3.5 sm:p-4 rounded-xl bg-gradient-to-r from-[var(--vo-color-brand)] via-[#ff5436] to-[#fe792c] text-white flex items-center justify-between gap-3 shadow-md border border-red-500/10">
        <div className="space-y-0.5 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider uppercase bg-white/20 text-white">
              HOT MATCH TEST
            </span>
            <h2 className="text-xs sm:text-sm font-black tracking-tight truncate">
              마이너 밈, 얼마나 알고 있나요?
            </h2>
          </div>
          <p className="text-[0.68rem] text-white/80 font-medium truncate">
            5개 카드로 인지도를 확인해보세요.
          </p>
        </div>
        <Link 
          href="/quiz" 
          className="shrink-0 inline-flex items-center gap-1 bg-white text-neutral-900 font-extrabold text-xs px-3.5 py-2 rounded-lg hover:bg-neutral-50 active:scale-[0.98] transition-all shadow-sm"
        >
          테스트 시작 <ArrowRight size={14} />
        </Link>
      </div>

      <div className="mt-3">
        <VerificationTabs active={verificationFilter} counts={verificationCounts} onChange={setVerificationFilter} />
      </div>

      <div className="mt-2">
        <YearTabs active={yearFilter} counts={yearCounts} onChange={setYearFilter} years={years} />
      </div>

      <section className="mt-3" aria-busy={isLoading} aria-live="polite">
        {isLoading ? (
          <div className="grid gap-2.5 sm:gap-3.5 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {Array.from({ length: 10 }).map((_, index) => (
              <div className="h-36 animate-pulse rounded-xl bg-zinc-100/70" key={index} />
            ))}
          </div>
        ) : visibleMemes.length ? (
          <div className="grid gap-2.5 sm:gap-3.5 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {visibleMemes.map((meme, index) => (
              <MemeCard
                categoryLabel={
                  meme.categories?.[0]?.label ??
                  categories.find((category) => meme.categoryIds.includes(category.id))?.label
                }
                key={meme.id}
                meme={meme}
                priority={index < 4}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon="🫥"
            title="아직 기록이 없어요"
            description="검색어나 확인 상태를 바꿔보거나, 찾는 밈을 운영자에게 알려주세요."
            action={
              <Link
                className={buttonClassName({ variant: "secondary" })}
                href="/submit?type=request"
              >
                <CircleHelp className="size-4" aria-hidden="true" /> 없는 밈 요청
              </Link>
            }
          />
        )}
      </section>

      {!isLoading && visibleMemes.length > 0 && (
        <aside className="mt-6 flex items-center justify-between gap-3 rounded-xl bg-zinc-900 p-3.5 sm:p-4 text-white">
          <div>
            <p className="text-xs font-black">찾는 밈이나 챌린지가 없나요?</p>
            <p className="mt-0.5 text-[0.68rem] text-white/50">
              이름만 알아도 요청할 수 있고 원본 링크를 함께 제보할 수 있어요.
            </p>
          </div>
          <Link className={buttonClassName({ variant: "secondary", className: "shrink-0 border-white/15 bg-white text-black text-xs px-3 py-1.5 h-auto" })} href="/submit?type=request">
            추가 요청
          </Link>
        </aside>
      )}
    </div>
  );
}

function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[var(--vo-radius-xl)] border border-dashed border-black/10 bg-white p-12 text-center">
      <span className="text-4xl">{icon}</span>
      <h3 className="mt-3 text-lg font-black">{title}</h3>
      <p className="mt-1 text-xs text-black/50">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

"use client";

import { ArrowRight, CircleHelp, LoaderCircle, SlidersHorizontal, Sparkles } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Fragment, useEffect, useMemo, useState } from "react";

import { Badge, Button, EmptyState, buttonClassName } from "@origin/ui";
import type { Meme, MemeCategory } from "@/types/meme";

import { activeFilterCount, FeedFilterModal, type FeedFilters } from "./feed-filter-modal";
import { MemeFeedCard } from "./meme-feed-card";

type FeedResponse = {
  items: Meme[];
  pagination: { page: number; pageSize: number; total: number; totalPages: number; hasNext: boolean; hasPrevious: boolean };
  facets?: {
    years?: Array<{ value: number; count: number }>;
    tags?: Array<{ value: string; count: number }>;
  };
};

const initialFilters: FeedFilters = { verification: "all", categoryIds: [], tags: [] };

export function SearchExperience() {
  const query = useSearchParams().get("q")?.trim() ?? "";
  const [memes, setMemes] = useState<Meme[]>([]);
  const [categories, setCategories] = useState<MemeCategory[]>([]);
  const [filters, setFilters] = useState<FeedFilters>(initialFilters);
  const [facets, setFacets] = useState<NonNullable<FeedResponse["facets"]>>({ years: [], tags: [] });
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<FeedResponse["pagination"] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);

  const filterKey = useMemo(() => JSON.stringify(filters), [filters]);

  useEffect(() => {
    let active = true;
    void fetch("/api/v1/categories", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("카테고리를 불러오지 못했습니다.");
        return (await response.json()) as { items: MemeCategory[] };
      })
      .then((data) => { if (active) setCategories(data.items); })
      .catch(() => { if (active) setCategories([]); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({ page: String(page), pageSize: "12", sort: "latest" });
    if (query) params.set("query", query);
    if (filters.verification !== "all") params.set("verification", filters.verification);
    if (filters.categoryIds.length) params.set("categories", filters.categoryIds.join(","));
    if (filters.tags.length) params.set("tags", filters.tags.join(","));
    if (filters.fromYear) params.set("fromYear", String(filters.fromYear));
    if (filters.toYear) params.set("toYear", String(filters.toYear));

    void Promise.resolve().then(() => {
      setIsLoading(true);
      setError("");
      return fetch(`/api/v1/memes?${params}`, { cache: "no-store", signal: controller.signal });
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("피드를 불러오지 못했습니다.");
        return (await response.json()) as FeedResponse;
      })
      .then((data) => {
        setMemes((current) => page === 1 ? data.items : [...current, ...data.items.filter((item) => !current.some((currentItem) => currentItem.id === item.id))]);
        setPagination(data.pagination);
        setFacets(data.facets ?? { years: [], tags: [] });
      })
      .catch((cause) => {
        if (cause instanceof DOMException && cause.name === "AbortError") return;
        if (page === 1) setMemes([]);
        setError(cause instanceof Error ? cause.message : "피드를 불러오지 못했습니다.");
      })
      .finally(() => { if (!controller.signal.aborted) setIsLoading(false); });
    return () => controller.abort();
  }, [filterKey, filters, page, query]);

  const count = activeFilterCount(filters);
  const years = (facets.years ?? []).map((item) => item.value);
  const tags = useMemo(() => {
    if (facets.tags?.length) return facets.tags;
    const counts = new Map<string, number>();
    for (const meme of memes) for (const tag of meme.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
    return [...counts].sort(([, a], [, b]) => b - a).map(([value, count]) => ({ value, count }));
  }, [facets.tags, memes]);

  const applyFilters = (next: FeedFilters) => {
    setPage(1);
    setFilters(next);
    setFilterOpen(false);
  };

  return (
    <div className="page-shell pb-8 pt-5 sm:pt-8" id="explore">
      <section className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <Badge className="bg-[#fff0f3] text-[#d91d46]"><Sparkles className="size-3.5" aria-hidden="true" /> ORIGIN FEED</Badge>
          <h1 className="mt-2.5 text-2xl font-black leading-tight tracking-[-0.05em] sm:text-4xl">{query ? `“${query}” 피드` : "밈, 챌린지의 원본 피드"}</h1>
          <p className="mt-1.5 text-xs font-medium text-black/45 sm:text-sm">영상과 자료를 넘겨보다 궁금한 항목을 자세히 확인하세요.</p>
        </div>
        <button aria-expanded={filterOpen} className="relative flex shrink-0 items-center gap-2 rounded-full bg-black px-4 py-3 text-xs font-black text-white shadow-sm" onClick={() => setFilterOpen(true)} type="button"><SlidersHorizontal className="size-4" />필터{count > 0 && <span className="flex min-w-5 items-center justify-center rounded-full bg-[#fe2c55] px-1.5 py-0.5 text-[0.62rem]">{count}</span>}</button>
      </section>

      <section aria-busy={isLoading} aria-live="polite" className="-mx-4 mt-4 space-y-2 sm:mx-auto sm:mt-6 sm:max-w-2xl sm:space-y-5">
        {error && page === 1 ? (
          <EmptyState icon="📡" title="피드를 불러오지 못했어요" description={error} action={<Button onClick={() => setFilters({ ...filters })} variant="secondary">다시 시도</Button>} />
        ) : !memes.length && isLoading ? (
          Array.from({ length: 2 }).map((_, index) => <div className="h-[78dvh] animate-pulse bg-white sm:rounded-3xl" key={index} />)
        ) : memes.length ? (
          memes.map((meme, index) => (
            <Fragment key={meme.id}>
              <MemeFeedCard categoryLabel={meme.categories?.[0]?.label ?? categories.find((category) => meme.categoryIds.includes(category.id))?.label} meme={meme} priority={index === 0} />
              {index === 1 && <QuizFeedBanner />}
            </Fragment>
          ))
        ) : (
          <EmptyState icon="🫥" title="조건에 맞는 기록이 없어요" description="필터를 줄이거나 찾는 밈을 운영자에게 알려주세요." action={<Link className={buttonClassName({ variant: "secondary" })} href="/submit?type=request"><CircleHelp className="size-4" />없는 밈 요청</Link>} />
        )}

        {pagination?.hasNext && (
          <div className="px-4 py-3 sm:px-0"><Button className="w-full" disabled={isLoading} onClick={() => setPage((current) => current + 1)} variant="secondary">{isLoading ? <><LoaderCircle className="size-4 animate-spin" />불러오는 중</> : `피드 더 보기 · ${memes.length}/${pagination.total}`}</Button></div>
        )}
      </section>

      {!isLoading && memes.length > 0 && !pagination?.hasNext && (
        <aside className="mx-auto mt-7 flex max-w-2xl flex-col items-start justify-between gap-4 rounded-2xl bg-black p-5 text-white sm:flex-row sm:items-center">
          <div><p className="font-black">원하는 밈이 없나요?</p><p className="mt-1 text-xs leading-5 text-white/50">영상이나 게시글 링크 하나만 보내주세요.</p></div>
          <Link className={buttonClassName({ variant: "secondary", className: "shrink-0 border-white/15 bg-white text-black" })} href="/submit?type=request">추가 요청</Link>
        </aside>
      )}

      {filterOpen && <FeedFilterModal categories={categories} filters={filters} onApply={applyFilters} onClose={() => setFilterOpen(false)} tags={tags} years={years} />}
    </div>
  );
}

function QuizFeedBanner() {
  return (
    <aside className="mx-4 flex items-center justify-between gap-3 rounded-2xl bg-gradient-to-r from-[#fe2c55] to-[#ff7433] p-4 text-white shadow-lg sm:mx-0 sm:p-5">
      <div><p className="text-[0.65rem] font-black text-white/70">5 CARD MATCH</p><h2 className="mt-1 text-base font-black">이 밈들, 얼마나 알고 있나요?</h2></div>
      <Link className="flex shrink-0 items-center gap-1 rounded-full bg-white px-3.5 py-2.5 text-xs font-black text-black" href="/quiz">테스트<ArrowRight className="size-3.5" /></Link>
    </aside>
  );
}

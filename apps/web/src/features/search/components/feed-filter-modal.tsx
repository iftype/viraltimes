"use client";

import { Check, RotateCcw, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import type { MemeCategory } from "@/types/meme";

export type FeedFilters = {
  verification: "all" | "verified" | "open";
  categoryIds: string[];
  tags: string[];
  fromYear?: number;
  toYear?: number;
};

const emptyFilters: FeedFilters = {
  verification: "all",
  categoryIds: [],
  tags: [],
};

export function activeFilterCount(filters: FeedFilters) {
  return filters.categoryIds.length + filters.tags.length + (filters.verification === "all" ? 0 : 1) + (filters.fromYear ? 1 : 0) + (filters.toYear ? 1 : 0);
}

export function FeedFilterModal({
  categories,
  filters,
  onApply,
  onClose,
  tags,
  years,
}: {
  categories: MemeCategory[];
  filters: FeedFilters;
  onApply: (filters: FeedFilters) => void;
  onClose: () => void;
  tags: Array<{ value: string; count: number }>;
  years: number[];
}) {
  const [draft, setDraft] = useState(filters);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  const toggle = (key: "categoryIds" | "tags", value: string) => {
    setDraft((current) => ({
      ...current,
      [key]: current[key].includes(value)
        ? current[key].filter((item) => item !== value)
        : [...current[key], value],
    }));
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/55 sm:items-center sm:p-5">
      <button aria-label="필터 닫기" className="absolute inset-0 cursor-default" onClick={onClose} type="button" />
      <section aria-labelledby="feed-filter-title" aria-modal="true" className="relative flex max-h-[88dvh] w-full max-w-xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:max-h-[82vh] sm:rounded-3xl" role="dialog">
        <header className="flex shrink-0 items-center justify-between border-b border-black/5 px-5 py-4">
          <div>
            <p className="flex items-center gap-1.5 text-[0.68rem] font-black text-[#d91d46]"><SlidersHorizontal className="size-3.5" />FEED FILTER</p>
            <h2 className="mt-1 text-xl font-black tracking-[-0.04em]" id="feed-filter-title">원하는 밈만 골라보기</h2>
          </div>
          <button aria-label="닫기" className="rounded-full bg-black/5 p-2.5" onClick={onClose} type="button"><X className="size-4" /></button>
        </header>

        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain px-5 py-5">
          <FilterGroup label="확인 상태">
            <div className="grid grid-cols-3 gap-2">
              {([
                ["all", "전체"],
                ["verified", "확정"],
                ["open", "검토 중"],
              ] as const).map(([value, label]) => (
                <ChoiceButton active={draft.verification === value} key={value} label={label} onClick={() => setDraft((current) => ({ ...current, verification: value }))} />
              ))}
            </div>
          </FilterGroup>

          <FilterGroup description="여러 개를 함께 선택할 수 있어요." label="카테고리">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => <ChoiceButton active={draft.categoryIds.includes(category.id)} key={category.id} label={category.label} onClick={() => toggle("categoryIds", category.id)} />)}
            </div>
          </FilterGroup>

          <FilterGroup description="작은 주제나 플랫폼 키워드를 조합해보세요." label="태그">
            <div className="flex max-h-40 flex-wrap gap-2 overflow-y-auto rounded-2xl bg-[#f7f7f8] p-3">
              {tags.length ? tags.map((tag) => <ChoiceButton active={draft.tags.includes(tag.value)} key={tag.value} label={`#${tag.value} ${tag.count}`} onClick={() => toggle("tags", tag.value)} />) : <p className="text-xs font-bold text-black/35">아직 선택할 태그가 없어요.</p>}
            </div>
          </FilterGroup>

          <FilterGroup description="시작 연도 기준으로 범위를 정합니다." label="날짜 기간">
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
              <YearSelect label="시작" onChange={(fromYear) => setDraft((current) => ({ ...current, fromYear }))} value={draft.fromYear} years={years} />
              <span className="text-black/25">—</span>
              <YearSelect label="끝" onChange={(toYear) => setDraft((current) => ({ ...current, toYear }))} value={draft.toYear} years={years} />
            </div>
          </FilterGroup>
        </div>

        <footer className="grid shrink-0 grid-cols-[auto_1fr] gap-2 border-t border-black/5 bg-white p-4">
          <button className="flex items-center justify-center gap-1.5 rounded-xl bg-black/5 px-4 py-3 text-xs font-black" onClick={() => setDraft(emptyFilters)} type="button"><RotateCcw className="size-3.5" />초기화</button>
          <button className="flex items-center justify-center gap-1.5 rounded-xl bg-black px-4 py-3 text-xs font-black text-white" onClick={() => onApply(draft)} type="button"><Check className="size-4" />{activeFilterCount(draft) ? `${activeFilterCount(draft)}개 필터 적용` : "전체 피드 보기"}</button>
        </footer>
      </section>
    </div>
  );
}

function FilterGroup({ children, description, label }: { children: ReactNode; description?: string; label: string }) {
  return <section><div className="mb-2.5 flex items-end justify-between gap-3"><h3 className="text-sm font-black">{label}</h3>{description && <p className="text-[0.65rem] font-medium text-black/35">{description}</p>}</div>{children}</section>;
}

function ChoiceButton({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return <button aria-pressed={active} className={`rounded-full border px-3 py-2 text-xs font-black transition ${active ? "border-black bg-black text-white" : "border-black/8 bg-white text-black/55 hover:border-black/25"}`} onClick={onClick} type="button">{label}</button>;
}

function YearSelect({ label, onChange, value, years }: { label: string; onChange: (value?: number) => void; value?: number; years: number[] }) {
  return <label className="min-w-0 text-[0.65rem] font-black text-black/40">{label}<select className="mt-1.5 w-full rounded-xl border border-black/8 bg-white px-3 py-2.5 text-base font-black text-black outline-none" onChange={(event) => onChange(event.target.value ? Number(event.target.value) : undefined)} value={value ?? ""}><option value="">전체</option>{years.map((year) => <option key={year} value={year}>{year}년</option>)}</select></label>;
}

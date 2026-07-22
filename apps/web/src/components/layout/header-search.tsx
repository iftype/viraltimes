"use client";

import { ArrowRight, Search, X, Sparkles } from "lucide-react";
import Link from "next/link";
import { FormEvent, useEffect, useState, useRef } from "react";

import { Badge, cn } from "@origin/ui";
import { memeHref } from "@/lib/meme-href";
import type { Meme } from "@/types/meme";

export function HeaderSearch({
  className,
  expanded = false,
  onExpandedChange,
}: {
  className?: string;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
}) {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Meme[]>([]);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const [isFocused, setIsFocused] = useState(false);

  const updateExpanded = (focused: boolean, text: string) => {
    const nextExpanded = focused || text.trim().length > 0;
    onExpandedChange?.(nextExpanded);
  };

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      const search = query.trim();
      const params = new URLSearchParams({ page: "1", pageSize: "10" });
      if (search) params.set("query", search);
      void fetch(`/api/v1/memes?${params}`, {
        cache: "no-store",
        signal: controller.signal,
      })
        .then(async (response) => {
          if (!response.ok) throw new Error("search unavailable");
          return (await response.json()) as { items: Meme[] };
        })
        .then((data) => setResults(data.items))
        .catch(() => {
          if (!controller.signal.aborted) setResults([]);
        });
    }, 180);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  function submit(event: FormEvent<HTMLFormElement>) {
    if (!query.trim()) event.preventDefault();
  }

  return (
    <>
      {/* 검색창 포커스 시 배경 딤 & 블러 처리 */}
      {open && (
        <div
          className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm transition-opacity"
          onClick={() => {
            setOpen(false);
            setIsFocused(false);
            updateExpanded(false, query);
          }}
        />
      )}

      <form
        action={`${basePath}/memes`}
        className={cn("relative min-w-0 w-auto md:w-full z-[70]", className)}
        onSubmit={submit}
        role="search"
      >
        <div
          className={cn(
            "flex min-w-0 items-center gap-1.5 rounded-full border border-black/8 bg-white/90 transition-all duration-350 ease-[cubic-bezier(0.16,1,0.3,1)] focus-within:border-black/25 focus-within:bg-white cursor-pointer px-2.5 md:!w-full md:!h-10 md:!px-4 md:!py-2 md:gap-2.5 shadow-sm",
            expanded ? "w-[150px] sm:w-[220px] h-9" : "w-9 h-9"
          )}
          onClick={() => {
            inputRef.current?.focus();
          }}
        >
          <Search className="size-4 shrink-0 text-black/35 md:size-4.5" aria-hidden="true" />
          <input
            ref={inputRef}
            aria-label="밈 사전 검색"
            autoComplete="off"
            className={cn(
              "min-w-0 flex-1 bg-transparent text-base font-bold leading-none outline-none placeholder:font-medium placeholder:text-black/30 md:text-sm transition-all duration-200",
              expanded
                ? "opacity-100 pointer-events-auto ml-1 w-full"
                : "opacity-0 pointer-events-none w-0 ml-0 md:!opacity-100 md:!pointer-events-auto md:!w-full md:!ml-2"
            )}
            name="q"
            onChange={(event) => {
              const val = event.target.value;
              setQuery(val);
              setOpen(true);
              updateExpanded(isFocused, val);
            }}
            onFocus={() => {
              setOpen(true);
              setIsFocused(true);
              updateExpanded(true, query);
            }}
            placeholder="밈·챌린지 검색"
            type="search"
            value={query}
          />
          {query && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setQuery("");
                setResults([]);
                inputRef.current?.focus();
              }}
              className="p-1 text-black/30 hover:text-black"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* 꽉 차는 실시간 풀스크린/대형 검색 드롭다운 패널 */}
        {open && (
          <div
            className="fixed inset-x-3 top-14 z-[80] max-h-[82dvh] overflow-y-auto rounded-3xl border border-black/10 bg-white p-4 shadow-2xl sm:inset-x-6 sm:top-16 md:absolute md:left-auto md:right-0 md:top-[calc(100%+0.5rem)] md:w-[540px] md:max-h-[80vh] md:p-5"
            role="listbox"
          >
            <div className="flex items-center justify-between border-b border-black/5 pb-2.5 mb-2">
              <span className="text-xs font-black text-black/40 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="size-3 text-rose-500" />
                {query.trim() ? `&quot;${query}&quot; 검색 제안` : "추천 인기 밈 사전"}
              </span>
              <button
                type="button"
                className="text-xs font-bold text-black/40 hover:text-black"
                onClick={() => {
                  setOpen(false);
                  setIsFocused(false);
                  updateExpanded(false, query);
                }}
              >
                닫기
              </button>
            </div>

            {results.length === 0 ? (
              <div className="p-8 text-center text-xs font-bold text-black/40">
                일치하는 사전 항목이 없습니다.
              </div>
            ) : (
              <div className="grid gap-2">
                {results.map((meme) => (
                  <Link
                    className="group flex items-start justify-between gap-3 rounded-2xl p-3 transition hover:bg-black/[0.04] focus:bg-black/[0.04] focus:outline-none"
                    href={memeHref(meme.slug)}
                    key={meme.id}
                    onClick={() => {
                      setOpen(false);
                      setIsFocused(false);
                      updateExpanded(false, query);
                    }}
                    role="option"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className="size-2 rounded-full shrink-0"
                          style={{ backgroundColor: meme.accent || "#fe2c55" }}
                        />
                        <span className="truncate text-base font-black text-black group-hover:text-rose-600 transition">
                          {meme.title}
                        </span>
                        {meme.lifecycle?.originYear && (
                          <span className="text-xs font-bold text-black/35 shrink-0">
                            · {meme.lifecycle.originYear}년
                          </span>
                        )}
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-black/60 font-medium">
                        {meme.summary}
                      </p>
                      {meme.aliases.length > 0 && (
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {meme.aliases.slice(0, 3).map((alias) => (
                            <span
                              key={alias}
                              className="rounded-md bg-black/5 px-2 py-0.5 text-[0.65rem] font-bold text-black/50"
                            >
                              {alias}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <Badge className="bg-black/5 text-[0.65rem] font-bold text-black/60">
                        {meme.categories?.[0]?.label ?? "사전"}
                      </Badge>
                      <ArrowRight className="size-4 text-black/20 group-hover:text-black group-hover:translate-x-0.5 transition" />
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {query.trim() && (
              <div className="mt-3 border-t border-black/5 pt-3">
                <Link
                  className="flex items-center justify-between rounded-2xl bg-black px-4 py-3 text-xs font-black text-white shadow hover:bg-zinc-800 transition"
                  href={`/memes?q=${encodeURIComponent(query.trim())}`}
                  onClick={() => {
                    setOpen(false);
                    setIsFocused(false);
                    updateExpanded(false, query);
                  }}
                >
                  <span>&quot;{query.trim()}&quot; 관련 사전 전체 검색 결과 보기</span>
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            )}
          </div>
        )}
      </form>
    </>
  );
}

"use client";

import { ArrowRight, Search } from "lucide-react";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

import { Badge, cn } from "@origin/ui";
import { memeHref } from "@/lib/meme-href";
import type { Meme } from "@/types/meme";

export function HeaderSearch({ className }: { className?: string }) {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Meme[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      const search = query.trim();
      const params = new URLSearchParams({ page: "1", pageSize: "6" });
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
    <form
      action={`${basePath}/`}
      className={cn("relative min-w-0", className)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
      onSubmit={submit}
      role="search"
    >
      <div className="flex min-w-0 items-center gap-2 rounded-full border border-black/8 bg-[#f3f3f5] px-3.5 py-2 transition focus-within:border-black/25 focus-within:bg-white">
        <Search className="size-4 shrink-0 text-black/35" aria-hidden="true" />
        <input
          aria-label="밈 사전 검색"
          autoComplete="off"
          className="min-w-0 flex-1 bg-transparent text-base font-bold leading-none outline-none placeholder:font-medium placeholder:text-black/30 md:text-sm"
          name="q"
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="밈·챌린지 검색"
          type="search"
          value={query}
        />
      </div>

      {open && results.length > 0 && (
        <div className="absolute inset-x-0 top-[calc(100%+0.5rem)] z-[70] overflow-hidden rounded-2xl border border-black/8 bg-white p-2 shadow-[var(--vo-shadow-float)]" role="listbox">
          <p className="px-3 pb-2 pt-1 text-[0.65rem] font-black text-black/30">
            {query.trim() ? "검색 제안" : "최근 사전 항목"}
          </p>
          {results.map((meme) => (
            <Link
              className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 transition hover:bg-black/[0.04] focus:bg-black/[0.04] focus:outline-none"
              href={memeHref(meme.slug)}
              key={meme.id}
              onClick={() => setOpen(false)}
              role="option"
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-black">{meme.title}</span>
                <span className="mt-0.5 block truncate text-xs text-black/35">{meme.aliases.slice(0, 2).join(" · ") || meme.summary}</span>
              </span>
              <Badge className="shrink-0 bg-black/5 text-[0.62rem] text-black/45">{meme.categories?.[0]?.label ?? "사전"}</Badge>
            </Link>
          ))}
          {query.trim() && (
            <Link className="mt-1 flex items-center justify-between rounded-xl bg-black px-3 py-2.5 text-xs font-black text-white" href={`/?q=${encodeURIComponent(query.trim())}`} onClick={() => setOpen(false)}>
              전체 검색 결과 보기 <ArrowRight className="size-3.5" />
            </Link>
          )}
        </div>
      )}
    </form>
  );
}

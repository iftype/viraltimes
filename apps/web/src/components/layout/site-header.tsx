"use client";

import { MessageCircleMore, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

import { BrandMark, buttonClassName, cn } from "@origin/ui";

import { HeaderSearch } from "./header-search";

export function SiteHeader() {
  const pathname = usePathname();
  const [searchExpanded, setSearchExpanded] = useState(false);

  if (pathname === "/quiz") return null;

  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-white/92 backdrop-blur-xl">
      <div className="page-shell py-2 sm:py-2.5">
        <div className="relative flex items-center justify-between gap-2.5 md:grid md:grid-cols-[auto_1fr_minmax(14rem,24rem)_auto] md:gap-3">
          <Link className="flex shrink-0 items-center gap-2 font-black" href="/">
            <BrandMark />
            <span
              className={cn(
                "tracking-[-0.04em] transition-all duration-350 ease-[cubic-bezier(0.16,1,0.3,1)] md:inline overflow-hidden whitespace-nowrap",
                searchExpanded ? "max-sm:w-0 max-sm:opacity-0 max-sm:mr-0" : "max-sm:w-24 max-sm:opacity-100 max-sm:mr-2"
              )}
            >
              VIRALORIGIN
            </span>
          </Link>

          <div className="hidden sm:flex items-center gap-1 ml-2 text-xs font-black">
            <Link
              href="/feed"
              className={cn(
                "rounded-full px-3 py-1.5 transition",
                pathname === "/feed"
                  ? "bg-black text-white"
                  : "text-black/50 hover:bg-black/5 hover:text-black"
              )}
            >
              🔥 피드
            </Link>
            <Link
              href="/"
              className={cn(
                "rounded-full px-3 py-1.5 transition",
                pathname === "/" || pathname.startsWith("/memes/")
                  ? "bg-black text-white"
                  : "text-black/50 hover:bg-black/5 hover:text-black"
              )}
            >
              📚 사전
            </Link>
          </div>

          {/* 우측에 붙어 있다가 왼쪽으로 쓱 늘어나는 가변형 검색창 */}
          <div className="min-w-0 flex-1 md:col-start-3 md:row-start-1 md:w-full flex justify-end items-center ml-auto">
            <HeaderSearch
              className="w-auto md:w-full"
              expanded={searchExpanded}
              onExpandedChange={setSearchExpanded}
            />
          </div>

          <nav className="ml-auto flex items-center gap-1 text-sm font-bold md:col-start-4 md:row-start-1 md:gap-1.5">
            <Link
              aria-label="사이트 피드백"
              className={buttonClassName({ variant: "ghost", size: "sm", className: "max-sm:size-9 max-sm:px-0" })}
              href="/feedback"
            >
              <MessageCircleMore className="size-4" aria-hidden="true" />
              <span className="hidden sm:inline">사이트 피드백</span>
            </Link>
            <Link
              aria-label="영상 제보"
              className={buttonClassName({ size: "sm", className: "max-sm:size-9 max-sm:px-0" })}
              href="/submit?type=request"
            >
              <Plus className="size-4" aria-hidden="true" />
              <span className="hidden sm:inline">영상 제보</span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

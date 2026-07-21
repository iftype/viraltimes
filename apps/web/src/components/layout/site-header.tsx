"use client";

import { MessageCircleMore, Plus } from "lucide-react";
import Link from "next/link";
import { useState, useOptimistic, startTransition } from "react";
import { usePathname, useRouter } from "next/navigation";

import { BrandMark, buttonClassName, cn } from "@origin/ui";

import { HeaderSearch } from "./header-search";

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [searchExpanded, setSearchExpanded] = useState(false);

  // URL 경로에 맞게 탭 지정 (피드는 /feed, 사전은 / 또는 /memes)
  const currentTab = pathname === "/feed" ? "feed" : "dictionary";
  const [optimisticTab, setOptimisticTab] = useOptimistic(
    currentTab,
    (_state, newTab: "feed" | "dictionary") => newTab
  );

  if (pathname === "/quiz") return null;

  const handleTabClick = (tab: "feed" | "dictionary", href: string) => {
    startTransition(() => {
      setOptimisticTab(tab);
      router.push(href);
    });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-white/92 backdrop-blur-xl">
      <div className="page-shell py-2 sm:py-2.5">
        <div className="relative flex items-center justify-between gap-2 md:grid md:grid-cols-[auto_1fr_minmax(14rem,24rem)_auto] md:gap-3">
          <Link className="flex shrink-0 items-center gap-1.5 font-black" href="/">
            <BrandMark />
            <span
              className={cn(
                "tracking-[-0.04em] transition-all duration-350 ease-[cubic-bezier(0.16,1,0.3,1)] md:inline overflow-hidden whitespace-nowrap text-sm sm:text-base",
                searchExpanded ? "max-sm:w-0 max-sm:opacity-0 max-sm:mr-0" : "max-sm:w-20 max-sm:opacity-100 max-sm:mr-1"
              )}
            >
              VIRALORIGIN
            </span>
          </Link>

          {/* 화면 상단 정중앙 낙관적 업데이트(Optimistic Update) 토글 스위치 */}
          <div className="flex items-center justify-center min-w-0 mx-auto">
            <div className="flex items-center gap-0.5 rounded-full bg-black/5 p-1 text-xs font-black shadow-inner">
              <button
                type="button"
                onClick={() => handleTabClick("feed", "/feed")}
                className={cn(
                  "rounded-full px-3.5 py-1.5 transition-all duration-200 text-xs cursor-pointer",
                  optimisticTab === "feed"
                    ? "bg-black text-white shadow-md font-black"
                    : "text-black/50 hover:text-black"
                )}
              >
                피드
              </button>
              <button
                type="button"
                onClick={() => handleTabClick("dictionary", "/")}
                className={cn(
                  "rounded-full px-3.5 py-1.5 transition-all duration-200 text-xs cursor-pointer",
                  optimisticTab === "dictionary"
                    ? "bg-black text-white shadow-md font-black"
                    : "text-black/50 hover:text-black"
                )}
              >
                사전
              </button>
            </div>
          </div>

          {/* 우측 검색창 */}
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

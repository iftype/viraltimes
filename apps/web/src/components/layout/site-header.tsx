"use client";

import { MessageCircleMore, Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import { BrandMark, buttonClassName, cn } from "@origin/ui";

import { HeaderSearch } from "./header-search";

export function SiteHeader() {
  const pathname = usePathname();
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const update = () => setCompact(window.scrollY > 72);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  if (pathname === "/quiz") return null;

  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-white/92 backdrop-blur-xl">
      <div className={cn("page-shell transition-[padding] duration-200 md:py-2.5", compact ? "py-2" : "py-2.5")}>
        <div className="relative flex flex-wrap items-center justify-between gap-2.5 md:grid md:grid-cols-[auto_1fr_minmax(14rem,24rem)_auto] md:gap-3">
          <Link className="flex shrink-0 items-center gap-2.5 font-black" href="/">
            <BrandMark />
            <span className={cn("tracking-[-0.04em] md:inline", compact ? "hidden" : "inline")}>VIRALORIGIN</span>
          </Link>

          <HeaderSearch
            className={cn(
              "min-w-0 transition-all duration-200 md:!relative md:left-auto md:top-auto md:order-none md:col-start-3 md:row-start-1 md:w-full md:translate-x-0",
              compact
                ? "!absolute left-1/2 top-0 w-[min(15rem,calc(100%-7rem))] -translate-x-1/2"
                : "order-3 mt-0.5 w-full",
            )}
            compact={compact}
          />

          <nav className="ml-auto flex items-center gap-1 text-sm font-bold md:col-start-4 md:row-start-1 md:gap-1.5">
            <Link
              aria-label="사이트 피드백"
              className={buttonClassName({ variant: "ghost", size: "sm", className: cn("max-sm:size-9 max-sm:px-0", compact && "max-sm:hidden") })}
              href="/feedback"
            >
              <MessageCircleMore className="size-4" aria-hidden="true" />
              <span className="hidden sm:inline">사이트 피드백</span>
            </Link>
            <Link
              aria-label="없는 밈 제보"
              className={buttonClassName({ size: "sm", className: "max-sm:size-9 max-sm:px-0" })}
              href="/submit?type=request"
            >
              <Plus className="size-4" aria-hidden="true" />
              <span className="hidden sm:inline">없는 밈 제보</span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

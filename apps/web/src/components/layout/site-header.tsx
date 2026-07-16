import { MessageCircleMore, Plus } from "lucide-react";
import Link from "next/link";

import { BrandMark, buttonClassName } from "@origin/ui";

import { HeaderSearch } from "./header-search";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-white/92 backdrop-blur-xl">
      <div className="page-shell py-2.5">
        <div className="flex flex-wrap items-center gap-3">
          <Link className="flex shrink-0 items-center gap-2.5 font-black" href="/">
            <BrandMark />
            <span className="tracking-[-0.04em]">VIRALORIGIN</span>
          </Link>

          <nav className="ml-auto flex items-center gap-1.5 text-sm font-bold">
            <Link
              aria-label="사이트 피드백"
              className={buttonClassName({ variant: "ghost", size: "sm", className: "max-sm:size-9 max-sm:px-0" })}
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
          <HeaderSearch className="order-3 w-full md:order-none md:ml-2 md:w-[min(24rem,35vw)]" />
        </div>
      </div>
    </header>
  );
}

"use client";

import { useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { FeedExperience } from "@/features/feed/components/feed-experience";
import { SearchExperience } from "@/features/search/components/search-experience";

export function SwipeFeedDictionary({ initialTab = "feed" }: { initialTab?: "feed" | "dictionary" }) {
  const pathname = usePathname();
  // pathname으로 파생 상태와 로컬 스와이프 상태 통합
  const [swipeOverride, setSwipeOverride] = useState<"feed" | "dictionary" | null>(null);

  const activeTab = swipeOverride ?? (pathname === "/" ? "dictionary" : initialTab);
  const touchStartX = useRef<number | null>(null);

  // 터치 스와이프 제스처 핸들러 (60fps GPU 가속)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diffX = touchStartX.current - touchEndX;

    // 50px 이상 좌/우 스와이프 시 탭 변경
    if (Math.abs(diffX) > 50) {
      if (diffX > 0 && activeTab === "feed") {
        // 왼쪽으로 밀었을 때: 사전으로 이동
        setSwipeOverride("dictionary");
        window.history.replaceState(null, "", "/");
      } else if (diffX < 0 && activeTab === "dictionary") {
        // 오른쪽으로 밀었을 때: 피드로 이동
        setSwipeOverride("feed");
        window.history.replaceState(null, "", "/feed");
      }
    }
    touchStartX.current = null;
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative h-[calc(100dvh-3.5rem)] w-full overflow-hidden bg-black"
    >
      {/* 60fps GPU 가속 수평 슬라이딩 트랜지션 컨테이너 */}
      <div
        className={`flex h-full w-[200%] transition-transform duration-300 ease-out ${
          activeTab === "feed" ? "translate-x-0" : "-translate-x-1/2"
        }`}
      >
        {/* 1. 왼쪽 뷰: 유행 피드 (Feed) */}
        <div className="h-full w-1/2 shrink-0 overflow-hidden">
          <FeedExperience />
        </div>

        {/* 2. 오른쪽 뷰: 바이럴 사전 (Dictionary) */}
        <div className="h-full w-1/2 shrink-0 overflow-y-auto bg-white">
          <div className="py-4">
            <SearchExperience />
          </div>
        </div>
      </div>
    </div>
  );
}

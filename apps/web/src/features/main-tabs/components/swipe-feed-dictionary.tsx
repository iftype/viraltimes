"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { FeedExperience } from "@/features/feed/components/feed-experience";
import { SearchExperience } from "@/features/search/components/search-experience";
import { SiteFooter } from "@/components/layout/site-footer";

function SwipeFeedDictionaryContent({ initialTab = "feed" }: { initialTab?: "feed" | "dictionary" }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  const [activeTab, setActiveTab] = useState<"feed" | "dictionary">(
    tabParam === "dictionary" ? "dictionary" : initialTab
  );

  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const isHorizontalSwipe = useRef<boolean | null>(null);

  // URL query 및 pathname 변경 시 활성 탭 즉시 동기화
  useEffect(() => {
    if (tabParam === "dictionary") {
      setActiveTab("dictionary");
    } else if (pathname === "/feed" || pathname === "/") {
      setActiveTab("feed");
    }
  }, [pathname, tabParam]);

  // 피드 탭일 때 바디 브라우저 스크롤 전면 차단 (헤더 포함 100dvh 고정 뷰포트 락)
  useEffect(() => {
    if (activeTab === "feed") {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [activeTab]);

  // 터치 드래그 수평 따라오기 핸들러 (중간 과정 1:1 실시간 보여주기)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isHorizontalSwipe.current = null;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = currentX - touchStartX.current;
    const diffY = currentY - touchStartY.current;

    // 수평 스와이프인지 수직 스크롤인지 첫 판별
    if (isHorizontalSwipe.current === null) {
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 6) {
        isHorizontalSwipe.current = true;
      } else if (Math.abs(diffY) > Math.abs(diffX) && Math.abs(diffY) > 6) {
        isHorizontalSwipe.current = false;
      }
    }

    // 수평 스와이프 중일 때 상/하 수직 스크롤 차단, 수직 스크롤 중일 때 수평 오프셋 0 고정
    if (isHorizontalSwipe.current === false) {
      setDragOffset(0);
    } else if (isHorizontalSwipe.current === true) {
      if (e.cancelable) {
        e.preventDefault();
      }
      let clampedDiff = diffX;
      if (activeTab === "feed" && diffX > 0) clampedDiff = 0;
      if (activeTab === "dictionary" && diffX < 0) clampedDiff = 0;
      setDragOffset(clampedDiff);
    }
  };

  const handleTouchEnd = () => {
    if (isHorizontalSwipe.current && containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      const threshold = containerWidth * 0.2; // 20% 이상 드래그했으면 전환

      if (activeTab === "feed" && dragOffset < -threshold) {
        setActiveTab("dictionary");
        window.history.replaceState(null, "", "/?tab=dictionary");
      } else if (activeTab === "dictionary" && dragOffset > threshold) {
        setActiveTab("feed");
        window.history.replaceState(null, "", "/");
      }
    }

    setDragOffset(0);
    setIsDragging(false);
    touchStartX.current = null;
    touchStartY.current = null;
    isHorizontalSwipe.current = null;
  };

  const baseTranslate = activeTab === "feed" ? 0 : -50;

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative h-[calc(100dvh-3.5rem)] w-full overflow-hidden bg-black select-none touch-pan-y"
    >
      {/* 손가락 실시간 드래그 움직임이 1:1로 중간 과정이 그대로 보이는 트랜지션 컨테이너 */}
      <div
        className={`flex h-full w-[200%] ${
          isDragging ? "transition-none" : "transition-transform duration-300 ease-out"
        }`}
        style={{
          transform: `translateX(calc(${baseTranslate}% + ${dragOffset}px))`,
        }}
      >
        {/* 1. 왼쪽 뷰: 유행 피드 (Feed) */}
        <div className="h-full w-1/2 shrink-0 overflow-hidden">
          <FeedExperience />
        </div>

        {/* 2. 오른쪽 뷰: 바이럴 사전 (Dictionary) */}
        <div className="h-full w-1/2 shrink-0 overflow-y-auto bg-white flex flex-col justify-between">
          <div className="py-3 px-2 sm:px-4 flex-1">
            <SearchExperience />
          </div>
          <SiteFooter forceShow />
        </div>
      </div>
    </div>
  );
}

export function SwipeFeedDictionary(props: { initialTab?: "feed" | "dictionary" }) {
  return (
    <Suspense fallback={<div className="h-[calc(100dvh-3.5rem)] w-full bg-black animate-pulse" />}>
      <SwipeFeedDictionaryContent {...props} />
    </Suspense>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { FeedExperience } from "@/features/feed/components/feed-experience";
import { SearchExperience } from "@/features/search/components/search-experience";

export function SwipeFeedDictionary({ initialTab = "feed" }: { initialTab?: "feed" | "dictionary" }) {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState<"feed" | "dictionary">(
    pathname === "/feed" ? "feed" : initialTab
  );

  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const isHorizontalSwipe = useRef<boolean | null>(null);

  // URL 변경 시 탭 상태 동기화
  useEffect(() => {
    if (pathname === "/feed") {
      setActiveTab("feed");
    } else if (pathname === "/" && initialTab === "dictionary") {
      setActiveTab("dictionary");
    }
  }, [pathname, initialTab]);

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
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 8) {
        isHorizontalSwipe.current = true;
      } else if (Math.abs(diffY) > Math.abs(diffX) && Math.abs(diffY) > 8) {
        isHorizontalSwipe.current = false;
      }
    }

    // 수평 스와이프 중일 때 손가락 움직임 그대로 실시간 반영 (중간 과정 렌더링)
    if (isHorizontalSwipe.current) {
      // 피드에서 오른쪽으로 더 당기거나 사전에서 왼쪽으로 더 당기는 경계 바운스 제한
      let clampedDiff = diffX;
      if (activeTab === "feed" && diffX > 0) clampedDiff = diffX * 0.2;
      if (activeTab === "dictionary" && diffX < 0) clampedDiff = diffX * 0.2;
      setDragOffset(clampedDiff);
    }
  };

  const handleTouchEnd = () => {
    if (isHorizontalSwipe.current && containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      const threshold = containerWidth * 0.2; // 20% 이상 드래그했으면 전환

      if (activeTab === "feed" && dragOffset < -threshold) {
        setActiveTab("dictionary");
        window.history.replaceState(null, "", "/");
      } else if (activeTab === "dictionary" && dragOffset > threshold) {
        setActiveTab("feed");
        window.history.replaceState(null, "", "/feed");
      }
    }

    // 드래그 종료 후 오프셋 초기화
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
      className="relative h-[calc(100dvh-3.5rem)] w-full overflow-hidden bg-black select-none"
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
        <div className="h-full w-1/2 shrink-0 overflow-y-auto bg-white">
          <div className="py-3 px-2 sm:px-4">
            <SearchExperience />
          </div>
        </div>
      </div>
    </div>
  );
}

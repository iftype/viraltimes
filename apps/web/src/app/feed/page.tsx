import type { Metadata } from "next";
import { Suspense } from "react";
import { SwipeFeedDictionary } from "@/features/main-tabs/components/swipe-feed-dictionary";

export const metadata: Metadata = {
  title: "유행 피드",
  description: "실시간 유행 밈과 챌린지 원본 영상 피드를 확인하세요.",
};

export default function FeedPage() {
  return (
    <Suspense fallback={<div className="h-[70vh] w-full bg-black" />}>
      <SwipeFeedDictionary initialTab="feed" />
    </Suspense>
  );
}

import { Suspense } from "react";
import { SwipeFeedDictionary } from "@/features/main-tabs/components/swipe-feed-dictionary";

export default function Home() {
  return (
    <Suspense fallback={<div className="h-[70vh] w-full bg-white" />}>
      <SwipeFeedDictionary initialTab="dictionary" />
    </Suspense>
  );
}

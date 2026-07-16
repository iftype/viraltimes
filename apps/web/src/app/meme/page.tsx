import type { Metadata } from "next";
import { Suspense } from "react";

import { DynamicMemeDetail } from "@/features/meme-detail/components/dynamic-meme-detail";

export const metadata: Metadata = {
  title: "사전 항목",
  description: "ViralOrigin 사전 항목의 원본과 확산 과정을 확인하세요.",
};

export default function DynamicMemePage() {
  return (
    <Suspense
      fallback={
        <div className="page-shell flex min-h-[65vh] items-center justify-center text-sm font-bold text-black/35">
          사전 항목을 불러오는 중...
        </div>
      }
    >
      <DynamicMemeDetail />
    </Suspense>
  );
}

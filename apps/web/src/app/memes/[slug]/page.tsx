import type { Metadata } from "next";
import { Suspense } from "react";

import { DynamicMemeDetail } from "@/features/meme-detail/components/dynamic-meme-detail";
import { sampleMemes } from "@/data/sample-memes";

export const metadata: Metadata = {
  title: "사전 항목",
  description: "ViralOrigin 사전 항목의 원본과 확산 과정을 확인하세요.",
};

// output: "export" 정적 빌드 성공을 위한 사전 경로 리스트 반환
export function generateStaticParams() {
  const params = sampleMemes.map((meme) => ({
    slug: meme.slug.toLowerCase(),
  }));
  // 운영 canonical URL은 vercel.json이 /meme shell로 rewrite한다.
  // sample fallback이 비어 있어도 static export가 동적 route 계약을 유지하도록 shell 하나를 만든다.
  return params.length ? params : [{ slug: "dictionary-shell" }];
}

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

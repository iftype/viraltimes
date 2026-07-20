import type { Metadata } from "next";
import { Suspense } from "react";

import { ProposalPage } from "@/features/contributions/components/proposal-page";

export const metadata: Metadata = {
  title: "수정 제안",
  description: "ViralOrigin 사전 항목의 설명, 원본, 사용 자료와 연결 관계를 제안하고 토론합니다.",
};

export default function Page() {
  return <Suspense fallback={<div className="page-shell min-h-[65vh] py-12 text-sm font-bold text-black/35">수정 제안을 불러오는 중...</div>}><ProposalPage /></Suspense>;
}

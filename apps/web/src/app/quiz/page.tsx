import { Suspense } from "react";
import { QuizPage } from "@/features/quiz/components/quiz-page";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "밈 인지도 매치 테스트",
  description: "마이너 밈과 원조 챌린지 중 어떤 것을 더 잘 알고 계신가요? 직접 테스트하고 관심 수요 통계를 확인하세요.",
};

export default function Page() {
  return (
    <Suspense fallback={<div className="page-shell min-h-[70vh] py-8 flex items-center justify-center text-neutral-400">로딩 중...</div>}>
      <QuizPage />
    </Suspense>
  );
}

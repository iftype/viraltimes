import { ArrowLeft, MessageCircleMore } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { SiteFeedbackForm } from "@/features/feedback/components/site-feedback-form";

export const metadata: Metadata = {
  title: "문의·피드백",
  description: "ViralOrigin 사이트 사용 중 발견한 오류와 개선 의견을 운영자에게 보내세요.",
};

export default function FeedbackPage() {
  return (
    <div className="page-shell py-8 sm:py-12">
      <div className="mx-auto max-w-3xl">
        <Link className="inline-flex items-center gap-1.5 text-sm font-bold text-black/45 hover:text-black" href="/">
          <ArrowLeft className="size-4" /> 돌아가기
        </Link>
        <p className="mt-8 flex items-center gap-2 text-xs font-black text-[#fe2c55]"><MessageCircleMore className="size-4" />CONTACT</p>
        <h1 className="mt-2 text-4xl font-black tracking-[-0.055em] sm:text-5xl">사이트 피드백</h1>
        <p className="mt-3 text-sm leading-6 text-black/50">사이트 사용 중 발견한 오류, 불편한 점, 기능 개선 의견과 운영 문의만 남겨주세요. 사전에 없는 밈과 원본 제보는 헤더의 ‘없는 밈 제보’에서 별도로 접수합니다.</p>

        <section className="mt-8">
          <SiteFeedbackForm />
        </section>
      </div>
    </div>
  );
}

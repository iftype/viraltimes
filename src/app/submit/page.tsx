import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { SubmissionForm } from "@/features/submissions/components/submission-form";

export const metadata: Metadata = {
  title: "밈·챌린지 등록",
  description: "알고 싶은 밈이나 원본을 아는 밈을 등록해 주세요.",
};

export default function SubmitPage() {
  return (
    <div className="page-shell py-10 sm:py-16">
      <div className="mx-auto max-w-2xl">
        <Link
          className="inline-flex items-center gap-1.5 text-sm font-bold text-black/45 hover:text-black"
          href="/"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          돌아가기
        </Link>
        <p className="mt-10 text-xs font-black text-[#fe2c55]">ADD TO DICTIONARY</p>
        <h1 className="mt-2 text-4xl font-black tracking-[-0.055em] sm:text-5xl">
          같이 채우는 밈 사전
        </h1>
        <p className="mt-4 text-sm leading-6 text-black/50 sm:text-base">
          찾고 싶은 항목을 요청하거나, 알고 있는 원본과 근거를 등록해 주세요.
          검토와 토론을 거친 정보만 사전에 확정합니다.
        </p>

        <div className="mt-8">
          <Suspense fallback={<div className="min-h-96 rounded-3xl bg-white" />}>
            <SubmissionForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { SubmissionForm } from "@/features/submissions/components/submission-form";

export const metadata: Metadata = {
  title: "밈·챌린지 영상 제보",
  description: "사전에 추가하고 싶은 밈이나 챌린지의 영상 링크를 제보해 주세요.",
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
          영상 하나로 알려주세요
        </h1>
        <p className="mt-4 text-sm leading-6 text-black/50 sm:text-base">
          이름을 몰라도 괜찮아요. 영상 링크를 보내주시면 운영자가 확인하고
          사전 항목과 원본 근거를 직접 정리합니다.
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

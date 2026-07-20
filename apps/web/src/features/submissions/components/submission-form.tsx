"use client";

import { Check, Link2, Send } from "lucide-react";
import { FormEvent, useState } from "react";

type Submission = {
  id: string;
  title: string;
  author: string;
  sourceUrl: string;
  originUrl?: string;
  createdAt: string;
};

const submissionStorageKey = "origin-submissions-v2";

export function SubmissionForm() {
  const [submitted, setSubmitted] = useState<"server" | "local" | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitted(null);
    const form = new FormData(event.currentTarget);
    const title = String(form.get("title") ?? "").trim();
    const submission: Submission = {
      id: `submission-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title,
      author: String(form.get("author") ?? "익명 제보자").trim() || "익명 제보자",
      sourceUrl: String(form.get("sourceUrl") ?? "").trim(),
      originUrl: String(form.get("originUrl") ?? "").trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    let result: "server" | "local" = "server";
    try {
      const response = await fetch("/api/v1/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: "meme_request",
          title: submission.title,
          author: submission.author,
          sourceUrl: submission.sourceUrl,
          originUrl: submission.originUrl,
        }),
      });
      if (!response.ok) throw new Error("submission failed");
    } catch {
      result = "local";
      let submissions: Submission[] = [];
      try {
        submissions = JSON.parse(window.localStorage.getItem(submissionStorageKey) ?? "[]") as Submission[];
      } catch {
        submissions = [];
      }
      window.localStorage.setItem(submissionStorageKey, JSON.stringify([...submissions, submission]));
    }

    event.currentTarget.reset();
    const authorInput = event.currentTarget.elements.namedItem("author") as HTMLInputElement | null;
    if (authorInput) authorInput.value = "익명 제보자";
    setSubmitted(result);
    setIsSubmitting(false);
  }

  return (
    <form className="rounded-3xl bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.05)] sm:p-8" onSubmit={handleSubmit}>
      <div className="rounded-2xl bg-black p-5 text-white">
        <Link2 className="size-5 text-[#25f4ee]" aria-hidden="true" />
        <h2 className="mt-3 text-xl font-black">영상 링크만 보내주세요</h2>
        <p className="mt-1 text-sm leading-6 text-white/55">제보된 링크를 운영자가 확인한 뒤 사전 항목으로 직접 정리합니다.</p>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-bold sm:col-span-2">
          영상 링크 <span className="text-[#fe2c55]">필수</span>
          <input
            className="mt-2 w-full rounded-xl border border-black/10 bg-[#f7f7f8] px-4 py-3 text-base outline-none focus:border-black"
            name="sourceUrl"
            placeholder="YouTube, TikTok, Instagram 등의 영상 주소"
            required
            type="url"
          />
        </label>
        <label className="block text-sm font-bold">
          밈·챌린지 이름 <span className="font-medium text-black/35">선택</span>
          <input
            className="mt-2 w-full rounded-xl border border-black/10 bg-[#f7f7f8] px-4 py-3 text-base outline-none focus:border-black"
            name="title"
            placeholder="몰라도 비워두세요"
          />
        </label>
        <label className="block text-sm font-bold">
          닉네임
          <input
            className="mt-2 w-full rounded-xl border border-black/10 bg-[#f7f7f8] px-4 py-3 text-base outline-none focus:border-black"
            defaultValue="익명 제보자"
            maxLength={60}
            name="author"
          />
        </label>
        <label className="block text-sm font-bold sm:col-span-2">
          원본으로 알고 있는 링크 <span className="font-medium text-black/35">선택</span>
          <input
            className="mt-2 w-full rounded-xl border border-black/10 bg-[#f7f7f8] px-4 py-3 text-base outline-none focus:border-black"
            name="originUrl"
            placeholder="원본이 따로 있다면 주소를 붙여주세요"
            type="url"
          />
        </label>
      </div>

      <button className="mt-5 flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#fe2c55] px-5 py-3.5 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-50" disabled={isSubmitting} type="submit">
        <Send className="size-4" aria-hidden="true" />
        {isSubmitting ? "보내는 중..." : "영상 제보하기"}
      </button>

      {submitted && (
        <p className="mt-4 flex items-center justify-center gap-2 text-center text-sm font-black text-[#14804a]">
          <Check className="size-4" aria-hidden="true" />
          {submitted === "server" ? "제보됐어요. 운영자가 직접 확인할게요." : "연결이 불안정해 이 브라우저에 임시 저장했어요."}
        </p>
      )}
      <p className="mt-3 text-center text-[0.7rem] leading-5 text-black/35">영상은 재업로드하지 않으며 링크와 공개 메타데이터만 검토합니다.</p>
    </form>
  );
}

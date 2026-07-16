"use client";

import { Check, HelpCircle, Lightbulb } from "lucide-react";
import { FormEvent, useState } from "react";
import { useSearchParams } from "next/navigation";

type SubmissionType = "request" | "origin";

type Submission = {
  id: string;
  type: SubmissionType;
  title: string;
  author: string;
  sourceUrl?: string;
  description: string;
  createdAt: string;
};

const submissionStorageKey = "origin-submissions-v1";

export function SubmissionForm() {
  const searchParams = useSearchParams();
  const requestedType = searchParams.get("type");
  const [activeType, setActiveType] = useState<SubmissionType>(
    requestedType === "origin" ? "origin" : "request",
  );
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const submission: Submission = {
      id: `submission-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type: activeType,
      title: String(form.get("title") ?? "").trim(),
      author: String(form.get("author") ?? "익명").trim() || "익명",
      sourceUrl: String(form.get("sourceUrl") ?? "").trim() || undefined,
      description: String(form.get("description") ?? "").trim(),
      createdAt: new Date().toISOString(),
    };

    let submissions: Submission[] = [];
    try {
      submissions = JSON.parse(
        window.localStorage.getItem(submissionStorageKey) ?? "[]",
      ) as Submission[];
    } catch {
      submissions = [];
    }
    window.localStorage.setItem(
      submissionStorageKey,
      JSON.stringify([...submissions, submission]),
    );

    event.currentTarget.reset();
    setSubmitted(true);
  }

  const isOrigin = activeType === "origin";

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2">
        <button
          className={`rounded-2xl border p-5 text-left transition-colors ${
            !isOrigin
              ? "border-black bg-black text-white"
              : "border-black/5 bg-white hover:border-black/20"
          }`}
          type="button"
          onClick={() => {
            setActiveType("request");
            setSubmitted(false);
          }}
        >
          <HelpCircle className="size-5" aria-hidden="true" />
          <span className="mt-4 block text-lg font-black">알고 싶은 밈·챌린지</span>
          <span className={`mt-1 block text-sm ${!isOrigin ? "text-white/60" : "text-black/45"}`}>
            이름만 알아도 등록할 수 있어요.
          </span>
        </button>
        <button
          className={`rounded-2xl border p-5 text-left transition-colors ${
            isOrigin
              ? "border-[#fe2c55] bg-[#fe2c55] text-white"
              : "border-black/5 bg-white hover:border-black/20"
          }`}
          type="button"
          onClick={() => {
            setActiveType("origin");
            setSubmitted(false);
          }}
        >
          <Lightbulb className="size-5" aria-hidden="true" />
          <span className="mt-4 block text-lg font-black">원본을 아는 밈·챌린지</span>
          <span className={`mt-1 block text-sm ${isOrigin ? "text-white/70" : "text-black/45"}`}>
            원본 링크나 초기 사용례를 알려주세요.
          </span>
        </button>
      </div>

      <form
        className="mt-5 rounded-3xl bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.05)] sm:p-8"
        onSubmit={handleSubmit}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-bold sm:col-span-2">
            밈·챌린지 이름
            <input
              className="mt-2 w-full rounded-xl border border-black/10 bg-[#f7f7f8] px-4 py-3 outline-none focus:border-black"
              name="title"
              placeholder="예: 꿍싯꿍싯"
              required
            />
          </label>
          <label className="block text-sm font-bold">
            닉네임
            <input
              className="mt-2 w-full rounded-xl border border-black/10 bg-[#f7f7f8] px-4 py-3 outline-none focus:border-black"
              name="author"
              placeholder="익명"
            />
          </label>
          <label className="block text-sm font-bold">
            {isOrigin ? "원본 또는 근거 링크" : "알고 있는 링크"}
            <input
              className="mt-2 w-full rounded-xl border border-black/10 bg-[#f7f7f8] px-4 py-3 outline-none focus:border-black"
              name="sourceUrl"
              type="url"
              placeholder="https://"
              required={isOrigin}
            />
          </label>
          <label className="block text-sm font-bold sm:col-span-2">
            {isOrigin ? "원본이라고 생각하는 이유" : "어떤 내용이 궁금한가요?"}
            <textarea
              className="mt-2 min-h-36 w-full resize-y rounded-xl border border-black/10 bg-[#f7f7f8] px-4 py-3 leading-6 outline-none focus:border-black"
              name="description"
              placeholder={
                isOrigin
                  ? "더 오래된 게시물인지, 어떤 흐름으로 퍼졌는지 적어주세요."
                  : "원본, 유행 과정, 의미 등 궁금한 점을 적어주세요."
              }
              required
            />
          </label>
        </div>

        <button
          className="mt-5 w-full rounded-full bg-black px-5 py-3.5 text-sm font-black text-white"
          type="submit"
        >
          {isOrigin ? "원본 정보 등록" : "알고 싶은 항목 등록"}
        </button>

        {submitted && (
          <p className="mt-4 flex items-center justify-center gap-2 text-sm font-black text-[#14804a]">
            <Check className="size-4" aria-hidden="true" /> 등록됐어요. 검토 목록에 추가할게요.
          </p>
        )}
        <p className="mt-3 text-center text-[0.7rem] leading-5 text-black/35">
          현재 프로토타입에서는 이 브라우저에만 저장됩니다.
        </p>
      </form>
    </div>
  );
}

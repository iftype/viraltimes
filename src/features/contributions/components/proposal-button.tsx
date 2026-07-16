"use client";

import { Check, Pencil, X } from "lucide-react";
import { FormEvent, useState } from "react";

import {
  makeLocalId,
  proposalSectionLabels,
  readProposals,
  type ProposalSection,
  writeProposals,
} from "../lib/local-contributions";

type ProposalButtonProps = {
  memeId: string;
  memeTitle: string;
  section: ProposalSection;
};

export function ProposalButton({
  memeId,
  memeTitle,
  section,
}: ProposalButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    writeProposals([
      ...readProposals(),
      {
        id: makeLocalId("proposal"),
        memeId,
        memeTitle,
        section,
        author: String(form.get("author") ?? "익명").trim() || "익명",
        body: String(form.get("body") ?? "").trim(),
        evidenceUrl: String(form.get("evidenceUrl") ?? "").trim() || undefined,
        createdAt: new Date().toISOString(),
        agree: 0,
        disagree: 0,
        comments: [],
      },
    ]);

    setSubmitted(true);
    setIsOpen(false);
  }

  return (
    <>
      <button
        className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-black/10 bg-white px-3 py-2 text-xs font-black text-black/55 hover:border-black hover:text-black"
        type="button"
        onClick={() => setIsOpen(true)}
      >
        {submitted ? (
          <Check className="size-3.5" aria-hidden="true" />
        ) : (
          <Pencil className="size-3.5" aria-hidden="true" />
        )}
        {submitted ? "제안 등록됨" : "수정 제안"}
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-[80] flex items-end justify-center bg-black/45 p-0 backdrop-blur-sm sm:items-center sm:p-5"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsOpen(false);
          }}
        >
          <section
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby={`proposal-title-${section}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-black text-[#fe2c55]">수정 제안</span>
                <h2
                  className="mt-1 text-2xl font-black tracking-[-0.04em]"
                  id={`proposal-title-${section}`}
                >
                  {proposalSectionLabels[section]}
                </h2>
                <p className="mt-2 text-sm leading-6 text-black/45">
                  바로 반영되지 않고 토론 중 제안으로 등록돼요.
                </p>
              </div>
              <button
                className="rounded-full bg-black/5 p-2 text-black/45 hover:text-black"
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="닫기"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <label className="block text-sm font-bold">
                닉네임
                <input
                  className="mt-2 w-full rounded-xl border border-black/10 bg-[#f7f7f8] px-4 py-3 outline-none focus:border-black"
                  name="author"
                  placeholder="익명"
                />
              </label>
              <label className="block text-sm font-bold">
                어떻게 바꾸면 좋을까요?
                <textarea
                  className="mt-2 min-h-32 w-full resize-y rounded-xl border border-black/10 bg-[#f7f7f8] px-4 py-3 leading-6 outline-none focus:border-black"
                  name="body"
                  placeholder="수정할 내용과 이유를 적어주세요."
                  required
                />
              </label>
              <label className="block text-sm font-bold">
                근거 링크 <span className="font-medium text-black/35">선택</span>
                <input
                  className="mt-2 w-full rounded-xl border border-black/10 bg-[#f7f7f8] px-4 py-3 outline-none focus:border-black"
                  name="evidenceUrl"
                  type="url"
                  placeholder="https://"
                />
              </label>
              <button
                className="w-full rounded-full bg-black px-5 py-3.5 text-sm font-black text-white"
                type="submit"
              >
                토론에 제안 등록
              </button>
              <p className="text-center text-[0.7rem] leading-5 text-black/35">
                프로토타입에서는 이 브라우저에만 저장됩니다.
              </p>
            </form>
          </section>
        </div>
      )}
    </>
  );
}

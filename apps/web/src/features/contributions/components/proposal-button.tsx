"use client";

import { Check, LoaderCircle, Pencil, X } from "lucide-react";
import { FormEvent, useState } from "react";

import { cn } from "@origin/ui";
import {
  participationUpdateEvent,
  proposalSectionConfig,
  type ProposalSection,
} from "../lib/local-contributions";

type ProposalButtonProps = {
  className?: string;
  memeId: string;
  memeTitle: string;
  section: ProposalSection;
};

export function ProposalButton({ className, memeId, memeTitle, section }: ProposalButtonProps) {
  const config = proposalSectionConfig[section];
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch(`/api/v1/memes/${encodeURIComponent(memeId)}/participation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "proposal",
          section,
          action: String(form.get("action") ?? ""),
          author: String(form.get("author") ?? "").trim() || "익명",
          body: String(form.get("body") ?? "").trim(),
          evidenceUrl: String(form.get("evidenceUrl") ?? "").trim() || undefined,
          website: String(form.get("website") ?? ""),
        }),
      });
      if (!response.ok) throw new Error("proposal failed");
      setStatus("sent");
      setIsOpen(false);
      window.dispatchEvent(new CustomEvent(participationUpdateEvent));
    } catch {
      setStatus("error");
    }
  }

  return (
    <>
      <button
        className={cn(
          "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full border border-black/10 bg-white px-3 py-2 text-xs font-black text-black/55 hover:border-black hover:text-black",
          className,
        )}
        onClick={() => { setIsOpen(true); setStatus("idle"); }}
        type="button"
      >
        {status === "sent" ? <Check className="size-3.5" /> : <Pencil className="size-3.5" />}
        {status === "sent" ? "제안 등록됨" : config.buttonLabel}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/45 p-0 backdrop-blur-sm sm:items-center sm:p-5" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsOpen(false); }} role="presentation">
          <section aria-labelledby={`proposal-title-${section}`} aria-modal="true" className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl" role="dialog">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-black text-[#fe2c55]">{config.eyebrow}</span>
                <h2 className="mt-1 text-2xl font-black tracking-[-0.04em]" id={`proposal-title-${section}`}>{memeTitle} · {config.label}</h2>
                <p className="mt-2 text-sm leading-6 text-black/45">제안은 바로 확정되지 않고 공개 토론과 운영 검토를 거칩니다.</p>
              </div>
              <button aria-label="닫기" className="rounded-full bg-black/5 p-2 text-black/45 hover:text-black" onClick={() => setIsOpen(false)} type="button"><X className="size-5" /></button>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <label className="block text-sm font-bold">제안 유형
                <select className="mt-2 w-full rounded-xl border border-black/10 bg-[#f7f7f8] px-4 py-3 outline-none focus:border-black" name="action">
                  {config.actions.map((action) => <option key={action.value} value={action.value}>{action.label}</option>)}
                </select>
              </label>
              <label className="block text-sm font-bold">닉네임 <span className="font-medium text-black/35">선택</span>
                <input className="mt-2 w-full rounded-xl border border-black/10 bg-[#f7f7f8] px-4 py-3 outline-none focus:border-black" name="author" placeholder="익명" />
              </label>
              <label className="block text-sm font-bold">{config.prompt}
                <textarea className="mt-2 min-h-32 w-full resize-y rounded-xl border border-black/10 bg-[#f7f7f8] px-4 py-3 leading-6 outline-none focus:border-black" minLength={10} name="body" placeholder={config.placeholder} required />
              </label>
              <label className="block text-sm font-bold">근거·영상 링크 <span className="font-medium text-black/35">선택</span>
                <input className="mt-2 w-full rounded-xl border border-black/10 bg-[#f7f7f8] px-4 py-3 outline-none focus:border-black" name="evidenceUrl" placeholder="https://" type="url" />
              </label>
              <input aria-hidden="true" className="hidden" name="website" tabIndex={-1} />
              <button className="flex w-full items-center justify-center gap-2 rounded-full bg-black px-5 py-3.5 text-sm font-black text-white" disabled={status === "sending"} type="submit">
                {status === "sending" && <LoaderCircle className="size-4 animate-spin" />}
                {status === "sending" ? "등록 중" : "수정 제안 토론 열기"}
              </button>
              {status === "error" && <p className="text-center text-xs font-bold text-[#d91d46]">등록하지 못했습니다. 내용을 확인하고 다시 시도해 주세요.</p>}
            </form>
          </section>
        </div>
      )}
    </>
  );
}

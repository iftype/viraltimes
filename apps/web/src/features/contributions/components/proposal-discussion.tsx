"use client";

import { ExternalLink, LoaderCircle, MessageSquareText } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import type { ParticipationEntry } from "@/types/meme";
import { participationUpdateEvent, proposalSectionLabels } from "../lib/local-contributions";

export function ProposalDiscussion({ memeId }: { memeId: string }) {
  const [items, setItems] = useState<ParticipationEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const response = await fetch(`/api/v1/memes/${encodeURIComponent(memeId)}/participation?type=proposal&pageSize=30`, { cache: "no-store" });
      if (!response.ok) throw new Error("unavailable");
      const data = (await response.json()) as { items: ParticipationEntry[] };
      setItems(data.items);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [memeId]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    const refresh = () => void load();
    window.addEventListener(participationUpdateEvent, refresh);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener(participationUpdateEvent, refresh);
    };
  }, [load]);

  return (
    <section className="border-y border-black/5 bg-white py-14 sm:py-20" id="proposals">
      <div className="page-shell"><div className="mx-auto max-w-3xl">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-black text-[#8b5cf6]">REVISION BOARD</p>
            <h2 className="mt-1 text-2xl font-black tracking-[-0.04em]">수정 제안 토론</h2>
            <p className="mt-2 text-sm leading-6 text-black/45">설명 수정, 원본 후보, 사용 자료, 연결된 밈과 타임라인 보완을 한곳에서 토론합니다.</p>
          </div>
          <span className="rounded-full bg-[#f4efff] px-3 py-1.5 text-xs font-black text-[#7047a5]">토론 중 {items.length}</span>
        </div>

        {loading ? (
          <div className="mt-6 flex min-h-32 items-center justify-center"><LoaderCircle className="size-5 animate-spin text-black/25" /></div>
        ) : items.length ? (
          <div className="mt-6 space-y-3">
            {items.map((item) => (
              <article className="rounded-2xl border border-black/5 bg-[#f7f7f8] p-5 sm:p-6" key={item.id}>
                <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                  <span className="rounded-full bg-[#fff7df] px-2.5 py-1 text-[#9a6200]">{item.action ?? "수정 제안"}</span>
                  <span className="text-black/35">{item.section ? proposalSectionLabels[item.section] : "사전 항목"} · {item.author}</span>
                </div>
                <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-black/70">{item.body}</p>
                {item.evidenceUrl && <a className="mt-3 inline-flex items-center gap-1.5 text-xs font-black text-[#fe2c55]" href={item.evidenceUrl} rel="noreferrer" target="_blank">근거·영상 열기<ExternalLink className="size-3.5" /></a>}
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-dashed border-black/10 bg-[#f7f7f8] px-6 py-10 text-center">
            <MessageSquareText className="mx-auto size-6 text-black/25" />
            <p className="mt-3 text-sm font-black">아직 열린 수정 제안이 없어요.</p>
            <p className="mt-1 text-xs leading-5 text-black/40">위 제안 버튼에서 필요한 수정 토론을 시작할 수 있어요.</p>
          </div>
        )}
      </div></div>
    </section>
  );
}

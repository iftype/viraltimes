"use client";

import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { getOrCreateSessionId } from "@/features/quiz/utils/session";

type PulsePoint = { date: string; seen: number; notSeen: number };

export function MemePulseCard({ slug }: { slug: string }) {
  const [items, setItems] = useState<PulsePoint[]>([]);
  const [selected, setSelected] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    void fetch(`/api/v1/memes/${encodeURIComponent(slug)}/pulse`, { cache: "no-store" })
      .then((response) => response.ok ? response.json() as Promise<{ items: PulsePoint[] }> : { items: [] })
      .then((data) => { if (active) setItems(data.items); })
      .catch(() => undefined);
    return () => { active = false; };
  }, [slug]);

  const totals = useMemo(() => items.reduce((sum, item) => ({ seen: sum.seen + item.seen, all: sum.all + item.seen + item.notSeen }), { seen: 0, all: 0 }), [items]);
  const maxTotal = Math.max(1, ...items.map((item) => item.seen + item.notSeen));

  async function vote(seen: boolean) {
    setSaving(true);
    try {
      const response = await fetch(`/api/v1/memes/${encodeURIComponent(slug)}/pulse`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: getOrCreateSessionId(), seen }),
      });
      if (!response.ok) throw new Error("save failed");
      const data = (await response.json()) as { items: PulsePoint[] };
      setItems(data.items);
      setSelected(seen);
    } catch {
      // 프로토타입 신호 저장 실패가 상세 열람을 막지 않는다.
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="page-shell pb-6 sm:pb-8" aria-label="최근 사용 신호">
      <div className="mx-auto grid max-w-3xl gap-4 rounded-2xl border border-black/5 bg-white p-4 sm:grid-cols-[1fr_13rem] sm:p-5">
        <div>
          <p className="text-[0.68rem] font-black text-[#fe2c55]">RECENTLY SEEN</p>
          <h2 className="mt-1 text-lg font-black tracking-[-0.03em]">최근 이 밈을 봤나요?</h2>
          <p className="mt-1 text-xs leading-5 text-black/40">하루 한 번 응답을 갱신해 최근 사용 신호를 가볍게 확인합니다.</p>
          <div className="mt-3 flex gap-2">
            <button aria-pressed={selected === true} className={`flex min-w-0 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-black ${selected === true ? "bg-black text-white" : "bg-[#f7f7f8]"}`} disabled={saving} onClick={() => void vote(true)} type="button">{saving ? <LoaderCircle className="size-3.5 animate-spin" /> : <Eye className="size-3.5" />}최근 봤어요</button>
            <button aria-pressed={selected === false} className={`flex min-w-0 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-black ${selected === false ? "bg-black text-white" : "bg-[#f7f7f8]"}`} disabled={saving} onClick={() => void vote(false)} type="button"><EyeOff className="size-3.5" />못 봤어요</button>
          </div>
        </div>
        <div className="rounded-xl bg-[#f7f7f8] p-3">
          <div className="flex items-end justify-between"><p className="text-[0.65rem] font-black text-black/35">14일 응답</p><strong className="text-sm">{totals.all ? `${Math.round((totals.seen / totals.all) * 100)}% 봄` : "집계 전"}</strong></div>
          <div className="mt-3 flex h-16 items-end gap-1" aria-label="최근 14일 응답 그래프">{items.length ? items.map((item) => <div className="min-w-0 flex-1 rounded-t bg-[#fe2c55]" key={item.date} style={{ height: `${Math.max(8, ((item.seen + item.notSeen) / maxTotal) * 100)}%`, opacity: item.seen ? 1 : 0.25 }} title={`${item.date}: 봄 ${item.seen}, 못 봄 ${item.notSeen}`} />) : <div className="flex h-full w-full items-center justify-center text-[0.68rem] font-bold text-black/30">첫 응답을 기다리는 중</div>}</div>
        </div>
      </div>
    </section>
  );
}

"use client";

import { ArrowDown, ArrowUp, LoaderCircle, Plus, Save, Trash2 } from "lucide-react";
import { useState } from "react";

import type { AdminMeme } from "@/components/dictionary-manager";

export type QuizCardConfig = { id: string; memeId: string; field: string; enabled: boolean; sortOrder: number; updatedAt: string };

const fieldSuggestions = ["마이너 밈", "챌린지", "인터넷 방송", "커뮤니티", "게임", "음악·댄스"];

export function QuizCardManager({ items, memes, onChange }: { items: QuizCardConfig[]; memes: AdminMeme[]; onChange: (items: QuizCardConfig[]) => void }) {
  const [drafts, setDrafts] = useState(items);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const published = memes.filter((meme) => meme.publicationStatus === "published");

  function patch(index: number, value: Partial<QuizCardConfig>) {
    setDrafts((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, ...value } : item));
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= drafts.length) return;
    setDrafts((current) => {
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  async function save() {
    setSaving(true);
    setNotice("");
    try {
      const response = await fetch("/viral/api/v1/admin/quiz/cards", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: drafts }),
      });
      if (!response.ok) throw new Error(((await response.json()) as { error?: string }).error ?? "저장하지 못했습니다.");
      const data = (await response.json()) as { items: QuizCardConfig[] };
      onChange(data.items);
      setNotice("퀴즈 카드 구성을 저장했습니다.");
    } catch (cause) {
      setNotice(cause instanceof Error ? cause.message : "저장하지 못했습니다.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="mt-5 rounded-3xl border border-black/5 bg-white p-5 sm:p-7">
      <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-black text-[#fe2c55]">QUIZ DECK</p><h2 className="mt-1 text-2xl font-black tracking-[-0.04em]">퀴즈 카드 관리</h2><p className="mt-1 text-xs leading-5 text-black/40">공개된 밈 중 최대 5개를 골라 분야와 순서를 고정합니다. 비워두면 공개 밈에서 자동 출제합니다.</p></div><button className="flex cursor-pointer items-center gap-1.5 rounded-full bg-black px-4 py-2.5 text-xs font-black text-white disabled:opacity-35" disabled={drafts.length >= 5 || published.length === 0} onClick={() => setDrafts((current) => [...current, { id: `new-${Date.now()}`, memeId: published.find((meme) => !current.some((card) => card.memeId === meme.id))?.id ?? "", field: "마이너 밈", enabled: true, sortOrder: current.length, updatedAt: "" }])} type="button"><Plus className="size-3.5" />카드 추가</button></div>
      <div className="mt-5 space-y-2">{drafts.map((card, index) => <article className="grid gap-2 rounded-2xl bg-[#f7f7f8] p-3 sm:grid-cols-[2.5rem_minmax(0,1fr)_10rem_auto] sm:items-center" key={card.id}>
        <span className="flex size-9 items-center justify-center rounded-xl bg-black text-xs font-black text-white">{index + 1}</span>
        <label className="text-xs font-black text-black/45">
          <span className="flex items-center justify-between">
            <span>사전 항목</span>
            {memes.find((m) => m.id === card.memeId)?.slug && (
              <a
                href={`https://viralorigin.vercel.app/memes/${memes.find((m) => m.id === card.memeId)?.slug}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[0.68rem] font-bold text-black/60 hover:text-black"
              >
                웹에서 보기 ↗
              </a>
            )}
          </span>
          <select className="mt-1 w-full cursor-pointer rounded-xl border border-black/5 bg-white px-3 py-2.5 text-base font-bold" onChange={(event) => patch(index, { memeId: event.target.value })} value={card.memeId}><option value="">밈 선택</option>{published.map((meme) => <option disabled={drafts.some((candidate, candidateIndex) => candidateIndex !== index && candidate.memeId === meme.id)} key={meme.id} value={meme.id}>{meme.title}</option>)}</select>
        </label>
        <label className="text-xs font-black text-black/45">분야<input className="mt-1 w-full rounded-xl border border-black/5 bg-white px-3 py-2.5 text-base font-bold outline-none" list={`quiz-fields-${index}`} maxLength={40} onChange={(event) => patch(index, { field: event.target.value })} value={card.field} /><datalist id={`quiz-fields-${index}`}>{fieldSuggestions.map((field) => <option key={field} value={field} />)}</datalist></label>
        <div className="flex justify-end gap-1"><button aria-label="위로" className="cursor-pointer rounded-lg bg-white p-2 text-black/45 disabled:opacity-25" disabled={index === 0} onClick={() => move(index, -1)} type="button"><ArrowUp className="size-4" /></button><button aria-label="아래로" className="cursor-pointer rounded-lg bg-white p-2 text-black/45 disabled:opacity-25" disabled={index === drafts.length - 1} onClick={() => move(index, 1)} type="button"><ArrowDown className="size-4" /></button><button aria-label="카드 제거" className="cursor-pointer rounded-lg bg-[#fff0f3] p-2 text-[#d91d46]" onClick={() => setDrafts((current) => current.filter((_, itemIndex) => itemIndex !== index))} type="button"><Trash2 className="size-4" /></button></div>
      </article>)}{drafts.length === 0 && <p className="rounded-2xl bg-[#f7f7f8] p-8 text-center text-sm font-bold text-black/35">고정 카드가 없습니다. 현재는 공개 밈 중 5개가 자동으로 섞여 나옵니다.</p>}</div>
      <button className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#fe2c55] px-5 py-3 text-sm font-black text-white disabled:opacity-40" disabled={saving || drafts.some((card) => !card.memeId || !card.field.trim())} onClick={() => void save()} type="button">{saving ? <LoaderCircle className="size-4 animate-spin" /> : <Save className="size-4" />}{saving ? "저장 중" : "퀴즈 구성 저장"}</button>
      {notice && <p className="mt-3 text-center text-xs font-bold text-black/45">{notice}</p>}
    </section>
  );
}

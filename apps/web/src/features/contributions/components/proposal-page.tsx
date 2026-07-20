"use client";

import { ArrowLeft, LoaderCircle, MessageSquareText } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import type { Meme } from "@/types/meme";
import { memeHref } from "@/lib/meme-href";

import { ProposalButton } from "./proposal-button";
import { ProposalDiscussion } from "./proposal-discussion";
import type { ProposalSection } from "../lib/local-contributions";

const sections: ProposalSection[] = ["description", "origin", "trending", "related", "timeline"];

export function ProposalPage() {
  const slug = useSearchParams().get("meme")?.trim().toLowerCase() ?? "";
  const [meme, setMeme] = useState<Meme | null>(null);
  const [loading, setLoading] = useState(Boolean(slug));

  useEffect(() => {
    let active = true;
    if (!slug) {
      return () => { active = false; };
    }
    void fetch(`/api/v1/memes/${encodeURIComponent(slug)}`, { cache: "no-store" })
      .then((response) => response.ok ? response.json() as Promise<{ item: Meme }> : Promise.reject(new Error("not found")))
      .then((data) => { if (active) setMeme(data.item); })
      .catch(() => { if (active) setMeme(null); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [slug]);

  if (loading) return <div className="page-shell flex min-h-[65vh] items-center justify-center"><LoaderCircle className="size-6 animate-spin text-black/30" aria-label="불러오는 중" /></div>;
  if (!meme) return <section className="page-shell flex min-h-[65vh] flex-col items-center justify-center text-center"><MessageSquareText className="size-8 text-black/25" /><h1 className="mt-4 text-2xl font-black">수정할 사전 항목을 찾을 수 없어요</h1><Link className="mt-5 rounded-full bg-black px-5 py-3 text-sm font-black text-white" href="/">사전으로 돌아가기</Link></section>;

  return (
    <div className="pb-14">
      <header className="page-shell py-8 sm:py-12"><div className="mx-auto max-w-3xl">
        <Link className="inline-flex items-center gap-1.5 text-sm font-bold text-black/45 hover:text-black" href={memeHref(meme.slug)}><ArrowLeft className="size-4" />사전 항목으로 돌아가기</Link>
        <p className="mt-8 text-xs font-black text-[#8b5cf6]">REVISION BOARD</p>
        <h1 className="mt-2 text-4xl font-black tracking-[-0.055em] sm:text-5xl">{meme.title} 수정 제안</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-black/50">잘못된 설명, 더 정확한 원본, 사용 영상·자료, 연결된 밈을 한곳에서 제안하고 토론할 수 있어요.</p>
        <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {sections.map((section) => <ProposalButton className="w-full" key={section} memeId={meme.id} memeTitle={meme.title} section={section} />)}
        </div>
      </div></header>
      <ProposalDiscussion memeId={meme.id} />
    </div>
  );
}

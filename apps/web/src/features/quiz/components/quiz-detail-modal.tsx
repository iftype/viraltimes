"use client";

import { ArrowUpRight, X } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

import { memeHref } from "@/lib/meme-href";

interface QuizCard {
  slug: string;
  title: string;
}

interface QuizDetailModalProps {
  card: QuizCard;
  onClose: () => void;
  onOpenPage: () => void;
}

export function QuizDetailModal({ card, onClose, onOpenPage }: QuizDetailModalProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", handleKeyDown); document.body.style.overflow = ""; };
  }, [onClose]);

  const href = memeHref(card.slug);
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 sm:items-center sm:p-4">
      <button aria-label="영상 닫기" className="absolute inset-0 cursor-default" onClick={onClose} type="button" />
      <section aria-labelledby="quiz-media-title" aria-modal="true" className="relative flex h-[84dvh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl md:h-[min(820px,calc(100dvh-3rem))] md:max-w-[430px] md:rounded-[2rem]" role="dialog">
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-black/5 px-4 py-3">
          <div className="min-w-0"><p className="text-[0.62rem] font-black text-[#fe2c55]">VIRALTIMES</p><h2 className="truncate text-sm font-black" id="quiz-media-title">{card.title} 영상 보기</h2></div>
          <button aria-label="닫기" className="cursor-pointer rounded-full bg-black/5 p-2" onClick={onClose} type="button"><X className="size-4" /></button>
        </header>
        <iframe className="min-h-0 w-full flex-1 border-0" src={href} title={`${card.title} 상세 페이지`} />
        <footer className="flex shrink-0 gap-2 border-t border-black/5 bg-white p-3">
          <button className="flex-1 cursor-pointer rounded-full bg-black/5 px-4 py-2.5 text-xs font-black" onClick={onClose} type="button">퀴즈 계속하기</button>
          <Link className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-black px-4 py-2.5 text-xs font-black text-white" href={href} onClick={onOpenPage}>전체 페이지 열기<ArrowUpRight className="size-3.5" /></Link>
        </footer>
      </section>
    </div>
  );
}

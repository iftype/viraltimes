"use client";

import { AlertTriangle, ArrowLeft, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { getMemeBySlug, sampleMemes } from "@/data/sample-memes";
import type { Meme } from "@/types/meme";

import { MemeDetail } from "./meme-detail";

export function DynamicMemeDetail() {
  const slug = useSearchParams().get("slug")?.trim().toLowerCase() ?? "";
  const [meme, setMeme] = useState<Meme | null>(null);
  const [otherMemes, setOtherMemes] = useState<Meme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    if (!slug) {
      return () => {
        active = false;
      };
    }

    void Promise.all([
      fetch(`/api/v1/memes/${encodeURIComponent(slug)}`, { cache: "no-store" }),
      fetch("/api/v1/memes", { cache: "no-store" }),
    ])
      .then(async ([detailResponse, listResponse]) => {
        if (!detailResponse.ok) throw new Error("not-found");
        const detail = (await detailResponse.json()) as { item: Meme };
        const list = listResponse.ok
          ? ((await listResponse.json()) as { items: Meme[] }).items
          : sampleMemes;
        if (!active) return;
        setMeme(detail.item);
        setOtherMemes(
          list.filter((candidate) => candidate.id !== detail.item.id).slice(0, 3),
        );
      })
      .catch(() => {
        if (!active) return;
        const fallback = getMemeBySlug(slug);
        if (fallback) {
          setMeme(fallback);
          setOtherMemes(
            sampleMemes.filter((candidate) => candidate.id !== fallback.id).slice(0, 3),
          );
        } else {
          setError("아직 공개되지 않았거나 찾을 수 없는 사전 항목입니다.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [slug]);

  if (!slug) {
    return (
      <section className="page-shell flex min-h-[65vh] flex-col items-center justify-center text-center">
        <AlertTriangle className="size-8 text-[#fe2c55]" aria-hidden="true" />
        <h1 className="mt-4 text-2xl font-black">항목을 열 수 없어요</h1>
        <p className="mt-2 text-sm text-black/45">사전 항목 주소가 올바르지 않습니다.</p>
        <Link className="mt-6 inline-flex items-center gap-2 rounded-full bg-black px-5 py-3 text-sm font-black text-white" href="/">
          <ArrowLeft className="size-4" aria-hidden="true" /> 사전으로 돌아가기
        </Link>
      </section>
    );
  }

  if (loading) {
    return (
      <div className="page-shell flex min-h-[65vh] items-center justify-center">
        <LoaderCircle className="size-6 animate-spin text-black/30" aria-label="불러오는 중" />
      </div>
    );
  }

  if (!meme) {
    return (
      <section className="page-shell flex min-h-[65vh] flex-col items-center justify-center text-center">
        <AlertTriangle className="size-8 text-[#fe2c55]" aria-hidden="true" />
        <h1 className="mt-4 text-2xl font-black">항목을 열 수 없어요</h1>
        <p className="mt-2 text-sm text-black/45">{error}</p>
        <Link className="mt-6 inline-flex items-center gap-2 rounded-full bg-black px-5 py-3 text-sm font-black text-white" href="/">
          <ArrowLeft className="size-4" aria-hidden="true" /> 사전으로 돌아가기
        </Link>
      </section>
    );
  }

  return <MemeDetail meme={meme} otherMemes={otherMemes} />;
}

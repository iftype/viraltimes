"use client";

import { Check, LoaderCircle, MessageCircle, Send } from "lucide-react";
import { FormEvent, useCallback, useEffect, useState } from "react";

import { Button, Card, Field } from "@origin/ui";
import type { ParticipationEntry } from "@/types/meme";
import { participationUpdateEvent } from "../lib/local-contributions";

export function CommentSection({ memeId, memeTitle }: { memeId: string; memeTitle: string }) {
  const [items, setItems] = useState<ParticipationEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const load = useCallback(async () => {
    try {
      const response = await fetch(`/api/v1/memes/${encodeURIComponent(memeId)}/participation?type=comment&pageSize=30`, { cache: "no-store" });
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
    return () => window.clearTimeout(timer);
  }, [load]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch(`/api/v1/memes/${encodeURIComponent(memeId)}/participation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "comment",
          author: String(form.get("author") ?? "").trim() || "익명",
          body: String(form.get("body") ?? "").trim(),
          website: String(form.get("website") ?? ""),
        }),
      });
      if (!response.ok) throw new Error("comment failed");
      event.currentTarget.reset();
      setStatus("sent");
      await load();
      window.dispatchEvent(new CustomEvent(participationUpdateEvent));
    } catch {
      setStatus("error");
    }
  }

  return (
    <section className="page-shell py-8 sm:py-12" id="comments">
      <div className="mx-auto max-w-3xl">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div><p className="text-xs font-black text-[#25a9a4]">COMMUNITY</p><h2 className="mt-1 text-xl font-black tracking-[-0.035em]">{memeTitle} 댓글</h2><p className="mt-1 text-xs leading-5 text-black/45">어디서 봤는지 가볍게 남겨주세요.</p></div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e8fffe] px-3 py-1.5 text-xs font-black text-[#087b77]"><MessageCircle className="size-3.5" />댓글 {items.length}</span>
        </div>

        <Card className="mt-4 p-4">
          <form className="grid gap-2 sm:grid-cols-[9rem_1fr]" onSubmit={submit}>
            <Field label="닉네임" hint="선택"><input maxLength={30} name="author" placeholder="익명" /></Field>
            <Field label="댓글"><textarea className="min-h-20" maxLength={1000} minLength={2} name="body" placeholder="어디서 봤는지 알려주세요." required /></Field>
            <input aria-hidden="true" className="hidden" name="website" tabIndex={-1} />
            <div className="sm:col-span-2">
              <Button className="w-full py-2.5" disabled={status === "sending"} type="submit">{status === "sending" ? <LoaderCircle className="size-4 animate-spin" /> : <Send className="size-4" />}{status === "sending" ? "등록 중" : "댓글 등록"}</Button>
              {status === "sent" && <p className="mt-2 flex items-center justify-center gap-1.5 text-xs font-black text-[#087b77]"><Check className="size-3.5" />댓글이 등록됐어요.</p>}
              {status === "error" && <p className="mt-2 text-center text-xs font-bold text-[#d91d46]">등록하지 못했습니다. 잠시 후 다시 시도해 주세요.</p>}
            </div>
          </form>
        </Card>

        {loading ? <div className="flex min-h-28 items-center justify-center"><LoaderCircle className="size-5 animate-spin text-black/25" /></div> : items.length ? (
          <div className="mt-4 space-y-2">
            {items.map((item) => <article className="rounded-xl border border-black/5 bg-white px-4 py-3" key={item.id}><div className="flex items-center justify-between gap-3"><span className="text-xs font-black">{item.author}</span><time className="text-[0.65rem] font-bold text-black/25">{new Intl.DateTimeFormat("ko-KR", { month: "short", day: "numeric" }).format(new Date(item.createdAt))}</time></div><p className="mt-1.5 whitespace-pre-wrap text-sm leading-5 text-black/60">{item.body}</p></article>)}
          </div>
        ) : <p className="mt-5 text-center text-xs text-black/35">첫 댓글을 남겨보세요.</p>}
      </div>
    </section>
  );
}

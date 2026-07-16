"use client";

import { Check, LoaderCircle, Send } from "lucide-react";
import { FormEvent, useState } from "react";

import { Button, Card, Field } from "@origin/ui";

export function SiteFeedbackForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/v1/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: "feedback",
          title: String(form.get("title") ?? "").trim(),
          author: String(form.get("author") ?? "").trim() || "익명",
          description: String(form.get("description") ?? "").trim(),
          sourceUrl: String(form.get("sourceUrl") ?? "").trim() || undefined,
        }),
      });
      if (!response.ok) throw new Error("feedback failed");
      event.currentTarget.reset();
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  return (
    <Card className="p-5 sm:p-7">
      <form className="grid gap-4 sm:grid-cols-2" onSubmit={submit}>
        <Field label="피드백 제목" wide>
          <input name="title" placeholder="예: 모바일에서 검색창이 잘려 보여요" required />
        </Field>
        <Field label="닉네임" hint="선택">
          <input name="author" placeholder="익명" />
        </Field>
        <Field label="관련 페이지" hint="선택">
          <input name="sourceUrl" placeholder="https://" type="url" />
        </Field>
        <Field label="사이트 피드백 내용" wide>
          <textarea name="description" placeholder="어느 페이지에서 무엇이 불편했는지, 어떻게 개선되면 좋을지 적어주세요." required />
        </Field>
        <div className="sm:col-span-2">
          <Button className="w-full" disabled={status === "sending"} size="lg" type="submit">
            {status === "sending" ? <LoaderCircle className="size-4 animate-spin" /> : <Send className="size-4" />}
            {status === "sending" ? "보내는 중" : "사이트 피드백 보내기"}
          </Button>
          {status === "sent" && <p className="mt-3 flex items-center justify-center gap-2 text-xs font-black text-[#087b77]"><Check className="size-4" />접수됐어요. 관리자 알림에 추가했습니다.</p>}
          {status === "error" && <p className="mt-3 text-center text-xs font-bold text-[#d91d46]">전송하지 못했습니다. 잠시 후 다시 시도하거나 이메일로 알려주세요.</p>}
        </div>
      </form>
    </Card>
  );
}

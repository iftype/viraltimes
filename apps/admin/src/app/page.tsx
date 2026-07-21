"use client";

import {
  AlertTriangle,
  Check,
  ChevronRight,
  ExternalLink,
  LoaderCircle,
  RotateCcw,
  X,
  Bell,
  Video,
  MessageSquareText,
  FileCheck2,
  Flag,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth-provider";

type Category = "meme_request" | "origin_tip" | "feedback" | "proposal" | "report";
type Status = "new" | "review" | "resolved" | "rejected";
type Tab = "all" | Category | "final_review";

type InboxItem = {
  id: string;
  category: Category;
  status: Status;
  title: string;
  author: string;
  description: string;
  sourceUrl?: string;
  originUrl?: string;
  subjectId?: string;
  createdAt: string;
  updatedAt: string;
};

const apiBase = "/viral/api/v1";

const categoryMeta: Record<Category, { label: string; className: string }> = {
  meme_request: { label: "영상 제보", className: "bg-[#e8fffe] text-[#087b77]" },
  origin_tip: { label: "원본 영상", className: "bg-[#fff0f3] text-[#d91d46]" },
  feedback: { label: "피드백", className: "bg-[#f1edff] text-[#6941c6]" },
  proposal: { label: "수정 제안", className: "bg-[#fff7df] text-[#9a6200]" },
  report: { label: "신고", className: "bg-[#fff6dc] text-[#9a6200]" },
};

const tabs: { id: Tab; label: string; icon: typeof Bell }[] = [
  { id: "all", label: "전체 알림", icon: Bell },
  { id: "meme_request", label: "영상 제보", icon: Video },
  { id: "origin_tip", label: "원본 영상", icon: Video },
  { id: "feedback", label: "피드백", icon: MessageSquareText },
  { id: "proposal", label: "수정 제안", icon: FileCheck2 },
  { id: "final_review", label: "최종 검토", icon: FileCheck2 },
  { id: "report", label: "신고", icon: Flag },
];

function relativeTime(value: string) {
  const seconds = Math.floor((Date.now() - new Date(value).getTime()) / 1000);
  if (seconds < 60) return "방금 전";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}분 전`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}시간 전`;
  if (seconds < 86400 * 7) return `${Math.floor(seconds / 86400)}일 전`;
  return new Intl.DateTimeFormat("ko-KR", { month: "short", day: "numeric" }).format(new Date(value));
}

async function readError(response: Response) {
  try {
    const data = (await response.json()) as { error?: string };
    return data.error ?? "요청을 처리하지 못했습니다.";
  } catch {
    return "요청을 처리하지 못했습니다.";
  }
}

export default function DashboardPage() {
  const { setAuthenticated } = useAuth();
  const [items, setItems] = useState<InboxItem[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const loadInbox = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${apiBase}/admin/inbox`, { cache: "no-store" });
      if (response.status === 401) {
        setAuthenticated(false);
        return;
      }
      if (!response.ok) throw new Error(await readError(response));
      
      const data = (await response.json()) as { items: InboxItem[] };
      setItems(data.items || []);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "알림을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [setAuthenticated]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadInbox(), 0);
    return () => window.clearTimeout(timer);
  }, [loadInbox]);

  const openItems = useMemo(() => items.filter((item) => item.status === "new" || item.status === "review"), [items]);
  const visibleItems = useMemo(() => {
    if (activeTab === "all") return openItems;
    if (activeTab === "final_review") return items.filter((item) => item.status === "review");
    return items.filter((item) => item.category === activeTab && (item.status === "new" || item.status === "review"));
  }, [activeTab, items, openItems]);

  const countFor = (tab: Tab) => {
    if (tab === "all") return openItems.length;
    if (tab === "final_review") return items.filter((item) => item.status === "review").length;
    return openItems.filter((item) => item.category === tab).length;
  };

  async function updateStatus(item: InboxItem, status: Status) {
    setUpdatingId(item.id);
    setError("");
    try {
      const response = await fetch(`${apiBase}/admin/inbox/${encodeURIComponent(item.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (response.status === 401) {
        setAuthenticated(false);
        return;
      }
      if (!response.ok) throw new Error(await readError(response));
      const data = (await response.json()) as { item: InboxItem };
      setItems((current) => current.map((candidate) => candidate.id === item.id ? data.item : candidate));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "상태를 바꾸지 못했습니다.");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="space-y-8">
      <section className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <h1 className="text-3xl font-black tracking-[-0.055em] sm:text-4xl">무슨 일이 올라왔나요?</h1>
          <p className="mt-2 text-sm text-black/45">새 제보를 확인하고, 확정 전 마지막 검토까지 처리하세요.</p>
        </div>
        <button
          className="flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2.5 text-xs font-black shadow-sm transition hover:border-black"
          onClick={() => void loadInbox()}
          type="button"
        >
          <RotateCcw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
          새로고침
        </button>
      </section>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["새 알림", items.filter((item) => item.status === "new").length, "bg-[#18181b] text-white"],
          ["최종 검토", items.filter((item) => item.status === "review").length, "bg-[#fff0f3] text-[#d91d46]"],
          [
            "오늘 처리",
            items.filter(
              (item) => item.status === "resolved" && new Date(item.updatedAt).toDateString() === new Date().toDateString()
            ).length,
            "bg-[#e8fffe] text-[#087b77]",
          ],
          ["신고 대기", openItems.filter((item) => item.category === "report").length, "bg-[#fff6dc] text-[#9a6200]"],
        ].map(([label, count, className]) => (
          <div className={`rounded-2xl p-4 sm:p-5 ${className}`} key={String(label)}>
            <p className="text-xs font-bold opacity-65">{label}</p>
            <p className="mt-2 text-3xl font-black tracking-[-0.04em]">{count}</p>
          </div>
        ))}
      </section>

      <nav className="hide-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0" aria-label="관리 항목">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const selected = activeTab === tab.id;
          return (
            <button
              aria-current={selected ? "page" : undefined}
              className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-xs font-black transition ${
                selected
                  ? "bg-black text-white"
                  : "border border-black/5 bg-white text-black/50 hover:border-black/20 hover:text-black"
              }`}
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              type="button"
            >
              <Icon className="size-3.5" />
              {tab.label}
              <span className={`rounded-full px-1.5 py-0.5 text-[0.62rem] ${selected ? "bg-white/20" : "bg-black/5"}`}>
                {countFor(tab.id)}
              </span>
            </button>
          );
        })}
      </nav>

      {error && (
        <p className="flex items-center gap-2 rounded-xl bg-[#fff0f3] px-4 py-3 text-xs font-bold text-[#d91d46]">
          <AlertTriangle className="size-4" />
          {error}
        </p>
      )}

      <section aria-live="polite" className="space-y-3">
        {loading ? (
          <div className="flex min-h-56 items-center justify-center rounded-3xl border border-black/5 bg-white">
            <LoaderCircle className="size-6 animate-spin text-black/25" />
          </div>
        ) : visibleItems.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center rounded-3xl border border-dashed border-black/10 bg-white px-6 text-center">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-[#e8fffe] text-[#087b77]">
              <Check className="size-6" />
            </span>
            <h2 className="mt-4 text-lg font-black">여기는 다 확인했어요</h2>
            <p className="mt-1 text-sm leading-6 text-black/40">새로운 알림이 들어오면 이 탭에 바로 표시됩니다.</p>
          </div>
        ) : (
          visibleItems.map((item) => {
            const meta = categoryMeta[item.category];
            const updating = updatingId === item.id;
            return (
              <article
                className="rounded-3xl border border-black/5 bg-white p-5 shadow-[0_8px_28px_rgba(0,0,0,0.04)] sm:p-6"
                key={item.id}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-[0.68rem] font-black ${meta.className}`}>
                      {meta.label}
                    </span>
                    {item.status === "review" && (
                      <span className="rounded-full bg-black px-2.5 py-1 text-[0.68rem] font-black text-white">
                        최종 검토
                      </span>
                    )}
                    <span className="text-xs font-bold text-black/30">{relativeTime(item.updatedAt)}</span>
                  </div>
                  <span className="text-xs font-bold text-black/30">by {item.author}</span>
                </div>
                <h2 className="mt-4 text-xl font-black tracking-[-0.035em]">{item.title}</h2>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-black/55">{item.description}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {item.sourceUrl && (
                    <a
                      className="inline-flex items-center gap-1.5 rounded-full bg-black/5 px-3 py-2 text-xs font-black"
                      href={item.sourceUrl}
                      rel="noreferrer"
                      target="_blank"
                    >
                      제보 영상
                      <ExternalLink className="size-3.5" />
                    </a>
                  )}
                  {item.originUrl && (
                    <a
                      className="inline-flex items-center gap-1.5 rounded-full bg-[#fff0f3] px-3 py-2 text-xs font-black text-[#d91d46]"
                      href={item.originUrl}
                      rel="noreferrer"
                      target="_blank"
                    >
                      제보자가 아는 원본
                      <ExternalLink className="size-3.5" />
                    </a>
                  )}
                </div>
                <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-black/5 pt-4">
                  {item.status === "new" ? (
                    <>
                      <button
                        className="flex items-center gap-1.5 rounded-full bg-black px-4 py-2.5 text-xs font-black text-white"
                        disabled={updating}
                        onClick={() => void updateStatus(item, "review")}
                        type="button"
                      >
                        검토로 보내기
                        <ChevronRight className="size-3.5" />
                      </button>
                      <button
                        className="rounded-full bg-[#e8fffe] px-4 py-2.5 text-xs font-black text-[#087b77]"
                        disabled={updating}
                        onClick={() => void updateStatus(item, "resolved")}
                        type="button"
                      >
                        바로 처리 완료
                      </button>
                      <button
                        aria-label="반려"
                        className="ml-auto rounded-full p-2.5 text-black/25 transition hover:bg-[#fff0f3] hover:text-[#d91d46]"
                        disabled={updating}
                        onClick={() => void updateStatus(item, "rejected")}
                        type="button"
                      >
                        <X className="size-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="flex items-center gap-1.5 rounded-full bg-[#fe2c55] px-4 py-2.5 text-xs font-black text-white"
                        disabled={updating}
                        onClick={() => void updateStatus(item, "resolved")}
                        type="button"
                      >
                        <Check className="size-3.5" />
                        최종 확정
                      </button>
                      <button
                        className="flex items-center gap-1.5 rounded-full bg-black/5 px-4 py-2.5 text-xs font-black text-black/55"
                        disabled={updating}
                        onClick={() => void updateStatus(item, "new")}
                        type="button"
                      >
                        <RotateCcw className="size-3.5" />
                        되돌리기
                      </button>
                    </>
                  )}
                </div>
              </article>
            );
          })
        )}
      </section>
    </div>
  );
}

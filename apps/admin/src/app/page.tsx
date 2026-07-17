"use client";

import {
  AlertTriangle,
  Bell,
  BookOpenText,
  Check,
  ChevronRight,
  CircleHelp,
  ExternalLink,
  FileCheck2,
  Flag,
  Lightbulb,
  LoaderCircle,
  LogOut,
  MessageSquareText,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Tags,
  Video,
  X,
  BarChart3,
  Download,
} from "lucide-react";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { BrandMark } from "@origin/ui";

import {
  DictionaryManager,
  type AdminMeme,
} from "@/components/dictionary-manager";
import {
  CategoryManager,
  type AdminCategory,
} from "@/components/category-manager";

type Category = "meme_request" | "origin_tip" | "feedback" | "proposal" | "report";
type Status = "new" | "review" | "resolved" | "rejected";
type Tab = "all" | Category | "final_review" | "dictionary" | "categories" | "quiz_logs";

type InboxItem = {
  id: string;
  category: Category;
  status: Status;
  title: string;
  author: string;
  description: string;
  sourceUrl?: string;
  subjectId?: string;
  createdAt: string;
  updatedAt: string;
};

type QuizLog = {
  id: string;
  sessionId: string;
  cardId: string;
  cardType: "minor" | "origin";
  response: "know" | "dont_know" | "view_detail";
  timestamp: string;
};

const apiBase = "/viral/api/v1";

const categoryMeta: Record<Category, { label: string; className: string }> = {
  meme_request: { label: "밈 추가 요청", className: "bg-[#e8fffe] text-[#087b77]" },
  origin_tip: { label: "원본 영상", className: "bg-[#fff0f3] text-[#d91d46]" },
  feedback: { label: "피드백", className: "bg-[#f1edff] text-[#6941c6]" },
  proposal: { label: "수정 제안", className: "bg-[#fff7df] text-[#9a6200]" },
  report: { label: "신고", className: "bg-[#fff6dc] text-[#9a6200]" },
};

const tabs: { id: Tab; label: string; icon: typeof Bell }[] = [
  { id: "all", label: "전체 알림", icon: Bell },
  { id: "dictionary", label: "사전 관리", icon: BookOpenText },
  { id: "categories", label: "카테고리", icon: Tags },
  { id: "quiz_logs", label: "매치 로그", icon: BarChart3 },
  { id: "meme_request", label: "밈 추가 요청", icon: CircleHelp },
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

function Login({ onAuthenticated }: { onAuthenticated: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${apiBase}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!response.ok) throw new Error(await readError(response));
      onAuthenticated();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "로그인하지 못했습니다.");
      setPassword("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-5">
      <section className="w-full max-w-sm rounded-[2rem] border border-black/5 bg-white p-7 shadow-[0_24px_70px_rgba(0,0,0,0.09)] sm:p-9">
        <div className="flex items-center gap-3">
          <BrandMark className="size-11 rounded-2xl text-lg" />
          <div>
            <p className="text-sm font-black tracking-[-0.04em]">VIRALORIGIN</p>
            <p className="text-xs font-bold text-black/35">ADMIN</p>
          </div>
        </div>
        <h1 className="mt-10 text-3xl font-black tracking-[-0.055em]">관리자 확인</h1>
        <p className="mt-2 text-sm leading-6 text-black/45">제보와 검토 알림을 확인하려면 비밀번호를 입력해 주세요.</p>
        <form className="mt-7" onSubmit={submit}>
          <label className="text-xs font-black text-black/45" htmlFor="admin-password">비밀번호</label>
          <input
            id="admin-password"
            autoComplete="current-password"
            autoFocus
            className="mt-2 w-full rounded-2xl border border-black/10 bg-[#f7f7f8] px-4 py-4 text-center text-xl font-black tracking-[0.5em] outline-none transition focus:border-black"
            inputMode="numeric"
            maxLength={4}
            pattern="[0-9]*"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value.replace(/\D/g, ""))}
          />
          {error && <p className="mt-3 flex items-center gap-2 text-xs font-bold text-[#d91d46]"><AlertTriangle className="size-4" />{error}</p>}
          <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-black px-5 py-3.5 text-sm font-black text-white" disabled={loading || password.length !== 4} type="submit">
            {loading ? <LoaderCircle className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
            {loading ? "확인 중" : "들어가기"}
          </button>
        </form>
        <p className="mt-5 text-center text-[0.68rem] leading-5 text-black/30">12시간 후 자동 로그아웃 · 로그인 시도 제한 적용</p>
      </section>
    </main>
  );
}

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [items, setItems] = useState<InboxItem[]>([]);
  const [memes, setMemes] = useState<AdminMeme[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [quizLogs, setQuizLogs] = useState<QuizLog[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const loadInbox = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [inboxResponse, memeResponse, categoryResponse, quizLogsResponse] = await Promise.all([
        fetch(`${apiBase}/admin/inbox`, { cache: "no-store" }),
        fetch(`${apiBase}/admin/memes`, { cache: "no-store" }),
        fetch(`${apiBase}/admin/categories`, { cache: "no-store" }),
        fetch(`${apiBase}/admin/quiz/logs`, { cache: "no-store" }),
      ]);
      if (
        inboxResponse.status === 401 ||
        memeResponse.status === 401 ||
        categoryResponse.status === 401 ||
        quizLogsResponse.status === 401
      ) {
        setAuthenticated(false);
        return;
      }
      if (!inboxResponse.ok) throw new Error(await readError(inboxResponse));
      if (!memeResponse.ok) throw new Error(await readError(memeResponse));
      if (!categoryResponse.ok) throw new Error(await readError(categoryResponse));
      if (!quizLogsResponse.ok) throw new Error(await readError(quizLogsResponse));
      
      const inboxData = (await inboxResponse.json()) as { items: InboxItem[] };
      const memeData = (await memeResponse.json()) as { items: AdminMeme[] };
      const categoryData = (await categoryResponse.json()) as { items: AdminCategory[] };
      const quizLogsData = (await quizLogsResponse.json()) as { items: QuizLog[] };
      
      setItems(inboxData.items);
      setMemes(memeData.items);
      setCategories(categoryData.items);
      setQuizLogs(quizLogsData.items || []);
      setAuthenticated(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "알림을 불러오지 못했습니다.");
      setAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadInbox(), 0);
    return () => window.clearTimeout(timer);
  }, [loadInbox]);

  const openItems = useMemo(() => items.filter((item) => item.status === "new" || item.status === "review"), [items]);
  const visibleItems = useMemo(() => {
    if (activeTab === "all") return openItems;
    if (activeTab === "dictionary" || activeTab === "categories" || activeTab === "quiz_logs") return [];
    if (activeTab === "final_review") return items.filter((item) => item.status === "review");
    return items.filter((item) => item.category === activeTab && (item.status === "new" || item.status === "review"));
  }, [activeTab, items, openItems]);

  const countFor = (tab: Tab) => {
    if (tab === "all") return openItems.length;
    if (tab === "dictionary") return memes.filter((meme) => meme.publicationStatus === "published").length;
    if (tab === "categories") return categories.filter((category) => category.isActive).length;
    if (tab === "quiz_logs") return quizLogs.length;
    if (tab === "final_review") return items.filter((item) => item.status === "review").length;
    return openItems.filter((item) => item.category === tab).length;
  };

  const quizStats = useMemo(() => {
    const total = quizLogs.length;
    const stats: Record<string, { know: number; dont_know: number; view_detail: number; total: number }> = {
      minor: { know: 0, dont_know: 0, view_detail: 0, total: 0 },
      origin: { know: 0, dont_know: 0, view_detail: 0, total: 0 }
    };
    quizLogs.forEach(log => {
      const type = log.cardType;
      if (type && stats[type]) {
        stats[type].total++;
        if (log.response === "know") stats[type].know++;
        else if (log.response === "dont_know") stats[type].dont_know++;
        else if (log.response === "view_detail") stats[type].view_detail++;
      }
    });
    return { total, stats };
  }, [quizLogs]);

  const downloadCSV = () => {
    if (!quizLogs.length) return;
    const headers = ["ID", "Session ID", "Card ID", "Card Type", "Response", "Timestamp"];
    const rows = quizLogs.map(log => [
      log.id,
      log.sessionId,
      log.cardId,
      log.cardType,
      log.response,
      log.timestamp
    ]);
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(val => `"${val}"`).join(","))
    ].join("\n");
    
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `quiz_match_logs_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
      if (!response.ok) throw new Error(await readError(response));
      const data = (await response.json()) as { item: InboxItem };
      setItems((current) => current.map((candidate) => candidate.id === item.id ? data.item : candidate));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "상태를 바꾸지 못했습니다.");
    } finally {
      setUpdatingId(null);
    }
  }

  async function logout() {
    await fetch(`${apiBase}/admin/logout`, { method: "POST" });
    setItems([]);
    setMemes([]);
    setCategories([]);
    setQuizLogs([]);
    setAuthenticated(false);
  }

  if (authenticated === null) {
    return <main className="flex min-h-screen items-center justify-center"><LoaderCircle className="size-6 animate-spin text-black/35" aria-label="불러오는 중" /></main>;
  }
  if (!authenticated) return <Login onAuthenticated={() => void loadInbox()} />;

  return (
    <main className="min-h-screen pb-16">
      <header className="sticky top-0 z-30 border-b border-black/5 bg-white/85 backdrop-blur-xl">
        <div className="admin-shell flex h-16 items-center justify-between">
          <div className="flex items-center gap-2.5 font-black"><BrandMark /><span className="tracking-[-0.04em]">VIRALORIGIN</span><span className="hidden rounded-full bg-black/5 px-2 py-1 text-[0.62rem] text-black/45 sm:inline">ADMIN</span></div>
          <button className="flex items-center gap-2 rounded-full px-3 py-2 text-xs font-black text-black/45 transition hover:bg-black/5 hover:text-black" onClick={() => void logout()} type="button"><LogOut className="size-4" />로그아웃</button>
        </div>
      </header>

      <div className="admin-shell pt-8 sm:pt-12">
        <section className="flex flex-wrap items-end justify-between gap-5">
          <div><p className="flex items-center gap-1.5 text-xs font-black text-[#fe2c55]"><Sparkles className="size-3.5" />TODAY&apos;S QUEUE</p><h1 className="mt-2 text-3xl font-black tracking-[-0.055em] sm:text-4xl">무슨 일이 올라왔나요?</h1><p className="mt-2 text-sm text-black/45">새 제보를 확인하고, 확정 전 마지막 검토까지 처리하세요.</p></div>
          <button className="flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2.5 text-xs font-black shadow-sm transition hover:border-black" onClick={() => void loadInbox()} type="button"><RotateCcw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />새로고침</button>
        </section>

        <section className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ["새 알림", items.filter((item) => item.status === "new").length, "bg-black text-white"],
            ["최종 검토", items.filter((item) => item.status === "review").length, "bg-[#fff0f3] text-[#d91d46]"],
            ["오늘 처리", items.filter((item) => item.status === "resolved" && new Date(item.updatedAt).toDateString() === new Date().toDateString()).length, "bg-[#e8fffe] text-[#087b77]"],
            ["신고 대기", openItems.filter((item) => item.category === "report").length, "bg-[#fff6dc] text-[#9a6200]"],
          ].map(([label, count, className]) => <div className={`rounded-2xl p-4 sm:p-5 ${className}`} key={String(label)}><p className="text-xs font-bold opacity-65">{label}</p><p className="mt-2 text-3xl font-black tracking-[-0.04em]">{count}</p></div>)}
        </section>

        <nav className="hide-scrollbar -mx-4 mt-8 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0" aria-label="관리 항목">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const selected = activeTab === tab.id;
            return <button aria-current={selected ? "page" : undefined} className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-xs font-black transition ${selected ? "bg-black text-white" : "border border-black/5 bg-white text-black/50 hover:border-black/20 hover:text-black"}`} key={tab.id} onClick={() => setActiveTab(tab.id)} type="button"><Icon className="size-3.5" />{tab.label}<span className={`rounded-full px-1.5 py-0.5 text-[0.62rem] ${selected ? "bg-white/20" : "bg-black/5"}`}>{countFor(tab.id)}</span></button>;
          })}
        </nav>

        {error && <p className="mt-4 flex items-center gap-2 rounded-xl bg-[#fff0f3] px-4 py-3 text-xs font-bold text-[#d91d46]"><AlertTriangle className="size-4" />{error}</p>}

        {activeTab === "dictionary" ? (
          <DictionaryManager categories={categories} items={memes} onChange={setMemes} />
        ) : activeTab === "categories" ? (
          <CategoryManager items={categories} onChange={setCategories} />
        ) : activeTab === "quiz_logs" ? (
          <section className="space-y-6">
            {/* 요약 카드 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-3xl border border-black/5 p-5 shadow-[0_8px_28px_rgba(0,0,0,0.04)]">
                <p className="text-xs font-bold text-black/40">총 플레이 로그 수</p>
                <p className="mt-2 text-2xl font-black">{quizStats.total}건</p>
              </div>
              <div className="bg-white rounded-3xl border border-black/5 p-5 shadow-[0_8px_28px_rgba(0,0,0,0.04)]">
                <p className="text-xs font-bold text-[#fe2c55]">마이너 밈 인지도 (KNOW)</p>
                <p className="mt-2 text-2xl font-black">
                  {quizStats.stats.minor.total > 0 
                    ? `${Math.round((quizStats.stats.minor.know / quizStats.stats.minor.total) * 100)}%` 
                    : "0%"}
                  <span className="text-xs font-medium text-black/35 ml-1">({quizStats.stats.minor.know}/{quizStats.stats.minor.total})</span>
                </p>
              </div>
              <div className="bg-white rounded-3xl border border-black/5 p-5 shadow-[0_8px_28px_rgba(0,0,0,0.04)]">
                <p className="text-xs font-bold text-[#087b77]">원조 챌린지 인지도 (KNOW)</p>
                <p className="mt-2 text-2xl font-black">
                  {quizStats.stats.origin.total > 0 
                    ? `${Math.round((quizStats.stats.origin.know / quizStats.stats.origin.total) * 100)}%` 
                    : "0%"}
                  <span className="text-xs font-medium text-black/35 ml-1">({quizStats.stats.origin.know}/{quizStats.stats.origin.total})</span>
                </p>
              </div>
            </div>

            {/* 조작 패널 */}
            <div className="flex justify-between items-center bg-white rounded-3xl border border-black/5 p-5 shadow-[0_8px_28px_rgba(0,0,0,0.04)]">
              <div>
                <h3 className="font-extrabold text-sm text-neutral-900">원시 매치 로그 목록</h3>
                <p className="text-xs text-black/35 mt-0.5">사용자들의 스와이프 행위 로그 원시 데이터 목록입니다.</p>
              </div>
              <button 
                onClick={downloadCSV}
                className="flex items-center gap-1.5 rounded-full bg-black px-4 py-2.5 text-xs font-black text-white hover:bg-neutral-800 transition"
              >
                <Download className="size-3.5" /> 로그 CSV 저장
              </button>
            </div>

            {/* 로그 테이블 */}
            <div className="bg-white rounded-3xl border border-black/5 shadow-[0_8px_28px_rgba(0,0,0,0.04)] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-neutral-50 border-b border-black/5 text-black/40 font-bold">
                      <th className="p-4 font-black">시간</th>
                      <th className="p-4 font-black">세션 ID</th>
                      <th className="p-4 font-black">카드 ID</th>
                      <th className="p-4 font-black">카드 종류</th>
                      <th className="p-4 font-black">반응</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5 font-semibold text-black/75">
                    {quizLogs.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-black/30 font-medium">적재된 로그가 없습니다.</td>
                      </tr>
                    ) : (
                      quizLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-neutral-50/50">
                          <td className="p-4 whitespace-nowrap text-black/40">{new Date(log.timestamp).toLocaleString("ko-KR")}</td>
                          <td className="p-4 font-mono select-all text-black/50">{log.sessionId}</td>
                          <td className="p-4 font-bold">{log.cardId}</td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                              log.cardType === "minor" 
                                ? "bg-rose-50 text-rose-600" 
                                : "bg-emerald-50 text-emerald-600"
                            }`}>
                              {log.cardType === "minor" ? "마이너 밈" : "원조 챌린지"}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`font-black ${
                              log.response === "know" 
                                ? "text-emerald-600" 
                                : log.response === "dont_know" 
                                ? "text-rose-500" 
                                : "text-amber-500"
                            }`}>
                              {log.response === "know" ? "KNOW" : log.response === "dont_know" ? "DONT_KNOW" : "VIEW_DETAIL"}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        ) : <section className="mt-4 space-y-3" aria-live="polite">
          {loading ? <div className="flex min-h-56 items-center justify-center rounded-3xl border border-black/5 bg-white"><LoaderCircle className="size-6 animate-spin text-black/25" /></div> : visibleItems.length === 0 ? <div className="flex min-h-64 flex-col items-center justify-center rounded-3xl border border-dashed border-black/10 bg-white px-6 text-center"><span className="flex size-12 items-center justify-center rounded-2xl bg-[#e8fffe] text-[#087b77]"><Check className="size-6" /></span><h2 className="mt-4 text-lg font-black">여기는 다 확인했어요</h2><p className="mt-1 text-sm leading-6 text-black/40">새로운 알림이 들어오면 이 탭에 바로 표시됩니다.</p></div> : visibleItems.map((item) => {
            const meta = categoryMeta[item.category];
            const updating = updatingId === item.id;
            return <article className="rounded-3xl border border-black/5 bg-white p-5 shadow-[0_8px_28px_rgba(0,0,0,0.04)] sm:p-6" key={item.id}>
              <div className="flex flex-wrap items-start justify-between gap-3"><div className="flex flex-wrap items-center gap-2"><span className={`rounded-full px-2.5 py-1 text-[0.68rem] font-black ${meta.className}`}>{meta.label}</span>{item.status === "review" && <span className="rounded-full bg-black px-2.5 py-1 text-[0.68rem] font-black text-white">최종 검토</span>}<span className="text-xs font-bold text-black/30">{relativeTime(item.updatedAt)}</span></div><span className="text-xs font-bold text-black/30">by {item.author}</span></div>
              <h2 className="mt-4 text-xl font-black tracking-[-0.035em]">{item.title}</h2>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-black/55">{item.description}</p>
              {item.sourceUrl && <a className="mt-3 inline-flex items-center gap-1.5 text-xs font-black text-[#fe2c55]" href={item.sourceUrl} rel="noreferrer" target="_blank">근거 링크 열기<ExternalLink className="size-3.5" /></a>}
              <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-black/5 pt-4">
                {item.status === "new" ? <><button className="flex items-center gap-1.5 rounded-full bg-black px-4 py-2.5 text-xs font-black text-white" disabled={updating} onClick={() => void updateStatus(item, "review")} type="button">검토로 보내기<ChevronRight className="size-3.5" /></button><button className="rounded-full bg-[#e8fffe] px-4 py-2.5 text-xs font-black text-[#087b77]" disabled={updating} onClick={() => void updateStatus(item, "resolved")} type="button">바로 처리 완료</button><button aria-label="반려" className="ml-auto rounded-full p-2.5 text-black/25 transition hover:bg-[#fff0f3] hover:text-[#d91d46]" disabled={updating} onClick={() => void updateStatus(item, "rejected")} type="button"><X className="size-4" /></button></> : <><button className="flex items-center gap-1.5 rounded-full bg-[#fe2c55] px-4 py-2.5 text-xs font-black text-white" disabled={updating} onClick={() => void updateStatus(item, "resolved")} type="button"><Check className="size-3.5" />최종 확정</button><button className="flex items-center gap-1.5 rounded-full bg-black/5 px-4 py-2.5 text-xs font-black text-black/55" disabled={updating} onClick={() => void updateStatus(item, "new")} type="button"><RotateCcw className="size-3.5" />되돌리기</button></>}
              </div>
            </article>;
          })}
        </section>}

        <footer className="mt-8 flex items-center justify-center gap-2 text-[0.68rem] font-bold text-black/25"><Lightbulb className="size-3.5" />상태는 저장되며, 정적 관리자 화면은 서버 메모리를 사용하지 않습니다.</footer>
      </div>
    </main>
  );
}

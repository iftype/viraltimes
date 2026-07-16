"use client";

import {
  Archive,
  Check,
  ExternalLink,
  FilePenLine,
  LoaderCircle,
  Plus,
  Save,
  X,
} from "lucide-react";
import { FormEvent, useState } from "react";

type Video = {
  id: string;
  platform: "youtube" | "tiktok" | "instagram" | "x" | "unknown";
  url: string;
  title: string;
  creator?: string;
  uploadedAt?: string;
  thumbnailUrl?: string;
  viewCountLabel?: string;
};

export type AdminMeme = {
  id: string;
  slug: string;
  title: string;
  kind: "challenge" | "video-meme" | "community-meme";
  thumbnailUrl: string;
  thumbnailFit?: "cover" | "contain";
  aliases: string[];
  summary: string;
  origin: {
    status: "verified" | "likely" | "needs-review";
    video: Video;
    summary: string;
    evidence: Array<{ title: string; detail: string; url?: string }>;
    lastReviewedAt: string;
  };
  timeline: Array<{
    id: string;
    dateLabel: string;
    title: string;
    description: string;
    sourceUrl?: string;
    sourceLabel?: string;
    kind: "origin" | "spread" | "variation" | "mainstream" | "remix";
  }>;
  trendingVideos: Video[];
  relatedVideos: Video[];
  tags: string[];
  accent: string;
  publicationStatus: "draft" | "published" | "archived";
  createdAt?: string;
  updatedAt?: string;
};

const apiBase = "/viral/api/v1";

const statusMeta = {
  draft: { label: "작성 중", className: "bg-[#fff6dc] text-[#9a6200]" },
  published: { label: "공개", className: "bg-[#e8fffe] text-[#087b77]" },
  archived: { label: "보관", className: "bg-black/5 text-black/40" },
};

async function readError(response: Response) {
  try {
    return ((await response.json()) as { error?: string }).error ?? "저장하지 못했습니다.";
  } catch {
    return "저장하지 못했습니다.";
  }
}

const csv = (value: FormDataEntryValue | null) =>
  String(value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

export function DictionaryManager({
  items,
  onChange,
}: {
  items: AdminMeme[];
  onChange: (items: AdminMeme[]) => void;
}) {
  const [editing, setEditing] = useState<AdminMeme | null>(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const formOpen = creating || Boolean(editing);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const slug = String(form.get("slug") ?? "").trim().toLowerCase();
    const sourceUrl = String(form.get("sourceUrl") ?? "").trim();
    const base = editing;
    const originVideo: Video = {
      ...(base?.origin.video ?? { id: `${slug}-origin` }),
      id: base?.origin.video.id ?? `${slug}-origin`,
      platform: String(form.get("originPlatform")) as Video["platform"],
      url: String(form.get("originUrl") ?? "").trim(),
      title: String(form.get("originTitle") ?? "").trim(),
      creator: String(form.get("originCreator") ?? "").trim() || undefined,
      uploadedAt: String(form.get("originDate") ?? "").trim() || undefined,
      thumbnailUrl: String(form.get("thumbnailUrl") ?? "").trim() || undefined,
    };
    const evidence = [
      {
        title: String(form.get("evidenceTitle") ?? "").trim() || "확인 근거",
        detail: String(form.get("evidenceDetail") ?? "").trim(),
        url: sourceUrl || undefined,
      },
      ...(base?.origin.evidence.slice(1) ?? []),
    ];
    const timeline = [
      {
        id: base?.timeline[0]?.id ?? `${slug}-timeline-1`,
        dateLabel: String(form.get("timelineDate") ?? "").trim(),
        title: String(form.get("timelineTitle") ?? "").trim(),
        description: String(form.get("timelineDescription") ?? "").trim(),
        sourceUrl: sourceUrl || undefined,
        sourceLabel: "관련 근거",
        kind: "origin" as const,
      },
      ...(base?.timeline.slice(1) ?? []),
    ].filter((item) => item.dateLabel && item.title && item.description);

    const payload: AdminMeme = {
      ...(base ?? ({} as AdminMeme)),
      id: base?.id ?? slug,
      slug,
      title: String(form.get("title") ?? "").trim(),
      kind: String(form.get("kind")) as AdminMeme["kind"],
      thumbnailUrl: String(form.get("thumbnailUrl") ?? "").trim(),
      thumbnailFit: "cover",
      aliases: csv(form.get("aliases")),
      summary: String(form.get("summary") ?? "").trim(),
      accent: String(form.get("accent") ?? "#fe2c55"),
      tags: csv(form.get("tags")),
      publicationStatus: String(form.get("publicationStatus")) as AdminMeme["publicationStatus"],
      origin: {
        status: String(form.get("originStatus")) as AdminMeme["origin"]["status"],
        video: originVideo,
        summary: String(form.get("originSummary") ?? "").trim(),
        evidence,
        lastReviewedAt: new Date().toISOString().slice(0, 10),
      },
      timeline,
      trendingVideos: base?.trendingVideos ?? [],
      relatedVideos: base?.relatedVideos ?? [],
    };

    try {
      const response = await fetch(
        editing ? `${apiBase}/admin/memes/${encodeURIComponent(editing.id)}` : `${apiBase}/admin/memes`,
        {
          method: editing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      if (!response.ok) throw new Error(await readError(response));
      const data = (await response.json()) as { item: AdminMeme };
      onChange(
        editing
          ? items.map((item) => (item.id === editing.id ? data.item : item))
          : [data.item, ...items],
      );
      setEditing(null);
      setCreating(false);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "저장하지 못했습니다.");
    } finally {
      setSaving(false);
    }
  }

  async function changeStatus(item: AdminMeme, publicationStatus: AdminMeme["publicationStatus"]) {
    setSaving(true);
    setError("");
    try {
      const response = await fetch(`${apiBase}/admin/memes/${encodeURIComponent(item.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...item, publicationStatus }),
      });
      if (!response.ok) throw new Error(await readError(response));
      const data = (await response.json()) as { item: AdminMeme };
      onChange(items.map((candidate) => (candidate.id === item.id ? data.item : candidate)));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "상태를 바꾸지 못했습니다.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="mt-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-black p-5 text-white sm:p-6">
        <div>
          <p className="text-xs font-black text-[#25f4ee]">LIVE DICTIONARY</p>
          <h2 className="mt-1 text-2xl font-black tracking-[-0.04em]">사전 항목 관리</h2>
          <p className="mt-1 text-xs leading-5 text-white/50">공개로 저장하면 클라이언트 재배포 없이 바로 반영됩니다.</p>
        </div>
        <button className="flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-xs font-black text-black" onClick={() => { setCreating(true); setEditing(null); setError(""); }} type="button"><Plus className="size-4" />새 항목</button>
      </div>

      {error && <p className="mt-3 rounded-xl bg-[#fff0f3] px-4 py-3 text-xs font-bold text-[#d91d46]">{error}</p>}

      {formOpen && (
        <form className="mt-4 rounded-3xl border border-black/5 bg-white p-5 shadow-sm sm:p-7" key={editing?.id ?? "new"} onSubmit={save}>
          <div className="flex items-center justify-between"><h3 className="text-lg font-black">{editing ? `${editing.title} 수정` : "새 사전 항목"}</h3><button className="rounded-full bg-black/5 p-2 text-black/40" onClick={() => { setCreating(false); setEditing(null); }} type="button" aria-label="닫기"><X className="size-4" /></button></div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field label="제목"><input name="title" required defaultValue={editing?.title} /></Field>
            <Field label="slug"><input name="slug" required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" placeholder="meme-slug" defaultValue={editing?.slug} /></Field>
            <Field label="종류"><select name="kind" defaultValue={editing?.kind ?? "community-meme"}><option value="community-meme">커뮤니티 밈</option><option value="video-meme">영상 밈</option><option value="challenge">챌린지</option></select></Field>
            <Field label="공개 상태"><select name="publicationStatus" defaultValue={editing?.publicationStatus ?? "draft"}><option value="draft">작성 중</option><option value="published">바로 공개</option><option value="archived">보관</option></select></Field>
            <Field label="별칭 · 쉼표 구분"><input name="aliases" defaultValue={editing?.aliases.join(", ")} /></Field>
            <Field label="카테고리 · 쉼표 구분"><input name="tags" required placeholder="인터넷 방송, 리그 오브 레전드" defaultValue={editing?.tags.join(", ")} /></Field>
            <Field label="한 줄 설명" wide><textarea name="summary" required defaultValue={editing?.summary} /></Field>
            <Field label="썸네일 URL" wide><input name="thumbnailUrl" type="url" required defaultValue={editing?.thumbnailUrl} /></Field>
            <Field label="포인트 색상"><input name="accent" type="color" defaultValue={editing?.accent ?? "#fe2c55"} /></Field>
            <Field label="원본 판단"><select name="originStatus" defaultValue={editing?.origin.status ?? "needs-review"}><option value="verified">출처 확인</option><option value="likely">유력</option><option value="needs-review">검토 필요</option></select></Field>
            <Field label="원본 플랫폼"><select name="originPlatform" defaultValue={editing?.origin.video.platform ?? "youtube"}><option value="youtube">YouTube</option><option value="tiktok">TikTok</option><option value="instagram">Instagram</option><option value="x">X</option><option value="unknown">기타</option></select></Field>
            <Field label="원본/대표 영상 URL"><input name="originUrl" type="url" required defaultValue={editing?.origin.video.url} /></Field>
            <Field label="영상 제목"><input name="originTitle" required defaultValue={editing?.origin.video.title} /></Field>
            <Field label="업로더"><input name="originCreator" defaultValue={editing?.origin.video.creator} /></Field>
            <Field label="업로드 날짜"><input name="originDate" placeholder="YYYY-MM-DD 또는 확인 중" defaultValue={editing?.origin.video.uploadedAt} /></Field>
            <Field label="원본 설명" wide><textarea name="originSummary" required defaultValue={editing?.origin.summary} /></Field>
            <Field label="근거 제목"><input name="evidenceTitle" required defaultValue={editing?.origin.evidence[0]?.title} /></Field>
            <Field label="근거 링크"><input name="sourceUrl" type="url" defaultValue={editing?.origin.evidence[0]?.url ?? editing?.timeline[0]?.sourceUrl} /></Field>
            <Field label="근거 설명" wide><textarea name="evidenceDetail" required defaultValue={editing?.origin.evidence[0]?.detail} /></Field>
            <Field label="타임라인 시점"><input name="timelineDate" placeholder="2026. 02" defaultValue={editing?.timeline[0]?.dateLabel} /></Field>
            <Field label="타임라인 제목"><input name="timelineTitle" defaultValue={editing?.timeline[0]?.title} /></Field>
            <Field label="타임라인 설명" wide><textarea name="timelineDescription" defaultValue={editing?.timeline[0]?.description} /></Field>
          </div>
          <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-[#fe2c55] px-5 py-3.5 text-sm font-black text-white" disabled={saving} type="submit">{saving ? <LoaderCircle className="size-4 animate-spin" /> : <Save className="size-4" />}{saving ? "저장 중" : "사전 항목 저장"}</button>
        </form>
      )}

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {items.map((item) => {
          const meta = statusMeta[item.publicationStatus];
          return <article className="rounded-2xl border border-black/5 bg-white p-5" key={item.id}>
            <div className="flex items-start justify-between gap-3"><div><span className={`rounded-full px-2.5 py-1 text-[0.68rem] font-black ${meta.className}`}>{meta.label}</span><h3 className="mt-3 text-xl font-black">{item.title}</h3><p className="mt-1 text-xs font-bold text-black/30">/{item.slug} · {item.tags.join(" · ")}</p></div>{item.publicationStatus === "published" && <a className="rounded-full bg-black/5 p-2 text-black/40" href={`https://viralorigin.vercel.app/meme?slug=${encodeURIComponent(item.slug)}`} target="_blank" rel="noreferrer" aria-label="공개 페이지 열기"><ExternalLink className="size-4" /></a>}</div>
            <p className="mt-3 line-clamp-2 text-sm leading-6 text-black/50">{item.summary}</p>
            <div className="mt-4 flex flex-wrap gap-2 border-t border-black/5 pt-4"><button className="flex items-center gap-1.5 rounded-full bg-black px-3 py-2 text-xs font-black text-white" onClick={() => { setEditing(item); setCreating(false); setError(""); }} type="button"><FilePenLine className="size-3.5" />수정</button>{item.publicationStatus !== "published" && <button className="flex items-center gap-1.5 rounded-full bg-[#e8fffe] px-3 py-2 text-xs font-black text-[#087b77]" disabled={saving} onClick={() => void changeStatus(item, "published")} type="button"><Check className="size-3.5" />공개</button>}{item.publicationStatus !== "archived" && <button className="ml-auto flex items-center gap-1.5 rounded-full bg-black/5 px-3 py-2 text-xs font-black text-black/40" disabled={saving} onClick={() => void changeStatus(item, "archived")} type="button"><Archive className="size-3.5" />보관</button>}</div>
          </article>;
        })}
      </div>
    </section>
  );
}

function Field({ label, wide = false, children }: { label: string; wide?: boolean; children: React.ReactNode }) {
  return <label className={`block text-xs font-black text-black/55 ${wide ? "sm:col-span-2" : ""}`}>{label}<span className="mt-2 block [&_input]:w-full [&_input]:rounded-xl [&_input]:border [&_input]:border-black/10 [&_input]:bg-[#f7f7f8] [&_input]:px-4 [&_input]:py-3 [&_input]:font-medium [&_input]:outline-none [&_select]:w-full [&_select]:rounded-xl [&_select]:border [&_select]:border-black/10 [&_select]:bg-[#f7f7f8] [&_select]:px-4 [&_select]:py-3 [&_textarea]:min-h-24 [&_textarea]:w-full [&_textarea]:resize-y [&_textarea]:rounded-xl [&_textarea]:border [&_textarea]:border-black/10 [&_textarea]:bg-[#f7f7f8] [&_textarea]:px-4 [&_textarea]:py-3 [&_textarea]:font-medium [&_textarea]:leading-6 [&_textarea]:outline-none">{children}</span></label>;
}

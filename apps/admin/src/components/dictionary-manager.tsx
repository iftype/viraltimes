"use client";

import {
  Archive,
  Check,
  ExternalLink,
  FilePenLine,
  Filter,
  LoaderCircle,
  Plus,
  Save,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { FormEvent, useMemo, useRef, useState } from "react";
import { Field } from "@origin/ui";

import type { AdminCategory } from "@/components/category-manager";

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

type SourceLink = { id: string; title: string; url: string; siteName?: string };

export type AdminMeme = {
  id: string;
  slug: string;
  title: string;
  kind: "challenge" | "video-meme" | "community-meme" | "minor-meme";
  thumbnailUrl?: string;
  thumbnailFit?: "cover" | "contain";
  aliases: string[];
  summary: string;
  origin: {
    status: "verified" | "likely" | "needs-review";
    video?: Video;
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
  relatedMemeIds?: string[];
  sourceLinks?: SourceLink[];
  lifecycle?: { originYear?: number; firstSeenAt?: string; lastObservedAt?: string };
  categoryIds: string[];
  tags: string[];
  accent: string;
  publicationStatus: "draft" | "published" | "archived";
  createdAt?: string;
  updatedAt?: string;
};

type BulkAction = "publish" | "draft" | "archive" | "add-category" | "remove-category";
type MetadataSuggestion = {
  title?: string;
  description?: string;
  thumbnailUrl?: string;
  siteName?: string;
  sourceUrl: string;
  provider: "youtube-oembed" | "open-graph" | "url-only";
  ai: { used: boolean; reason?: string };
};

const apiBase = "/viral/api/v1";
const statusMeta = {
  draft: { label: "작성 중", className: "bg-[#fff6dc] text-[#9a6200]" },
  published: { label: "공개", className: "bg-[#e8fffe] text-[#087b77]" },
  archived: { label: "보관", className: "bg-black/5 text-black/40" },
};
const kindLabels: Record<AdminMeme["kind"], string> = {
  challenge: "챌린지",
  "video-meme": "영상 밈",
  "community-meme": "커뮤니티 밈",
  "minor-meme": "코리아 마이너 밈",
};

async function readError(response: Response) {
  try {
    return ((await response.json()) as { error?: string }).error ?? "요청을 처리하지 못했습니다.";
  } catch {
    return "요청을 처리하지 못했습니다.";
  }
}

const csv = (value: FormDataEntryValue | null) =>
  String(value ?? "").split(",").map((item) => item.trim()).filter(Boolean);

const sourceLines = (value: FormDataEntryValue | null, slug: string): SourceLink[] =>
  String(value ?? "").split("\n").map((line) => line.trim()).filter(Boolean).flatMap((line, index) => {
    const separator = line.indexOf("|");
    const title = separator >= 0 ? line.slice(0, separator).trim() : "관련 커뮤니티 링크";
    const url = (separator >= 0 ? line.slice(separator + 1) : line).trim();
    return url ? [{ id: `${slug}-source-${index + 1}`, title: title || "관련 커뮤니티 링크", url }] : [];
  });

const platformForUrl = (url: string): Video["platform"] => url.includes("youtu") ? "youtube" : url.includes("tiktok.com") ? "tiktok" : url.includes("instagram.com") ? "instagram" : url.includes("x.com") || url.includes("twitter.com") ? "x" : "unknown";
const usageLines = (value: FormDataEntryValue | null, slug: string, existing: Video[]): Video[] => String(value ?? "").split("\n").map((line) => line.trim()).filter(Boolean).flatMap((line, index) => {
  const [title, url, thumbnailUrl] = line.split("|").map((part) => part.trim());
  if (!url) return [];
  const previous = existing.find((video) => video.url === url);
  return [{ ...previous, id: previous?.id ?? `${slug}-usage-${index + 1}`, platform: platformForUrl(url), title: title || "사용 자료", url, thumbnailUrl: thumbnailUrl || previous?.thumbnailUrl }];
}).slice(0, 3);

export function DictionaryManager({
  items,
  categories,
  onChange,
}: {
  items: AdminMeme[];
  categories: AdminCategory[];
  onChange: (items: AdminMeme[]) => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [editing, setEditing] = useState<AdminMeme | null>(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [enriching, setEnriching] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | AdminMeme["publicationStatus"]>("all");
  const [kindFilter, setKindFilter] = useState<"all" | AdminMeme["kind"]>("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<BulkAction>("publish");
  const [bulkCategoryId, setBulkCategoryId] = useState(categories[0]?.id ?? "");
  const [draftSlug, setDraftSlug] = useState("");

  const formOpen = creating || Boolean(editing);
  const visibleItems = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("ko");
    return items.filter((item) => {
      if (statusFilter !== "all" && item.publicationStatus !== statusFilter) return false;
      if (kindFilter !== "all" && item.kind !== kindFilter) return false;
      return !needle || [item.title, item.slug, ...item.aliases, ...item.tags].join(" ").toLocaleLowerCase("ko").includes(needle);
    });
  }, [items, kindFilter, query, statusFilter]);
  const allVisibleSelected = visibleItems.length > 0 && visibleItems.every((item) => selectedIds.has(item.id));

  function closeForm() {
    setCreating(false);
    setEditing(null);
    setError("");
    setNotice("");
  }

  function openCreate() {
    setDraftSlug(`meme-${Date.now().toString(36)}`);
    setCreating(true);
    setEditing(null);
    setError("");
    setNotice("");
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    const form = new FormData(event.currentTarget);
    const slug = String(form.get("slug") ?? "").trim().toLowerCase();
    const sourceUrl = String(form.get("sourceUrl") ?? "").trim();
    const originUrl = String(form.get("originUrl") ?? "").trim();
    const originTitle = String(form.get("originTitle") ?? "").trim();
    const base = editing;
    const originVideo = originUrl && originTitle ? {
      ...(base?.origin.video ?? { id: `${slug}-origin` }),
      id: base?.origin.video?.id ?? `${slug}-origin`,
      platform: String(form.get("originPlatform")) as Video["platform"],
      url: originUrl,
      title: originTitle,
      creator: String(form.get("originCreator") ?? "").trim() || undefined,
      uploadedAt: String(form.get("originDate") ?? "").trim() || undefined,
      thumbnailUrl: String(form.get("thumbnailUrl") ?? "").trim() || undefined,
    } : undefined;
    const evidenceTitle = String(form.get("evidenceTitle") ?? "").trim();
    const evidenceDetail = String(form.get("evidenceDetail") ?? "").trim();
    const firstEvidence = evidenceTitle && evidenceDetail
      ? [{ title: evidenceTitle, detail: evidenceDetail, url: sourceUrl || undefined }]
      : [];
    const timelineDate = String(form.get("timelineDate") ?? "").trim();
    const timelineTitle = String(form.get("timelineTitle") ?? "").trim();
    const timelineDescription = String(form.get("timelineDescription") ?? "").trim();
    const firstTimeline = timelineDate && timelineTitle && timelineDescription ? [{
      id: base?.timeline[0]?.id ?? `${slug}-timeline-1`,
      dateLabel: timelineDate,
      title: timelineTitle,
      description: timelineDescription,
      sourceUrl: sourceUrl || undefined,
      sourceLabel: "관련 근거",
      kind: "origin" as const,
    }] : [];

    const payload: AdminMeme = {
      ...(base ?? ({} as AdminMeme)),
      id: base?.id ?? slug,
      slug,
      title: String(form.get("title") ?? "").trim(),
      kind: String(form.get("kind")) as AdminMeme["kind"],
      thumbnailUrl: String(form.get("thumbnailUrl") ?? "").trim() || undefined,
      thumbnailFit: "cover",
      aliases: csv(form.get("aliases")),
      summary: String(form.get("summary") ?? "").trim(),
      accent: String(form.get("accent") ?? "#fe2c55"),
      categoryIds: form.getAll("categoryIds").map(String),
      tags: csv(form.get("tags")),
      publicationStatus: String(form.get("publicationStatus")) as AdminMeme["publicationStatus"],
      origin: {
        status: String(form.get("originStatus")) as AdminMeme["origin"]["status"],
        video: originVideo,
        summary: String(form.get("originSummary") ?? "").trim(),
        evidence: [...firstEvidence, ...(base?.origin.evidence.slice(1) ?? [])],
        lastReviewedAt: new Date().toISOString().slice(0, 10),
      },
      timeline: [...firstTimeline, ...(base?.timeline.slice(1) ?? [])],
      trendingVideos: usageLines(form.get("usageMaterials"), slug, base?.trendingVideos ?? []),
      relatedVideos: base?.relatedVideos ?? [],
      relatedMemeIds: form.getAll("relatedMemeIds").map(String).filter((id) => id !== (base?.id ?? slug)),
      sourceLinks: sourceLines(form.get("sourceLinks"), slug),
      lifecycle: {
        originYear: Number(form.get("originYear")) || undefined,
        firstSeenAt: String(form.get("firstSeenAt") ?? "").trim() || undefined,
        lastObservedAt: String(form.get("lastObservedAt") ?? "").trim() || undefined,
      },
    };

    try {
      const response = await fetch(editing ? `${apiBase}/admin/memes/${encodeURIComponent(editing.id)}` : `${apiBase}/admin/memes`, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(await readError(response));
      const data = (await response.json()) as { item: AdminMeme };
      onChange(editing ? items.map((item) => item.id === editing.id ? data.item : item) : [data.item, ...items]);
      closeForm();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "저장하지 못했습니다.");
    } finally {
      setSaving(false);
    }
  }

  async function enrichFromUrl() {
    const form = formRef.current;
    const sourceInput = form?.elements.namedItem("metadataUrl") as HTMLInputElement | null;
    if (!form || !sourceInput?.value.trim()) {
      setError("자동 채우기에 사용할 커뮤니티 또는 영상 링크를 입력해 주세요.");
      return;
    }
    setEnriching(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch(`${apiBase}/admin/metadata/preview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: sourceInput.value.trim() }),
      });
      if (!response.ok) throw new Error(await readError(response));
      const { suggestion } = (await response.json()) as { suggestion: MetadataSuggestion };
      const setIfEmpty = (name: string, value?: string) => {
        const control = form.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement | null;
        if (control && !control.value.trim() && value) control.value = value;
      };
      setIfEmpty("title", suggestion.title);
      setIfEmpty("summary", suggestion.description);
      setIfEmpty("thumbnailUrl", suggestion.thumbnailUrl);
      setIfEmpty("sourceLinks", `${suggestion.title ?? suggestion.siteName ?? "관련 링크"} | ${suggestion.sourceUrl}`);
      setNotice(`${suggestion.provider === "youtube-oembed" ? "YouTube" : "링크"} 정보를 불러왔습니다.${suggestion.ai.used ? " Gemma가 설명을 다듬었습니다." : " 설명은 직접 확인해 주세요."}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "링크 정보를 불러오지 못했습니다.");
    } finally {
      setEnriching(false);
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
      onChange(items.map((candidate) => candidate.id === item.id ? data.item : candidate));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "상태를 바꾸지 못했습니다.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteItem(item: AdminMeme) {
    if (item.publicationStatus === "published" && !confirm(`공개 중인 "${item.title}" 항목을 완전히 삭제하시겠습니까?`)) return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch(`${apiBase}/admin/memes/${encodeURIComponent(item.id)}`, { method: "DELETE" });
      if (!response.ok) throw new Error(await readError(response));
      onChange(items.filter((candidate) => candidate.id !== item.id));
      setSelectedIds((current) => { const next = new Set(current); next.delete(item.id); return next; });
      setNotice(`"${item.title}" 항목을 삭제했습니다.`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "삭제하지 못했습니다.");
    } finally {
      setSaving(false);
    }
  }

  async function runBulkAction() {
    const ids = [...selectedIds];
    if (!ids.length) return;
    const payload = bulkAction === "publish" || bulkAction === "draft" || bulkAction === "archive"
      ? { ids, action: "status", publicationStatus: bulkAction === "publish" ? "published" : bulkAction }
      : { ids, action: bulkAction, categoryId: bulkCategoryId };
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch(`${apiBase}/admin/memes/bulk`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(await readError(response));
      const data = (await response.json()) as { items: AdminMeme[]; deletedIds: string[]; missingIds: string[] };
      const updatedById = new Map(data.items.map((item) => [item.id, item]));
      const deleted = new Set(data.deletedIds);
      onChange(items.filter((item) => !deleted.has(item.id)).map((item) => updatedById.get(item.id) ?? item));
      setSelectedIds(new Set());
      setNotice(`${ids.length - data.missingIds.length}개 항목을 한 번에 처리했습니다.`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "일괄 작업을 처리하지 못했습니다.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteSelected() {
    const ids = [...selectedIds];
    if (!ids.length) return;
    const publishedCount = items.filter((item) => selectedIds.has(item.id) && item.publicationStatus === "published").length;
    if (publishedCount > 0 && !confirm(`선택한 ${ids.length}개 중 공개 항목 ${publishedCount}개가 포함되어 있습니다. 완전히 삭제하시겠습니까?`)) return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch(`${apiBase}/admin/memes/bulk`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids, action: "delete" }),
      });
      if (!response.ok) throw new Error(await readError(response));
      const data = (await response.json()) as { deletedIds: string[]; missingIds: string[] };
      const deleted = new Set(data.deletedIds);
      onChange(items.filter((item) => !deleted.has(item.id)));
      setSelectedIds(new Set());
      setNotice(`${data.deletedIds.length}개 항목을 삭제했습니다.`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "선택 항목을 삭제하지 못했습니다.");
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
          <p className="mt-1 text-xs leading-5 text-white/50">수정·삭제·공개 상태·카테고리를 목록에서 한 번에 관리합니다.</p>
        </div>
        <button className="flex cursor-pointer items-center gap-2 rounded-full bg-white px-4 py-2.5 text-xs font-black text-black" onClick={openCreate} type="button"><Plus className="size-4" />새 항목</button>
      </div>

      {error && <p className="mt-3 rounded-xl bg-[#fff0f3] px-4 py-3 text-xs font-bold text-[#d91d46]">{error}</p>}
      {notice && <p className="mt-3 rounded-xl bg-[#e8fffe] px-4 py-3 text-xs font-bold text-[#087b77]">{notice}</p>}

      {formOpen && (
        <form className="mt-4 rounded-3xl border border-black/5 bg-white p-5 shadow-sm sm:p-7" key={editing?.id ?? "new"} onSubmit={save} ref={formRef}>
          <div className="flex items-center justify-between"><h3 className="text-lg font-black">{editing ? `${editing.title} 수정` : "새 사전 항목"}</h3><button className="cursor-pointer rounded-full bg-black/5 p-2 text-black/40" onClick={closeForm} type="button" aria-label="편집 닫기"><X className="size-4" /></button></div>
          <div className="mt-5 rounded-2xl bg-[#f7f7f8] p-4">
            <label className="text-xs font-black text-black/50" htmlFor="metadata-url">커뮤니티·영상 링크로 자동 채우기</label>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <input className="min-w-0 flex-1 rounded-xl border border-black/10 bg-white px-3 py-3 text-base outline-none" id="metadata-url" name="metadataUrl" placeholder="https://..." type="url" />
              <button className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-black px-4 py-3 text-xs font-black text-white" disabled={enriching} onClick={() => void enrichFromUrl()} type="button">{enriching ? <LoaderCircle className="size-4 animate-spin" /> : <Sparkles className="size-4" />}{enriching ? "분석 중" : "정보 가져오기"}</button>
            </div>
            <p className="mt-2 text-[0.68rem] leading-5 text-black/35">썸네일은 oEmbed/Open Graph에서 먼저 가져오고, 서버에 Gemma 키가 있으면 설명 초안만 다듬습니다. 저장 전 반드시 확인하세요.</p>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field label="제목"><input name="title" required defaultValue={editing?.title} /></Field>
            <Field label="slug"><input name="slug" required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" placeholder="meme-slug" defaultValue={editing?.slug ?? draftSlug} /></Field>
            <Field label="종류"><select name="kind" defaultValue={editing?.kind ?? "minor-meme"}><option value="minor-meme">코리아 마이너 밈</option><option value="community-meme">커뮤니티 밈</option><option value="video-meme">영상 밈</option><option value="challenge">챌린지</option></select></Field>
            <Field label="공개 상태"><select name="publicationStatus" defaultValue={editing?.publicationStatus ?? "draft"}><option value="draft">작성 중</option><option value="published">바로 공개</option><option value="archived">보관</option></select></Field>
            <Field label="별칭 · 쉼표 구분"><input name="aliases" defaultValue={editing?.aliases.join(", ")} /></Field>
            <Field label="태그 · 작은 검색 키워드"><input name="tags" placeholder="유행어, 디시, 2026" defaultValue={editing?.tags.join(", ")} /></Field>
            <Field label="카테고리" wide><div className="grid gap-2 rounded-2xl bg-[#f7f7f8] p-3 sm:grid-cols-2">{categories.filter((category) => category.isActive || editing?.categoryIds.includes(category.id)).map((category) => <label className="flex cursor-pointer items-center gap-2 rounded-xl bg-white px-3 py-2.5 text-sm font-bold" key={category.id}><input className="size-4 accent-black" defaultChecked={editing ? editing.categoryIds.includes(category.id) : category.slug === "korea-minor-meme"} name="categoryIds" type="checkbox" value={category.id} />{category.label}</label>)}</div></Field>
            <Field label="연결·파생 밈" wide><div className="grid max-h-52 gap-2 overflow-y-auto rounded-2xl bg-[#f7f7f8] p-3 sm:grid-cols-2">{items.filter((item) => item.id !== editing?.id).map((item) => <label className="flex cursor-pointer items-center gap-2 rounded-xl bg-white px-3 py-2.5 text-sm font-bold" key={item.id}><input className="size-4 accent-black" defaultChecked={editing?.relatedMemeIds?.includes(item.id)} name="relatedMemeIds" type="checkbox" value={item.id} /><span className="min-w-0 truncate">{item.title}</span></label>)}{items.filter((item) => item.id !== editing?.id).length === 0 && <p className="text-xs font-bold text-black/35">연결할 다른 밈이 없습니다.</p>}</div></Field>
            <Field label="한 줄 설명 · 선택" wide><textarea name="summary" placeholder="비워도 저장할 수 있으며 나중에 제안이나 AI 초안으로 보완할 수 있습니다." defaultValue={editing?.summary} /></Field>
            <Field label="관련 커뮤니티 링크 · 한 줄에 하나" wide><textarea name="sourceLinks" placeholder={'링크 제목 | https://example.com/post\nhttps://example.com/another'} defaultValue={(editing?.sourceLinks ?? []).map((link) => `${link.title} | ${link.url}`).join("\n")} /></Field>
            <Field label="사용 영상·자료 TOP 3 · 제목 | 링크 | 썸네일 URL" wide><textarea name="usageMaterials" placeholder={'대표 사용 영상 | https://youtube.com/...\n커뮤니티 게시글 | https://example.com/post | https://example.com/screenshot.jpg'} defaultValue={(editing?.trendingVideos ?? []).slice(0, 3).map((video) => `${video.title} | ${video.url}${video.thumbnailUrl ? ` | ${video.thumbnailUrl}` : ""}`).join("\n")} /></Field>
            <Field label="썸네일 URL · 선택" wide><input name="thumbnailUrl" type="url" placeholder="비우면 YouTube 또는 링크 메타데이터 후보를 사용합니다" defaultValue={editing?.thumbnailUrl} /></Field>
            <Field label="포인트 색상"><input name="accent" type="color" defaultValue={editing?.accent ?? "#fe2c55"} /></Field>
            <Field label="원본 판단"><select name="originStatus" defaultValue={editing?.origin.status ?? "needs-review"}><option value="verified">출처 확인</option><option value="likely">유력</option><option value="needs-review">검토 필요</option></select></Field>
          </div>
          <details className="mt-5 rounded-2xl border border-black/5 bg-[#fafafa] p-4">
            <summary className="cursor-pointer text-sm font-black">원본·근거·타임라인 고급 편집</summary>
            <p className="mt-2 text-xs leading-5 text-black/40">마이너 밈은 원본 영상과 타임라인을 비워도 됩니다.</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="유행 시작 연도"><input name="originYear" type="number" min="1900" max={new Date().getFullYear() + 1} placeholder="2026" defaultValue={editing?.lifecycle?.originYear} /></Field>
              <Field label="최초 확인일"><input name="firstSeenAt" type="date" defaultValue={editing?.lifecycle?.firstSeenAt} /></Field>
              <Field label="최근 사용 확인일"><input name="lastObservedAt" type="date" defaultValue={editing?.lifecycle?.lastObservedAt} /></Field>
              <Field label="원본 플랫폼"><select name="originPlatform" defaultValue={editing?.origin.video?.platform ?? "unknown"}><option value="unknown">기타·없음</option><option value="youtube">YouTube</option><option value="tiktok">TikTok</option><option value="instagram">Instagram</option><option value="x">X</option></select></Field>
              <Field label="원본/대표 영상 URL"><input name="originUrl" type="url" defaultValue={editing?.origin.video?.url} /></Field>
              <Field label="영상 제목"><input name="originTitle" defaultValue={editing?.origin.video?.title} /></Field>
              <Field label="업로더"><input name="originCreator" defaultValue={editing?.origin.video?.creator} /></Field>
              <Field label="업로드 날짜"><input name="originDate" placeholder="YYYY-MM-DD 또는 확인 중" defaultValue={editing?.origin.video?.uploadedAt} /></Field>
              <Field label="원본 설명 · 선택" wide><textarea name="originSummary" defaultValue={editing?.origin.summary} /></Field>
              <Field label="근거 제목"><input name="evidenceTitle" defaultValue={editing?.origin.evidence[0]?.title} /></Field>
              <Field label="근거 링크"><input name="sourceUrl" type="url" defaultValue={editing?.origin.evidence[0]?.url ?? editing?.timeline[0]?.sourceUrl} /></Field>
              <Field label="근거 설명" wide><textarea name="evidenceDetail" defaultValue={editing?.origin.evidence[0]?.detail} /></Field>
              <Field label="타임라인 시점"><input name="timelineDate" placeholder="2026. 02" defaultValue={editing?.timeline[0]?.dateLabel} /></Field>
              <Field label="타임라인 제목"><input name="timelineTitle" defaultValue={editing?.timeline[0]?.title} /></Field>
              <Field label="타임라인 설명" wide><textarea name="timelineDescription" defaultValue={editing?.timeline[0]?.description} /></Field>
            </div>
          </details>
          <button className="mt-5 flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#fe2c55] px-5 py-3.5 text-sm font-black text-white" disabled={saving} type="submit">{saving ? <LoaderCircle className="size-4 animate-spin" /> : <Save className="size-4" />}{saving ? "저장 중" : "사전 항목 저장"}</button>
        </form>
      )}

      <div className="mt-4 rounded-3xl border border-black/5 bg-white p-4 sm:p-5">
        <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_auto_auto]">
          <label className="relative"><span className="sr-only">사전 항목 검색</span><Filter className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-black/30" /><input className="w-full rounded-xl bg-[#f7f7f8] py-3 pl-9 pr-3 text-base outline-none" onChange={(event) => setQuery(event.target.value)} placeholder="제목·slug·태그 검색" value={query} /></label>
          <select aria-label="공개 상태 필터" className="cursor-pointer rounded-xl bg-[#f7f7f8] px-3 py-3 text-sm font-bold" onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)} value={statusFilter}><option value="all">모든 상태</option><option value="published">공개</option><option value="draft">작성 중</option><option value="archived">보관</option></select>
          <select aria-label="종류 필터" className="cursor-pointer rounded-xl bg-[#f7f7f8] px-3 py-3 text-sm font-bold" onChange={(event) => setKindFilter(event.target.value as typeof kindFilter)} value={kindFilter}><option value="all">모든 종류</option>{Object.entries(kindLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-black/5 pt-3">
          <label className="flex cursor-pointer items-center gap-2 text-xs font-black"><input checked={allVisibleSelected} className="size-4 accent-black" onChange={() => setSelectedIds((current) => { const next = new Set(current); visibleItems.forEach((item) => allVisibleSelected ? next.delete(item.id) : next.add(item.id)); return next; })} type="checkbox" />현재 목록 전체 선택</label>
          <span className="text-xs font-bold text-black/35">{selectedIds.size}개 선택</span>
          <div className="ml-auto flex flex-wrap gap-2">
            {selectedIds.size > 0 && <button className="cursor-pointer rounded-xl px-3 py-2 text-xs font-black text-black/40 hover:bg-black/5" onClick={() => setSelectedIds(new Set())} type="button">선택 해제</button>}
            <select aria-label="일괄 작업" className="cursor-pointer rounded-xl bg-[#f7f7f8] px-3 py-2 text-xs font-black" onChange={(event) => setBulkAction(event.target.value as BulkAction)} value={bulkAction}><option value="publish">공개</option><option value="draft">작성 중</option><option value="archive">보관</option><option value="add-category">카테고리 추가</option><option value="remove-category">카테고리 제거</option></select>
            {(bulkAction === "add-category" || bulkAction === "remove-category") && <select aria-label="일괄 카테고리" className="cursor-pointer rounded-xl bg-[#f7f7f8] px-3 py-2 text-xs font-black" onChange={(event) => setBulkCategoryId(event.target.value)} value={bulkCategoryId}>{categories.map((category) => <option key={category.id} value={category.id}>{category.label}</option>)}</select>}
            <button className="cursor-pointer rounded-xl bg-black px-4 py-2 text-xs font-black text-white disabled:cursor-not-allowed disabled:opacity-35" disabled={!selectedIds.size || saving || ((bulkAction === "add-category" || bulkAction === "remove-category") && !bulkCategoryId)} onClick={() => void runBulkAction()} type="button">선택 항목 적용</button>
            <button className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-[#fff0f3] px-4 py-2 text-xs font-black text-[#d91d46] disabled:cursor-not-allowed disabled:opacity-35" disabled={!selectedIds.size || saving} onClick={() => void deleteSelected()} type="button"><Trash2 className="size-3.5" />선택 삭제</button>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {visibleItems.map((item) => {
          const meta = statusMeta[item.publicationStatus];
          return <article className={`rounded-2xl border bg-white p-5 ${selectedIds.has(item.id) ? "border-[#fe2c55] ring-2 ring-[#fe2c55]/10" : "border-black/5"}`} key={item.id}>
            <div className="flex items-start gap-3"><input aria-label={`${item.title} 선택`} checked={selectedIds.has(item.id)} className="mt-1 size-4 cursor-pointer accent-[#fe2c55]" onChange={() => setSelectedIds((current) => { const next = new Set(current); if (next.has(item.id)) next.delete(item.id); else next.add(item.id); return next; })} type="checkbox" /><div className="min-w-0 flex-1"><div className="flex flex-wrap gap-1.5"><span className={`rounded-full px-2.5 py-1 text-[0.68rem] font-black ${meta.className}`}>{meta.label}</span><span className="rounded-full bg-black/5 px-2.5 py-1 text-[0.68rem] font-black text-black/50">{kindLabels[item.kind]}</span></div><h3 className="mt-3 truncate text-xl font-black">{item.title}</h3><p className="mt-1 text-xs font-bold text-black/30">/{item.slug} · {item.lifecycle?.originYear ? `${item.lifecycle.originYear}년 · ` : ""}{item.categoryIds.map((id) => categories.find((category) => category.id === id)?.label).filter(Boolean).join(" · ")}</p></div>{item.publicationStatus === "published" && <a className="cursor-pointer rounded-full bg-black/5 p-2 text-black/40" href={`https://viralorigin.vercel.app/memes/${encodeURIComponent(item.slug)}`} target="_blank" rel="noreferrer" aria-label={`${item.title} 공개 페이지 열기`}><ExternalLink className="size-4" /></a>}</div>
            <p className="mt-3 line-clamp-2 text-sm leading-6 text-black/50">{item.summary || "설명 미등록 · 사용자 제안이나 AI 초안으로 보완 가능"}</p>
            <p className="mt-2 text-[0.68rem] font-bold text-black/25">{item.tags.map((tag) => `#${tag}`).join(" ")}</p>
            <div className="mt-4 flex flex-wrap gap-2 border-t border-black/5 pt-4"><button className="flex cursor-pointer items-center gap-1.5 rounded-full bg-black px-3 py-2 text-xs font-black text-white" onClick={() => { setEditing(item); setCreating(false); setError(""); window.scrollTo({ top: 0, behavior: "smooth" }); }} type="button"><FilePenLine className="size-3.5" />수정</button>{item.publicationStatus !== "published" && <button className="flex cursor-pointer items-center gap-1.5 rounded-full bg-[#e8fffe] px-3 py-2 text-xs font-black text-[#087b77]" disabled={saving} onClick={() => void changeStatus(item, "published")} type="button"><Check className="size-3.5" />공개</button>}{item.publicationStatus !== "archived" && <button className="flex cursor-pointer items-center gap-1.5 rounded-full bg-black/5 px-3 py-2 text-xs font-black text-black/45" disabled={saving} onClick={() => void changeStatus(item, "archived")} type="button"><Archive className="size-3.5" />보관</button>}<button className="ml-auto flex cursor-pointer items-center gap-1.5 rounded-full bg-[#fff0f3] px-3 py-2 text-xs font-black text-[#d91d46] hover:bg-[#ffe5e9]" disabled={saving} onClick={() => void deleteItem(item)} type="button"><Trash2 className="size-3.5" />삭제</button></div>
          </article>;
        })}
      </div>
      {!visibleItems.length && <p className="mt-4 rounded-2xl bg-white p-8 text-center text-sm font-bold text-black/35">조건에 맞는 사전 항목이 없습니다.</p>}
    </section>
  );
}

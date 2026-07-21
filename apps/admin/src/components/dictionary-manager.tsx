"use client";

import {
  Check,
  ExternalLink,
  FilePenLine,
  Filter,
  Grid,
  List,
  LoaderCircle,
  Plus,
  Save,
  Trash2,
  X,
  Play,
  Search,
  Tag as TagIcon,
  Video,
} from "lucide-react";
import { FormEvent, useState } from "react";
import { Field } from "@origin/ui";
import type { AdminCategory } from "@/components/category-manager";

type VideoMeta = {
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
  thumbnailUrl?: string;
  thumbnailFit?: "cover" | "contain";
  aliases: string[];
  summary: string;
  origin: {
    status: "verified" | "likely" | "needs-review";
    video: VideoMeta;
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
  trendingVideos: VideoMeta[];
  relatedVideos: VideoMeta[];
  lifecycle?: {
    originYear?: number;
    firstSeenAt?: string;
    lastObservedAt?: string;
  };
  categoryIds: string[];
  tags: string[];
  accent: string;
  publicationStatus: "draft" | "published" | "archived";
  createdAt?: string;
  updatedAt?: string;
};

const apiBase = "/viral/api/v1";

const statusMeta = {
  draft: { label: "작성 중", className: "bg-amber-50 text-amber-700 border border-amber-200/60" },
  published: { label: "공개", className: "bg-emerald-50 text-emerald-700 border border-emerald-200/60" },
  archived: { label: "보관", className: "bg-zinc-100 text-zinc-500 border border-zinc-200/60" },
};

const kindLabels = {
  "community-meme": "커뮤니티 밈",
  "video-meme": "영상 밈",
  challenge: "챌린지",
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

type BulkAction = "publish" | "draft" | "archive" | "add-category" | "remove-category";

export function DictionaryManager({
  items,
  categories,
  onChange,
}: {
  items: AdminMeme[];
  categories: AdminCategory[];
  onChange: (items: AdminMeme[]) => void;
}) {
  const [editing, setEditing] = useState<AdminMeme | null>(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | AdminMeme["publicationStatus"]>("all");
  const [kindFilter, setKindFilter] = useState<"all" | AdminMeme["kind"]>("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<BulkAction>("publish");
  const [bulkCategoryId, setBulkCategoryId] = useState(categories[0]?.id ?? "");

  const formOpen = creating || Boolean(editing);

  const visibleItems = items.filter((item) => {
    const matchesQuery =
      !query.trim() ||
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.slug.toLowerCase().includes(query.toLowerCase()) ||
      item.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase()));
    const matchesStatus = statusFilter === "all" || item.publicationStatus === statusFilter;
    const matchesKind = kindFilter === "all" || item.kind === kindFilter;
    return matchesQuery && matchesStatus && matchesKind;
  });

  const allVisibleSelected =
    visibleItems.length > 0 && visibleItems.every((item) => selectedIds.has(item.id));

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const slug = String(form.get("slug") ?? "").trim().toLowerCase();
    const sourceUrl = String(form.get("sourceUrl") ?? "").trim();
    const base = editing;

    const originVideo: VideoMeta = {
      ...(base?.origin.video ?? { id: `${slug}-origin` }),
      id: base?.origin.video.id ?? `${slug}-origin`,
      platform: String(form.get("originPlatform")) as VideoMeta["platform"],
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
        evidence,
        lastReviewedAt: new Date().toISOString().slice(0, 10),
      },
      timeline,
      trendingVideos: base?.trendingVideos ?? [],
      relatedVideos: base?.relatedVideos ?? [],
      lifecycle: {
        originYear: Number(form.get("originYear")) || undefined,
        firstSeenAt: String(form.get("firstSeenAt") ?? "").trim() || undefined,
        lastObservedAt: String(form.get("lastObservedAt") ?? "").trim() || undefined,
      },
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

  async function deleteItem(item: AdminMeme) {
    if (!confirm(`"${item.title}" 항목을 완전히 삭제하시겠습니까?`)) return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch(`${apiBase}/admin/memes/${encodeURIComponent(item.id)}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error(await readError(response));
      onChange(items.filter((candidate) => candidate.id !== item.id));
      setSelectedIds((current) => {
        const next = new Set(current);
        next.delete(item.id);
        return next;
      });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "삭제하지 못했습니다.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteSelected() {
    if (!selectedIds.size) return;
    if (!confirm(`선택한 ${selectedIds.size}개 항목을 삭제하시겠습니까?`)) return;
    setSaving(true);
    setError("");
    try {
      for (const id of selectedIds) {
        await fetch(`${apiBase}/admin/memes/${encodeURIComponent(id)}`, { method: "DELETE" });
      }
      onChange(items.filter((item) => !selectedIds.has(item.id)));
      setSelectedIds(new Set());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "일부 항목을 삭제하지 못했습니다.");
    } finally {
      setSaving(false);
    }
  }

  async function runBulkAction() {
    if (!selectedIds.size) return;
    setSaving(true);
    setError("");
    try {
      const selectedMemes = items.filter((item) => selectedIds.has(item.id));
      for (const meme of selectedMemes) {
        const updated = { ...meme };
        if (bulkAction === "publish") updated.publicationStatus = "published";
        else if (bulkAction === "draft") updated.publicationStatus = "draft";
        else if (bulkAction === "archive") updated.publicationStatus = "archived";
        else if (bulkAction === "add-category" && bulkCategoryId) {
          if (!updated.categoryIds.includes(bulkCategoryId)) {
            updated.categoryIds = [...updated.categoryIds, bulkCategoryId];
          }
        } else if (bulkAction === "remove-category" && bulkCategoryId) {
          updated.categoryIds = updated.categoryIds.filter((id) => id !== bulkCategoryId);
        }

        await fetch(`${apiBase}/admin/memes/${encodeURIComponent(meme.id)}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updated),
        });
      }
      const response = await fetch(`${apiBase}/admin/memes`, { cache: "no-store" });
      if (response.ok) {
        const data = (await response.json()) as { items: AdminMeme[] };
        onChange(data.items);
      }
      setSelectedIds(new Set());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "일괄 처리를 실패했습니다.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="mt-5 space-y-4">
      {/* 어드민 상단 헤더 */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-2xl bg-zinc-900 px-4 py-3.5 text-white shadow-md sm:px-6 sm:py-5">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block size-2 rounded-full bg-emerald-400 animate-pulse" />
            <p className="text-[0.65rem] font-extrabold uppercase tracking-wider text-emerald-400">MEME MANAGEMENT</p>
          </div>
          <h2 className="mt-0.5 text-lg sm:text-2xl font-black tracking-tight">사전 항목 관리</h2>
          <p className="mt-0.5 text-[0.7rem] sm:text-xs text-zinc-400">
            실시간 사전 데이터를 등록, 수정, 삭제하거나 상태를 일괄 변경할 수 있습니다.
          </p>
        </div>
        <button
          className="inline-flex cursor-pointer items-center gap-1 rounded-full bg-white px-3 py-2 text-xs font-black text-zinc-900 shadow transition hover:bg-zinc-100 active:scale-95 sm:px-4 sm:py-2.5"
          onClick={() => {
            setCreating(true);
            setEditing(null);
            setError("");
          }}
          type="button"
        >
          <Plus className="size-3.5 sm:size-4" /> 사전 항목 등록
        </button>
      </div>

      {error && (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-bold text-rose-600">
          {error}
        </p>
      )}

      {/* 폼 영역 (개선된 인터랙티브 폼) */}
      {formOpen && (
        <MemeEntryForm
          categories={categories}
          editing={editing}
          onCancel={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSave={save}
          saving={saving}
        />
      )}

      {/* 검색, 필터 및 뷰 모드 조작 바 */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-3.5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
            <div className="relative min-w-[200px] flex-1">
              <Filter className="absolute left-3.5 top-1/2 size-3.5 -translate-y-1/2 text-zinc-400" />
              <input
                className="w-full rounded-xl bg-zinc-100 py-2 pl-9 pr-3 text-xs font-medium outline-none focus:bg-zinc-50 focus:ring-2 focus:ring-zinc-900/10"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="제목, slug, 태그 검색..."
                value={query}
              />
            </div>
            <select
              aria-label="공개 상태 필터"
              className="cursor-pointer rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-bold text-zinc-700 outline-none hover:border-zinc-400"
              onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}
              value={statusFilter}
            >
              <option value="all">모든 상태 ({items.length})</option>
              <option value="published">공개만</option>
              <option value="draft">작성 중만</option>
              <option value="archived">보관만</option>
            </select>
            <select
              aria-label="종류 필터"
              className="cursor-pointer rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-bold text-zinc-700 outline-none hover:border-zinc-400"
              onChange={(event) => setKindFilter(event.target.value as typeof kindFilter)}
              value={kindFilter}
            >
              <option value="all">모든 종류</option>
              {Object.entries(kindLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1 rounded-xl bg-zinc-100 p-1">
            <button
              className={`flex cursor-pointer items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition ${viewMode === "grid" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-900"}`}
              onClick={() => setViewMode("grid")}
              type="button"
            >
              <Grid className="size-3.5" /> 콤팩트 카드
            </button>
            <button
              className={`flex cursor-pointer items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition ${viewMode === "table" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-900"}`}
              onClick={() => setViewMode("table")}
              type="button"
            >
              <List className="size-3.5" /> 테이블 뷰
            </button>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-zinc-100 pt-3 text-xs">
          <div className="flex items-center gap-3">
            <label className="inline-flex cursor-pointer items-center gap-2 font-bold text-zinc-700">
              <input
                checked={allVisibleSelected}
                className="size-4 accent-zinc-900"
                onChange={() =>
                  setSelectedIds((current) => {
                    const next = new Set(current);
                    visibleItems.forEach((item) =>
                      allVisibleSelected ? next.delete(item.id) : next.add(item.id),
                    );
                    return next;
                  })
                }
                type="checkbox"
              />
              전체 선택 ({visibleItems.length}개 중 {selectedIds.size}개)
            </label>
            {selectedIds.size > 0 && (
              <button
                className="cursor-pointer text-zinc-400 underline hover:text-zinc-700"
                onClick={() => setSelectedIds(new Set())}
                type="button"
              >
                선택 해제
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              aria-label="일괄 작업 선택"
              className="cursor-pointer rounded-xl border border-zinc-200 bg-white px-3 py-1.5 font-bold text-zinc-700"
              onChange={(event) => setBulkAction(event.target.value as BulkAction)}
              value={bulkAction}
            >
              <option value="publish">공개 상태로 변경</option>
              <option value="draft">작성 중으로 변경</option>
              <option value="archive">보관 상태로 변경</option>
              <option value="add-category">카테고리 추가</option>
              <option value="remove-category">카테고리 제거</option>
            </select>
            {(bulkAction === "add-category" || bulkAction === "remove-category") && (
              <select
                aria-label="카테고리 선택"
                className="cursor-pointer rounded-xl border border-zinc-200 bg-white px-3 py-1.5 font-bold text-zinc-700"
                onChange={(event) => setBulkCategoryId(event.target.value)}
                value={bulkCategoryId}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            )}
            <button
              className="cursor-pointer rounded-xl bg-zinc-900 px-3.5 py-1.5 font-bold text-white transition hover:bg-zinc-800 disabled:opacity-35"
              disabled={!selectedIds.size || saving}
              onClick={() => void runBulkAction()}
              type="button"
            >
              선택 항목 적용
            </button>
            <button
              className="inline-flex cursor-pointer items-center gap-1 rounded-xl bg-rose-50 px-3.5 py-1.5 font-bold text-rose-600 border border-rose-200/60 hover:bg-rose-100 disabled:opacity-35"
              disabled={!selectedIds.size || saving}
              onClick={() => void deleteSelected()}
              type="button"
            >
              <Trash2 className="size-3.5" /> 선택 삭제
            </button>
          </div>
        </div>
      </div>

      {/* 목록 렌더링 영역 */}
      {!visibleItems.length ? (
        <div className="rounded-2xl border border-dashed border-zinc-200 bg-white p-12 text-center">
          <p className="text-sm font-bold text-zinc-400">조건에 일치하는 사전 항목이 없습니다.</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid gap-3.5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visibleItems.map((item) => {
            const meta = statusMeta[item.publicationStatus];
            const isSelected = selectedIds.has(item.id);
            return (
              <article
                className={`group relative flex flex-col justify-between rounded-xl border bg-white p-4 shadow-sm transition hover:shadow-md ${
                  isSelected ? "border-rose-500 ring-2 ring-rose-500/10" : "border-zinc-200/80 hover:border-zinc-300"
                }`}
                key={item.id}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <input
                        aria-label={`${item.title} 선택`}
                        checked={isSelected}
                        className="size-4 cursor-pointer accent-rose-600 shrink-0"
                        onChange={() =>
                          setSelectedIds((current) => {
                            const next = new Set(current);
                            if (next.has(item.id)) next.delete(item.id);
                            else next.add(item.id);
                            return next;
                          })
                        }
                        type="checkbox"
                      />
                      <span className={`rounded-md px-2 py-0.5 text-[0.62rem] font-black ${meta.className}`}>
                        {meta.label}
                      </span>
                      <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-[0.62rem] font-bold text-zinc-600 truncate">
                        {kindLabels[item.kind]}
                      </span>
                    </div>
                    {item.publicationStatus === "published" && (
                      <a
                        className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 shrink-0"
                        aria-label="공개 페이지 보기"
                        href={`https://viralorigin.vercel.app/memes/${encodeURIComponent(item.slug)}`}
                        rel="noreferrer"
                        target="_blank"
                      >
                        <ExternalLink className="size-3.5" />
                      </a>
                    )}
                  </div>

                  <h3 className="mt-3 truncate text-base font-black text-zinc-900 group-hover:text-rose-600">
                    {item.title}
                  </h3>
                  <p className="mt-0.5 font-mono text-[0.68rem] font-bold text-zinc-400 truncate">
                    /{item.slug} {item.lifecycle?.originYear ? `· ${item.lifecycle.originYear}년` : ""}
                  </p>

                  <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-zinc-600">
                    {item.summary || "설명 미등록"}
                  </p>
                </div>

                <div className="mt-4 border-t border-zinc-100 pt-3">
                  <div className="mb-3 flex flex-wrap gap-1 min-h-[20px]">
                    {item.tags.slice(0, 3).map((tag) => (
                      <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[0.62rem] font-bold text-zinc-500" key={tag}>
                        #{tag}
                      </span>
                    ))}
                    {item.tags.length > 3 && (
                      <span className="text-[0.62rem] font-bold text-zinc-400">+{item.tags.length - 3}</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-1 text-xs">
                    <div className="flex items-center gap-1">
                      <a
                        href={`https://viralorigin.vercel.app/memes/${item.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-zinc-100 px-2.5 py-1.5 font-bold text-zinc-700 hover:bg-black hover:text-white transition"
                        title="웹사이트에서 보기"
                      >
                        <ExternalLink className="size-3" /> 웹에서 보기
                      </a>
                      <button
                        className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 font-bold text-zinc-700 hover:border-zinc-400"
                        onClick={() => {
                          setEditing(item);
                          setCreating(false);
                          setError("");
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        type="button"
                      >
                        <FilePenLine className="size-3" /> 수정
                      </button>
                      {item.publicationStatus !== "published" && (
                        <button
                          className="inline-flex cursor-pointer items-center rounded-lg bg-emerald-50 px-2 py-1.5 font-bold text-emerald-700 hover:bg-emerald-100"
                          disabled={saving}
                          onClick={() => void changeStatus(item, "published")}
                          type="button"
                        >
                          <Check className="size-3" /> 공개
                        </button>
                      )}
                    </div>
                    <button
                      className="inline-flex cursor-pointer items-center rounded-lg p-1.5 text-zinc-400 hover:bg-rose-50 hover:text-rose-600"
                      disabled={saving}
                      onClick={() => void deleteItem(item)}
                      title="삭제"
                      type="button"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50 font-bold text-zinc-500">
                  <th className="p-3.5 w-10 text-center">선택</th>
                  <th className="p-3.5">상태</th>
                  <th className="p-3.5">제목 / slug</th>
                  <th className="p-3.5">종류</th>
                  <th className="p-3.5">요약</th>
                  <th className="p-3.5">태그</th>
                  <th className="p-3.5 text-right">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 font-medium text-zinc-800">
                {visibleItems.map((item) => {
                  const meta = statusMeta[item.publicationStatus];
                  const isSelected = selectedIds.has(item.id);
                  return (
                    <tr className={`hover:bg-zinc-50/80 transition ${isSelected ? "bg-rose-50/30" : ""}`} key={item.id}>
                      <td className="p-3.5 text-center">
                        <input
                          aria-label={`${item.title} 선택`}
                          checked={isSelected}
                          className="size-4 cursor-pointer accent-rose-600"
                          onChange={() =>
                            setSelectedIds((current) => {
                              const next = new Set(current);
                              if (next.has(item.id)) next.delete(item.id);
                              else next.add(item.id);
                              return next;
                            })
                          }
                          type="checkbox"
                        />
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <span className={`rounded-md px-2 py-0.5 text-[0.62rem] font-black ${meta.className}`}>
                          {meta.label}
                        </span>
                      </td>
                      <td className="p-3.5 font-bold whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span>{item.title}</span>
                          <span className="font-mono text-[0.68rem] text-zinc-400">/{item.slug}</span>
                        </div>
                      </td>
                      <td className="p-3.5 whitespace-nowrap text-zinc-500">
                        {kindLabels[item.kind]}
                      </td>
                      <td className="p-3.5 max-w-xs truncate text-zinc-500">
                        {item.summary || "설명 미등록"}
                      </td>
                      <td className="p-3.5 max-w-xs truncate text-zinc-400 font-mono text-[0.68rem]">
                        {item.tags.map((t) => `#${t}`).join(" ")}
                      </td>
                      <td className="p-3.5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <a
                            href={`https://viralorigin.vercel.app/memes/${item.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs font-bold text-zinc-600 hover:bg-black hover:text-white transition"
                            title="웹사이트에서 보기"
                          >
                            <ExternalLink className="size-3" /> 웹 보기
                          </a>
                          <button
                            className="cursor-pointer rounded-lg bg-zinc-900 px-2.5 py-1 text-xs font-bold text-white hover:bg-zinc-800"
                            onClick={() => {
                              setEditing(item);
                              setCreating(false);
                              setError("");
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            type="button"
                          >
                            수정
                          </button>
                          <button
                            className="cursor-pointer rounded-lg border border-zinc-200 bg-white p-1 text-zinc-400 hover:border-rose-300 hover:text-rose-600"
                            disabled={saving}
                            onClick={() => void deleteItem(item)}
                            title="삭제"
                            type="button"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}

/** 폼 영역 컴포넌트: 카테고리 검색 선택, 인터랙티브 태그 칩, 실시간 영상 임베드 미리보기 */
function MemeEntryForm({
  editing,
  categories,
  saving,
  onSave,
  onCancel,
}: {
  editing: AdminMeme | null;
  categories: AdminCategory[];
  saving: boolean;
  onSave: (event: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
}) {
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(
    editing?.categoryIds ?? []
  );
  const [categorySearch, setCategorySearch] = useState("");
  const [tags, setTags] = useState<string[]>(editing?.tags ?? []);
  const [tagInput, setTagInput] = useState("");
  const [originUrl, setOriginUrl] = useState(editing?.origin.video.url ?? "");

  const addTag = () => {
    const trimmed = tagInput.trim().replace(/^#/, "");
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput("");
    }
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const toggleCategory = (id: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const ytId = getYouTubeId(originUrl);

  const filteredCategories = categories.filter(
    (c) =>
      c.label.toLowerCase().includes(categorySearch.toLowerCase()) ||
      c.id.toLowerCase().includes(categorySearch.toLowerCase())
  );

  return (
    <form
      className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-lg sm:p-6"
      key={editing?.id ?? "new"}
      onSubmit={onSave}
    >
      <div className="flex items-center justify-between border-b border-zinc-100 pb-3.5">
        <div className="flex items-center gap-3">
          <div>
            <span className="text-[0.65rem] font-black text-rose-500 uppercase tracking-wider">
              {editing ? "Edit Entry" : "Create Entry"}
            </span>
            <h3 className="text-lg font-black text-zinc-900 sm:text-xl">
              {editing ? `${editing.title} 수정` : "새 사전 항목 추가"}
            </h3>
          </div>
          {editing?.slug && (
            <a
              href={`https://viralorigin.vercel.app/memes/${editing.slug}`}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-black px-3 py-1.5 text-xs font-black text-white shadow-sm hover:bg-zinc-800 transition"
            >
              <ExternalLink className="size-3.5" /> 웹에서 보기 ↗
            </a>
          )}
        </div>
        <button
          className="cursor-pointer rounded-full bg-zinc-100 p-2 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-700"
          onClick={onCancel}
          type="button"
          aria-label="닫기"
        >
          <X className="size-4 sm:size-5" />
        </button>
      </div>

      <div className="mt-4 grid gap-4 text-xs sm:grid-cols-2">
        <Field label="제목 (Title)">
          <input
            className="w-full rounded-xl border border-zinc-200 px-3.5 py-2 text-xs font-bold outline-none focus:border-zinc-900"
            name="title"
            required
            defaultValue={editing?.title}
            placeholder="예: 꿍싯꿍싯"
          />
        </Field>
        <Field label="slug (URL 식별자)">
          <input
            className="w-full rounded-xl border border-zinc-200 px-3.5 py-2 text-xs font-mono outline-none focus:border-zinc-900"
            name="slug"
            required
            pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
            placeholder="kkungsit-kkungsit"
            defaultValue={editing?.slug}
          />
        </Field>
        <Field label="종류 (Kind)">
          <select
            className="w-full cursor-pointer rounded-xl border border-zinc-200 px-3 py-2 font-bold outline-none focus:border-zinc-900"
            name="kind"
            defaultValue={editing?.kind ?? "community-meme"}
          >
            <option value="community-meme">커뮤니티 밈</option>
            <option value="video-meme">영상 밈</option>
            <option value="challenge">챌린지</option>
          </select>
        </Field>
        <Field label="공개 상태 (Publication Status)">
          <select
            className="w-full cursor-pointer rounded-xl border border-zinc-200 px-3 py-2 font-bold outline-none focus:border-zinc-900"
            name="publicationStatus"
            defaultValue={editing?.publicationStatus ?? "published"}
          >
            <option value="published">공개 (Published)</option>
            <option value="draft">작성 중 (Draft)</option>
            <option value="archived">보관 (Archived)</option>
          </select>
        </Field>
        <Field label="별칭 (Comma-separated aliases)">
          <input
            className="w-full rounded-xl border border-zinc-200 px-3.5 py-2 text-xs outline-none focus:border-zinc-900"
            name="aliases"
            defaultValue={editing?.aliases.join(", ")}
            placeholder="다이죠부, 료 챌린지"
          />
        </Field>
        <Field label="포인트 색상">
          <input
            className="h-9 w-full cursor-pointer rounded-xl border border-zinc-200 p-1"
            name="accent"
            type="color"
            defaultValue={editing?.accent ?? "#fe2c55"}
          />
        </Field>

        {/* 1. 카테고리 검색 & 콤팩트 태그 선택 UI */}
        <div className="col-span-full rounded-xl border border-zinc-200/80 bg-zinc-50/50 p-3.5">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <span className="text-xs font-bold text-zinc-700">카테고리 선택 (Search & Pick)</span>
            <div className="relative min-w-[160px]">
              <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-zinc-400" />
              <input
                className="w-full rounded-lg border border-zinc-200 bg-white py-1 pl-8 pr-2 text-xs font-medium outline-none focus:border-zinc-900"
                onChange={(e) => setCategorySearch(e.target.value)}
                placeholder="카테고리 검색..."
                value={categorySearch}
              />
            </div>
          </div>

          {/* 선택된 카테고리 칩 목록 */}
          <div className="flex flex-wrap gap-1.5 mb-2 min-h-[28px]">
            {selectedCategoryIds.map((id) => {
              const cat = categories.find((c) => c.id === id);
              return (
                <span
                  key={id}
                  className="inline-flex items-center gap-1 rounded-lg bg-zinc-900 px-2.5 py-1 text-xs font-bold text-white"
                >
                  <input type="hidden" name="categoryIds" value={id} />
                  {cat?.label ?? id}
                  <button
                    type="button"
                    onClick={() => toggleCategory(id)}
                    className="hover:text-rose-400 ml-0.5"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              );
            })}
            {selectedCategoryIds.length === 0 && (
              <span className="text-xs text-zinc-400 font-medium py-1">선택된 카테고리가 없습니다.</span>
            )}
          </div>

          {/* 카테고리 후보 콤팩트 리스트 */}
          <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto border-t border-zinc-200/60 pt-2">
            {filteredCategories.map((category) => {
              const isSelected = selectedCategoryIds.includes(category.id);
              if (isSelected) return null;
              return (
                <button
                  type="button"
                  key={category.id}
                  onClick={() => toggleCategory(category.id)}
                  className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-xs font-bold text-zinc-600 hover:border-zinc-900 hover:text-zinc-900 transition"
                >
                  + {category.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. 태그 인터랙티브 칩 개별 추가/삭제 UI */}
        <div className="col-span-full rounded-xl border border-zinc-200/80 bg-zinc-50/50 p-3.5">
          <input type="hidden" name="tags" value={tags.join(",")} />
          <span className="text-xs font-bold text-zinc-700 block mb-2">태그 관리 (Tag Manager)</span>

          <div className="flex items-center gap-2 mb-2.5">
            <div className="relative flex-1">
              <TagIcon className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-zinc-400" />
              <input
                className="w-full rounded-xl border border-zinc-200 bg-white py-2 pl-9 pr-3 text-xs font-bold outline-none focus:border-zinc-900"
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="태그 입력 후 Enter 또는 추가 버튼..."
                value={tagInput}
              />
            </div>
            <button
              type="button"
              onClick={addTag}
              className="inline-flex items-center gap-1 rounded-xl bg-zinc-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-zinc-800"
            >
              <Plus className="size-3.5" /> 추가
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5 min-h-[30px]">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-2.5 py-1 text-xs font-bold text-zinc-800 shadow-sm"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="rounded p-0.5 hover:bg-rose-50 hover:text-rose-600 transition"
                >
                  <X className="size-3" />
                </button>
              </span>
            ))}
            {tags.length === 0 && (
              <span className="text-xs text-zinc-400 py-1">등록된 태그가 없습니다.</span>
            )}
          </div>
        </div>

        <Field label="한 줄 요약 (Summary)" wide>
          <textarea
            className="w-full rounded-xl border border-zinc-200 p-3 text-xs leading-relaxed outline-none focus:border-zinc-900"
            name="summary"
            required
            rows={2}
            defaultValue={editing?.summary}
            placeholder="밈에 대한 명확하고 간결한 요약 설명"
          />
        </Field>
        <Field label="썸네일 URL (선택사항 - 미입력 시 YouTube 등 자동 추론)" wide>
          <input
            className="w-full rounded-xl border border-zinc-200 px-3.5 py-2 text-xs outline-none focus:border-zinc-900"
            name="thumbnailUrl"
            type="url"
            placeholder="https://... 또는 /thumbnails/..."
            defaultValue={editing?.thumbnailUrl}
          />
        </Field>

        <div className="col-span-full my-1 border-t border-zinc-100 pt-3">
          <p className="text-xs font-black text-zinc-400 uppercase tracking-wider">Origin & Video Meta</p>
        </div>

        <Field label="원본 검증 상태">
          <select
            className="w-full cursor-pointer rounded-xl border border-zinc-200 px-3 py-2 font-bold outline-none focus:border-zinc-900"
            name="originStatus"
            defaultValue={editing?.origin.status ?? "verified"}
          >
            <option value="verified">출처 확인 (Verified)</option>
            <option value="likely">유력 (Likely)</option>
            <option value="needs-review">검토 필요 (Needs Review)</option>
          </select>
        </Field>
        <Field label="유행 시작 연도">
          <input
            className="w-full rounded-xl border border-zinc-200 px-3.5 py-2 text-xs outline-none focus:border-zinc-900"
            name="originYear"
            type="number"
            min="1900"
            max={new Date().getFullYear() + 1}
            placeholder="2026"
            defaultValue={editing?.lifecycle?.originYear}
          />
        </Field>
        <Field label="원본 플랫폼">
          <select
            className="w-full cursor-pointer rounded-xl border border-zinc-200 px-3 py-2 font-bold outline-none focus:border-zinc-900"
            name="originPlatform"
            defaultValue={editing?.origin.video.platform ?? "youtube"}
          >
            <option value="youtube">YouTube</option>
            <option value="tiktok">TikTok</option>
            <option value="instagram">Instagram</option>
            <option value="x">X</option>
            <option value="unknown">기타</option>
          </select>
        </Field>
        <Field label="원본 영상 URL">
          <input
            className="w-full rounded-xl border border-zinc-200 px-3.5 py-2 text-xs outline-none focus:border-zinc-900"
            name="originUrl"
            required
            type="url"
            value={originUrl}
            onChange={(e) => setOriginUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
          />
        </Field>

        {/* 2. 원본 영상 실시간 콤팩트 미리보기 (1/4 크기) */}
        {originUrl && (
          <div className="col-span-full rounded-xl border border-zinc-200 bg-zinc-900 p-3 text-white">
            <div className="flex items-center gap-2 mb-2 text-xs font-bold text-rose-400">
              <Video className="size-3.5" />
              <span>실시간 영상 미리보기 (1/4 콤팩트)</span>
            </div>
            {ytId ? (
              <div className="relative aspect-video w-full max-w-[260px] overflow-hidden rounded-xl bg-black border border-zinc-700 shadow-md">
                <iframe
                  className="absolute inset-0 size-full border-0"
                  src={`https://www.youtube-nocookie.com/embed/${ytId}`}
                  title="YouTube video player"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-3 text-center border border-dashed border-zinc-700 rounded-xl bg-zinc-800/50 max-w-[260px]">
                <Play className="size-6 text-zinc-400 mb-1" />
                <p className="text-[0.68rem] font-bold text-zinc-300 truncate max-w-full">{originUrl}</p>
                <a
                  href={originUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-flex items-center gap-1 text-[0.62rem] text-rose-400 hover:underline"
                >
                  <ExternalLink className="size-3" /> 외부 링크로 열기
                </a>
              </div>
            )}
          </div>
        )}

        <Field label="영상 제목">
          <input
            className="w-full rounded-xl border border-zinc-200 px-3.5 py-2 text-xs outline-none focus:border-zinc-900"
            name="originTitle"
            required
            defaultValue={editing?.origin.video.title}
            placeholder="영상 제목"
          />
        </Field>
        <Field label="업로더 (Creator)">
          <input
            className="w-full rounded-xl border border-zinc-200 px-3.5 py-2 text-xs outline-none focus:border-zinc-900"
            name="originCreator"
            defaultValue={editing?.origin.video.creator}
            placeholder="@ryo.cute"
          />
        </Field>
        <Field label="원본 요약 설명" wide>
          <textarea
            className="w-full rounded-xl border border-zinc-200 p-3 text-xs leading-relaxed outline-none focus:border-zinc-900"
            name="originSummary"
            required
            rows={2}
            defaultValue={editing?.origin.summary}
            placeholder="원본 영상 유래 및 확산 개요"
          />
        </Field>
      </div>

      <div className="mt-5 flex justify-end gap-2 border-t border-zinc-100 pt-4">
        <button
          className="cursor-pointer rounded-full bg-zinc-100 px-5 py-2 text-xs font-bold text-zinc-600 hover:bg-zinc-200"
          onClick={onCancel}
          type="button"
        >
          취소
        </button>
        <button
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-rose-600 px-6 py-2 text-xs font-black text-white hover:bg-rose-700 disabled:opacity-50"
          disabled={saving}
          type="submit"
        >
          {saving ? <LoaderCircle className="size-4 animate-spin" /> : <Save className="size-4" />}
          {saving ? "저장 중" : "사전 항목 저장"}
        </button>
      </div>
    </form>
  );
}

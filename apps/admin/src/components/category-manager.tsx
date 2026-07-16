"use client";

import { FilePenLine, LoaderCircle, Plus, Save, Tags, X } from "lucide-react";
import { FormEvent, useState } from "react";

import { Button, Card, Field } from "@origin/ui";

export type AdminCategory = {
  id: string;
  slug: string;
  label: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

const apiBase = "/viral/api/v1";

async function readError(response: Response) {
  try {
    return ((await response.json()) as { error?: string }).error ?? "저장하지 못했습니다.";
  } catch {
    return "저장하지 못했습니다.";
  }
}

export function CategoryManager({
  items,
  onChange,
}: {
  items: AdminCategory[];
  onChange: (items: AdminCategory[]) => void;
}) {
  const [editing, setEditing] = useState<AdminCategory | null>(null);
  const [creating, setCreating] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function persist(payload: Omit<AdminCategory, "id">, id?: string) {
    const response = await fetch(
      id ? `${apiBase}/admin/categories/${encodeURIComponent(id)}` : `${apiBase}/admin/categories`,
      {
        method: id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );
    if (!response.ok) throw new Error(await readError(response));
    return ((await response.json()) as { item: AdminCategory }).item;
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSavingId(editing?.id ?? "new");
    setError("");
    try {
      const item = await persist(
        {
          slug: String(form.get("slug") ?? "").trim().toLowerCase(),
          label: String(form.get("label") ?? "").trim(),
          description: String(form.get("description") ?? "").trim() || undefined,
          sortOrder: Number(form.get("sortOrder") ?? 0),
          isActive: form.get("isActive") === "on",
        },
        editing?.id,
      );
      onChange(
        editing
          ? items.map((candidate) => candidate.id === editing.id ? item : candidate)
          : [...items, item],
      );
      setEditing(null);
      setCreating(false);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "저장하지 못했습니다.");
    } finally {
      setSavingId(null);
    }
  }

  async function toggle(item: AdminCategory) {
    setSavingId(item.id);
    setError("");
    try {
      const updated = await persist({ ...item, isActive: !item.isActive }, item.id);
      onChange(items.map((candidate) => candidate.id === item.id ? updated : candidate));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "상태를 바꾸지 못했습니다.");
    } finally {
      setSavingId(null);
    }
  }

  const sortedItems = [...items].sort(
    (a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label, "ko"),
  );

  return (
    <section className="mt-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-black p-5 text-white sm:p-6">
        <div>
          <p className="text-xs font-black text-[#25f4ee]">SERVER CATEGORIES</p>
          <h2 className="mt-1 text-2xl font-black tracking-[-0.04em]">카테고리 관리</h2>
          <p className="mt-1 text-xs leading-5 text-white/50">큰 탐색 영역을 정리합니다. 검색 키워드는 사전 항목의 태그에서 별도로 관리하세요.</p>
        </div>
        <Button className="bg-white text-black hover:bg-white/90" onClick={() => { setCreating(true); setEditing(null); setError(""); }} size="sm">
          <Plus className="size-4" /> 새 카테고리
        </Button>
      </div>

      {error && <p className="mt-3 rounded-xl bg-[#fff0f3] px-4 py-3 text-xs font-bold text-[#d91d46]">{error}</p>}

      {(creating || editing) && (
        <Card className="mt-4 p-5 sm:p-7">
          <form key={editing?.id ?? "new"} onSubmit={save}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black">{editing ? `${editing.label} 수정` : "새 카테고리"}</h3>
              <button aria-label="닫기" className="rounded-full bg-black/5 p-2 text-black/40" onClick={() => { setCreating(false); setEditing(null); }} type="button"><X className="size-4" /></button>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="표시 이름"><input defaultValue={editing?.label} name="label" placeholder="인터넷 방송" required /></Field>
              <Field label="slug"><input defaultValue={editing?.slug} name="slug" pattern="[a-z0-9]+(?:-[a-z0-9]+)*" placeholder="internet-broadcast" required /></Field>
              <Field label="설명" wide><textarea defaultValue={editing?.description} name="description" placeholder="사용자가 이 카테고리를 이해할 수 있는 짧은 설명" /></Field>
              <Field label="정렬 순서"><input defaultValue={editing?.sortOrder ?? (items.length + 1) * 10} min="0" name="sortOrder" type="number" /></Field>
              <label className="flex items-center gap-3 rounded-2xl border border-black/5 bg-[#f7f7f8] px-4 py-3 text-sm font-black">
                <input className="size-4 accent-black" defaultChecked={editing?.isActive ?? true} name="isActive" type="checkbox" /> 홈에 노출
              </label>
            </div>
            <Button className="mt-5 w-full" disabled={Boolean(savingId)} size="lg" type="submit">
              {savingId ? <LoaderCircle className="size-4 animate-spin" /> : <Save className="size-4" />}
              카테고리 저장
            </Button>
          </form>
        </Card>
      )}

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {sortedItems.map((item) => (
          <Card className="p-5 shadow-none" key={item.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className={`inline-flex rounded-full px-2.5 py-1 text-[0.68rem] font-black ${item.isActive ? "bg-[#e8fffe] text-[#087b77]" : "bg-black/5 text-black/40"}`}>{item.isActive ? "노출 중" : "숨김"}</span>
                <h3 className="mt-3 flex items-center gap-2 text-xl font-black"><Tags className="size-4" />{item.label}</h3>
                <p className="mt-1 text-xs font-bold text-black/30">/{item.slug} · 순서 {item.sortOrder}</p>
              </div>
              <button aria-label={`${item.label} 수정`} className="rounded-full bg-black/5 p-2 text-black/40" onClick={() => { setEditing(item); setCreating(false); setError(""); }} type="button"><FilePenLine className="size-4" /></button>
            </div>
            <p className="mt-3 min-h-10 text-sm leading-5 text-black/45">{item.description ?? "설명이 없습니다."}</p>
            <button
              aria-pressed={item.isActive}
              className={`mt-4 w-full rounded-full px-4 py-2.5 text-xs font-black ${item.isActive ? "bg-black/5 text-black/55" : "bg-black text-white"}`}
              disabled={savingId === item.id}
              onClick={() => void toggle(item)}
              type="button"
            >
              {savingId === item.id ? "저장 중..." : item.isActive ? "홈에서 숨기기" : "다시 노출하기"}
            </button>
          </Card>
        ))}
      </div>
    </section>
  );
}

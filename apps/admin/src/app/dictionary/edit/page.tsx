"use client";

import { AlertTriangle, ArrowLeft, LoaderCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";

import type { AdminCategory } from "@/components/category-manager";
import {
  adminApiBase,
  buildAdminMemePayload,
  MemeEntryForm,
  readAdminError,
  type AdminMeme,
} from "@/components/dictionary-manager";
import { useAuth } from "@/components/auth-provider";

const dictionaryHref = "/viral/dictionary/";

function DictionaryEditContent() {
  const id = useSearchParams().get("id")?.trim() ?? "";
  const { setAuthenticated } = useAuth();
  const [item, setItem] = useState<AdminMeme | null>(null);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!id) {
        setError("수정할 사전 항목 ID가 없습니다.");
        setLoading(false);
        return;
      }

      void Promise.all([
        fetch(`${adminApiBase}/admin/memes`, { cache: "no-store" }),
        fetch(`${adminApiBase}/admin/categories`, { cache: "no-store" }),
      ])
        .then(async ([memeResponse, categoryResponse]) => {
          if (memeResponse.status === 401 || categoryResponse.status === 401) {
            setAuthenticated(false);
            return null;
          }
          if (!memeResponse.ok) throw new Error(await readAdminError(memeResponse));
          if (!categoryResponse.ok) throw new Error(await readAdminError(categoryResponse));
          const memeData = (await memeResponse.json()) as { items: AdminMeme[] };
          const categoryData = (await categoryResponse.json()) as { items: AdminCategory[] };
          return {
            item: memeData.items.find((candidate) => candidate.id === id) ?? null,
            categories: categoryData.items,
          };
        })
        .then((data) => {
          if (!data) return;
          if (!data.item) throw new Error("수정할 사전 항목을 찾을 수 없습니다.");
          setItem(data.item);
          setCategories(data.categories);
        })
        .catch((cause) => {
          setError(cause instanceof Error ? cause.message : "사전 항목을 불러오지 못했습니다.");
        })
        .finally(() => setLoading(false));
    }, 0);

    return () => window.clearTimeout(timer);
  }, [id, setAuthenticated]);

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!item) return;
    setSaving(true);
    setError("");
    try {
      const payload = buildAdminMemePayload(new FormData(event.currentTarget), item);
      const response = await fetch(`${adminApiBase}/admin/memes/${encodeURIComponent(item.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (response.status === 401) {
        setAuthenticated(false);
        return;
      }
      if (!response.ok) throw new Error(await readAdminError(response));
      window.location.assign(dictionaryHref);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "사전 항목을 저장하지 못했습니다.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex min-h-[320px] items-center justify-center"><LoaderCircle aria-label="수정 항목 불러오는 중" className="size-8 animate-spin text-black/25" /></div>;
  }

  return (
    <div className="space-y-4">
      <a className="inline-flex items-center gap-1.5 text-xs font-black text-zinc-500 hover:text-zinc-900" href={dictionaryHref}>
        <ArrowLeft className="size-3.5" /> 사전 목록으로
      </a>
      {error && (
        <p className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-bold text-rose-600">
          <AlertTriangle className="size-4" /> {error}
        </p>
      )}
      {item && (
        <MemeEntryForm
          categories={categories}
          editing={item}
          onCancel={() => window.location.assign(dictionaryHref)}
          onSave={save}
          saving={saving}
        />
      )}
    </div>
  );
}

export default function DictionaryEditPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[320px] items-center justify-center"><LoaderCircle className="size-8 animate-spin text-black/25" /></div>}>
      <DictionaryEditContent />
    </Suspense>
  );
}

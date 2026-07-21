"use client";

import { useEffect, useState, useCallback } from "react";
import { LoaderCircle, AlertTriangle } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { DictionaryManager, type AdminMeme } from "@/components/dictionary-manager";
import type { AdminCategory } from "@/components/category-manager";

const apiBase = "/viral/api/v1";

export default function DictionaryPage() {
  const { setAuthenticated } = useAuth();
  const [memes, setMemes] = useState<AdminMeme[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [memeResponse, categoryResponse] = await Promise.all([
        fetch(`${apiBase}/admin/memes`, { cache: "no-store" }),
        fetch(`${apiBase}/admin/categories`, { cache: "no-store" }),
      ]);

      if (memeResponse.status === 401 || categoryResponse.status === 401) {
        setAuthenticated(false);
        return;
      }

      if (!memeResponse.ok) throw new Error("사전 데이터를 불러오지 못했습니다.");
      if (!categoryResponse.ok) throw new Error("카테고리 데이터를 불러오지 못했습니다.");

      const memeData = (await memeResponse.json()) as { items: AdminMeme[] };
      const categoryData = (await categoryResponse.json()) as { items: AdminCategory[] };

      setMemes(memeData.items || []);
      setCategories(categoryData.items || []);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "데이터를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [setAuthenticated]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadData(), 0);
    return () => window.clearTimeout(timer);
  }, [loadData]);

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <LoaderCircle className="size-8 animate-spin text-black/25" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-[-0.04em]">사전 관리</h1>
          <p className="text-sm text-black/45 mt-1">밈·챌린지 사전의 상세 정보를 편집하고 공개 여부를 관리합니다.</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-[#fff0f3] px-4 py-3 text-xs font-bold text-[#d91d46]">
          <AlertTriangle className="size-4" />
          {error}
        </div>
      )}

      <DictionaryManager categories={categories} items={memes} onChange={setMemes} />
    </div>
  );
}

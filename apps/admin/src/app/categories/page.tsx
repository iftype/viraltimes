"use client";

import { useEffect, useState, useCallback } from "react";
import { LoaderCircle, AlertTriangle } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { CategoryManager, type AdminCategory } from "@/components/category-manager";

const apiBase = "/viral/api/v1";

export default function CategoriesPage() {
  const { setAuthenticated } = useAuth();
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${apiBase}/admin/categories`, { cache: "no-store" });

      if (response.status === 401) {
        setAuthenticated(false);
        return;
      }

      if (!response.ok) throw new Error("카테고리 데이터를 불러오지 못했습니다.");

      const data = (await response.json()) as { items: AdminCategory[] };
      setCategories(data.items || []);
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
          <h1 className="text-2xl font-black tracking-[-0.04em]">카테고리 관리</h1>
          <p className="text-sm text-black/45 mt-1">사전 항목 분류에 사용하는 대카테고리를 생성, 편집, 비활성화합니다.</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-[#fff0f3] px-4 py-3 text-xs font-bold text-[#d91d46]">
          <AlertTriangle className="size-4" />
          {error}
        </div>
      )}

      <CategoryManager items={categories} onChange={setCategories} />
    </div>
  );
}

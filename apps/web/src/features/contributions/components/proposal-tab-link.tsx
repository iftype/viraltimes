"use client";

import { MessageSquareText } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { participationUpdateEvent } from "../lib/local-contributions";

export function ProposalTabLink({ initialCount = 0, memeId }: { initialCount?: number; memeId: string }) {
  const [count, setCount] = useState(initialCount);
  const load = useCallback(async () => {
    try {
      const response = await fetch(`/api/v1/memes/${encodeURIComponent(memeId)}/participation?type=proposal&pageSize=1`, { cache: "no-store" });
      if (!response.ok) return;
      const data = (await response.json()) as { pagination: { total: number } };
      setCount(data.pagination.total);
    } catch {
      // 초기 API 카운트를 유지합니다.
    }
  }, [memeId]);

  useEffect(() => {
    const refresh = () => void load();
    window.addEventListener(participationUpdateEvent, refresh);
    return () => window.removeEventListener(participationUpdateEvent, refresh);
  }, [load]);

  return <a className="inline-flex items-center gap-1.5 rounded-full bg-black px-3 py-2 text-xs font-black text-white" href="#proposals"><MessageSquareText className="size-3.5" />수정 제안 토론 <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[0.62rem]">{count}</span></a>;
}

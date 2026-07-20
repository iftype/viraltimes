import { OriginTimeline } from "@/features/timeline/components/origin-timeline";
import type { Meme } from "@/types/meme";

export function TimelineSection({ meme }: { meme: Meme }) {
  if (!meme.timeline || meme.timeline.length === 0) return null;

  return (
    <section className="border-y border-black/5 bg-white py-4 sm:py-6">
      <div className="page-shell"><div className="mx-auto max-w-3xl">
        <details className="group rounded-2xl border border-black/5 bg-[#fafafa] p-3 sm:p-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3"><span><span className="text-[0.65rem] font-black text-[#25a9a4]">TIMELINE · {meme.timeline.length}단계</span><span className="mt-0.5 block text-base font-black tracking-[-0.03em]">확산 과정 펼쳐보기</span></span><span className="rounded-full bg-white px-3 py-1.5 text-xs font-black text-black/45 group-open:hidden">열기</span><span className="hidden rounded-full bg-white px-3 py-1.5 text-xs font-black text-black/45 group-open:block">접기</span></summary>
          <div className="mt-5 border-t border-black/5 pt-5"><p className="mb-5 text-xs leading-5 text-black/40">모든 확산을 추적한 기록이 아니라, 확인된 주요 장면만 간단히 정리했습니다.</p><OriginTimeline events={meme.timeline} /></div>
        </details>
      </div></div>
    </section>
  );
}

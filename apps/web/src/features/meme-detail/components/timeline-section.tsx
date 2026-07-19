import { ProposalButton } from "@/features/contributions/components/proposal-button";
import { OriginTimeline } from "@/features/timeline/components/origin-timeline";
import type { Meme } from "@/types/meme";

export function TimelineSection({ meme }: { meme: Meme }) {
  if (!meme.timeline || meme.timeline.length === 0) return null;

  return (
    <section className="border-y border-black/5 bg-white py-7 sm:py-9">
      <div className="page-shell"><div className="mx-auto max-w-3xl">
        <details className="group rounded-2xl border border-black/5 bg-[#fafafa] p-4 sm:p-5">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3"><span><span className="text-[0.68rem] font-black text-[#25a9a4]">TIMELINE · {meme.timeline.length}단계</span><span className="mt-1 block text-lg font-black tracking-[-0.03em]">시작부터 유행까지 펼쳐보기</span></span><span className="rounded-full bg-white px-3 py-2 text-xs font-black text-black/45 group-open:hidden">열기</span><span className="hidden rounded-full bg-white px-3 py-2 text-xs font-black text-black/45 group-open:block">접기</span></summary>
          <div className="mt-5 border-t border-black/5 pt-5"><div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs leading-5 text-black/40">확산 기록은 보조 자료이며 링크를 열어 근거를 확인할 수 있습니다.</p><ProposalButton className="w-full sm:w-auto" memeId={meme.id} memeTitle={meme.title} section="timeline" /></div><OriginTimeline events={meme.timeline} /></div>
        </details>
      </div></div>
    </section>
  );
}

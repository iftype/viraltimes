import { ProposalButton } from "@/features/contributions/components/proposal-button";
import { OriginTimeline } from "@/features/timeline/components/origin-timeline";
import type { Meme } from "@/types/meme";

export function TimelineSection({ meme }: { meme: Meme }) {
  return (
    <section className="border-y border-black/5 bg-white py-14 sm:py-20">
      <div className="page-shell"><div className="mx-auto max-w-3xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-black text-[#25a9a4]">TIMELINE</p><h2 className="mt-1 text-2xl font-black tracking-[-0.04em]">시작부터 유행까지</h2></div><ProposalButton className="w-full sm:w-auto" memeId={meme.id} memeTitle={meme.title} section="timeline" /></div>
        <p className="mt-2 text-sm text-black/45">각 단계의 링크를 열어 근거와 확산 흐름을 함께 확인해 보세요.</p>
        <div className="mt-8"><OriginTimeline events={meme.timeline} /></div>
      </div></div>
    </section>
  );
}

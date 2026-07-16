import { EmptyState } from "@origin/ui";
import { ProposalButton } from "@/features/contributions/components/proposal-button";
import { VideoTabs } from "@/features/video-embed/components/video-tabs";
import type { Meme } from "@/types/meme";

export function VideoCollectionSection({ meme, type }: { meme: Meme; type: "trending" | "related" }) {
  const trending = type === "trending";
  const videos = trending ? meme.trendingVideos : meme.relatedVideos;
  return (
    <section className={trending ? "border-y border-black/5 bg-white py-14 sm:py-20" : "page-shell py-14 sm:py-20"}>
      <div className={trending ? "page-shell" : undefined}>
        <div className="mx-auto max-w-3xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div><p className={`text-xs font-black ${trending ? "text-[#fe2c55]" : "text-[#8b5cf6]"}`}>{trending ? "TRENDING CLIPS" : "RELATED"}</p><h2 className="mt-1 text-2xl font-black tracking-[-0.04em]">{trending ? "유행을 크게 만든 영상" : "관련 영상"}</h2></div>
            <ProposalButton className="w-full sm:w-auto" memeId={meme.id} memeTitle={meme.title} section={type} />
          </div>
          <p className="mt-2 text-sm text-black/45">{trending ? "원본을 더 넓은 사람들에게 퍼뜨린 대표 게시물이에요." : "같은 포맷의 변형과 맥락을 이해하는 데 도움이 되는 영상이에요."}</p>
          <div className="mt-6">
            {videos.length ? <VideoTabs videos={videos} /> : <EmptyState title={`아직 확인된 ${trending ? "트렌딩" : "관련"} 영상이 없어요`} description="수정 제안으로 근거 링크를 알려주세요." />}
          </div>
        </div>
      </div>
    </section>
  );
}

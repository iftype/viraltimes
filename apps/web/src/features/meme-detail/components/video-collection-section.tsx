import { EmptyState } from "@origin/ui";
import { ProposalButton } from "@/features/contributions/components/proposal-button";
import { ChallengeVideoRail } from "@/features/video-embed/components/challenge-video-rail";
import { ViralVideoGallery } from "@/features/video-embed/components/viral-video-gallery";
import type { Meme } from "@/types/meme";

export function VideoCollectionSection({ meme, type }: { meme: Meme; type: "trending" | "related" }) {
  const trending = type === "trending";
  const videos = trending ? meme.trendingVideos : meme.relatedVideos;
  return (
    <section className={trending ? "border-y border-black/5 bg-white py-14 sm:py-20" : "page-shell py-14 sm:py-20"}>
      <div className={trending ? "page-shell" : undefined}>
        <div className={trending ? "mx-auto max-w-5xl" : "mx-auto max-w-4xl"}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div><p className={`text-xs font-black ${trending ? "text-[#fe2c55]" : "text-[#8b5cf6]"}`}>{trending ? "VIRAL TOP 10" : "JOIN THE CHALLENGE"}</p><h2 className="mt-1 text-2xl font-black tracking-[-0.04em]">{trending ? "바이럴 영상 TOP 10" : "이 챌린지에 참여하기"}</h2></div>
            <ProposalButton className="w-full sm:w-auto" memeId={meme.id} memeTitle={meme.title} section={type} />
          </div>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-black/45">{trending ? "공개 지표와 제보 근거를 바탕으로 정리한 참고 순위예요. 1위만 먼저 불러오고 나머지는 가벼운 미리보기로 보여줍니다." : "나만의 버전이나 재미있는 참여 영상을 추가해 보세요. 영상은 재생하지 않고 링크형 미리보기로 가볍게 불러옵니다."}</p>
          <div className="mt-6">
            {videos.length ? (
              trending ? <ViralVideoGallery videos={videos} /> : <ChallengeVideoRail videos={videos} />
            ) : <EmptyState title={`아직 확인된 ${trending ? "바이럴" : "참여"} 영상이 없어요`} description="첫 번째 영상 링크를 추가해 주세요." />}
          </div>
        </div>
      </div>
    </section>
  );
}

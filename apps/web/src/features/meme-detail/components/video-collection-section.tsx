import { EmptyState } from "@origin/ui";
import { ViralVideoGallery } from "@/features/video-embed/components/viral-video-gallery";
import type { Meme } from "@/types/meme";

export function VideoCollectionSection({ meme, type }: { meme: Meme; type: "trending" | "related" }) {
  const trending = type === "trending";
  const videos = trending ? meme.trendingVideos.slice(0, 3) : meme.relatedVideos;
  return (
    <section className={trending ? "border-y border-black/5 bg-white py-14 sm:py-20" : "page-shell py-14 sm:py-20"}>
      <div className={trending ? "page-shell" : undefined}>
        <div className={trending ? "mx-auto max-w-5xl" : "mx-auto max-w-4xl"}>
          <div><p className={`text-xs font-black ${trending ? "text-[#fe2c55]" : "text-[#8b5cf6]"}`}>{trending ? "USED IN THE WILD · TOP 3" : "MORE"}</p><h2 className="mt-1 text-2xl font-black tracking-[-0.04em]">{trending ? "이 밈을 사용한 영상·자료" : "관련 자료"}</h2></div>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-black/45">영상은 바로 보고, 게시글 자료는 대표 이미지와 원문 링크로 확인할 수 있어요. 가장 대표적인 3개만 보여줍니다.</p>
          <div className="mt-6">
            {videos.length ? (
              <ViralVideoGallery videos={videos} />
            ) : <EmptyState title="아직 등록된 사용 영상·자료가 없어요" description="수정 제안 페이지에서 영상이나 게시글 링크를 알려주세요." />}
          </div>
        </div>
      </div>
    </section>
  );
}

import { ArrowUpRight, Plus } from "lucide-react";

export function SubmissionCta({ memeTitle }: { memeTitle: string }) {
  const issueTitle = encodeURIComponent(`[제보] ${memeTitle} 출처 수정`);
  const issueBody = encodeURIComponent(
    `## 제보 내용\n\n- 더 오래된 원본 / 잘못된 정보 / 타임라인 추가\n\n## 근거 링크\n\n\n## 설명\n\n`,
  );
  const issueUrl = `https://github.com/iftype/meme-origin-timeline/issues/new?title=${issueTitle}&body=${issueBody}`;

  return (
    <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#fe2c55] via-[#ff4d7d] to-[#8b5cf6] p-7 text-white sm:p-10">
      <div className="max-w-xl">
        <span className="flex size-10 items-center justify-center rounded-full bg-white/20">
          <Plus className="size-5" aria-hidden="true" />
        </span>
        <h2 className="mt-5 text-2xl font-black tracking-[-0.04em] sm:text-3xl">
          더 오래된 원본을 알고 있나요?
        </h2>
        <p className="mt-3 text-sm leading-6 text-white/75">
          링크만 남겨도 좋아요. 확인한 뒤 기록에 반영할게요.
        </p>
        <a
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-black text-black transition-transform hover:scale-[1.02]"
          href={issueUrl}
          target="_blank"
          rel="noreferrer"
        >
          원본 제보하기
          <ArrowUpRight className="size-4" aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}

import { ArrowUpRight, GitPullRequestArrow } from "lucide-react";

export function SubmissionCta({ memeTitle }: { memeTitle: string }) {
  const issueTitle = encodeURIComponent(`[제보] ${memeTitle} 출처 수정`);
  const issueBody = encodeURIComponent(
    `## 제보 내용\n\n- 더 오래된 원본 / 잘못된 정보 / 타임라인 추가\n\n## 근거 링크\n\n\n## 설명\n\n`,
  );
  const issueUrl = `https://github.com/iftype/meme-origin-timeline/issues/new?title=${issueTitle}&body=${issueBody}`;

  return (
    <section className="relative overflow-hidden bg-[#f05a28] px-7 py-12 text-white sm:px-12 sm:py-16">
      <div className="absolute -right-14 -top-24 select-none text-[15rem] font-black leading-none text-black/10">
        ?
      </div>
      <div className="relative max-w-2xl">
        <GitPullRequestArrow className="mb-8 size-8" aria-hidden="true" />
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/65">
          Help verify the record
        </p>
        <h2 className="display-serif mt-4 text-4xl leading-[0.98] tracking-[-0.05em] sm:text-6xl">
          더 오래된 원본을
          <br />
          알고 있나요?
        </h2>
        <p className="mt-6 max-w-lg leading-7 text-white/75">
          링크와 발견 경로를 알려주세요. 제보는 검토 후 이 기록의 근거와
          타임라인에 반영됩니다.
        </p>
        <a
          className="mt-9 inline-flex items-center gap-3 rounded-full bg-[#1b1b18] px-6 py-3.5 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
          href={issueUrl}
          target="_blank"
          rel="noreferrer"
        >
          GitHub Issue로 제보
          <ArrowUpRight className="size-4" aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}


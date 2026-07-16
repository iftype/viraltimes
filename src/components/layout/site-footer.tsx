import { GitFork } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-black/15 py-10">
      <div className="page-shell flex flex-col gap-5 text-sm text-black/55 sm:flex-row sm:items-center sm:justify-between">
        <p>누구나 근거를 더할 수 있는 밈 기원 아카이브.</p>
        <a
          className="inline-flex items-center gap-2 font-semibold text-black transition-opacity hover:opacity-55"
          href="https://github.com/iftype/meme-origin-timeline"
          target="_blank"
          rel="noreferrer"
        >
          <GitFork className="size-4" aria-hidden="true" />
          GitHub에서 보기
        </a>
      </div>
    </footer>
  );
}

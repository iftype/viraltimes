import { GitFork } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-black/5 bg-white py-8">
      <div className="page-shell flex flex-col gap-3 text-sm text-black/45 sm:flex-row sm:items-center sm:justify-between">
        <p>밈의 시작을 함께 기록해요.</p>
        <a
          className="inline-flex items-center gap-2 font-bold text-black/65 hover:text-black"
          href="https://github.com/iftype/meme-origin-timeline"
          target="_blank"
          rel="noreferrer"
        >
          <GitFork className="size-4" aria-hidden="true" />
          GitHub
        </a>
      </div>
    </footer>
  );
}

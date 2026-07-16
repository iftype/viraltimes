import { Plus } from "lucide-react";
import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-white/90 backdrop-blur-xl">
      <div className="page-shell flex h-16 items-center justify-between">
        <Link className="flex items-center gap-2.5 font-black" href="/">
          <span className="relative flex size-8 items-center justify-center rounded-xl bg-black text-sm text-white shadow-[-3px_0_0_#25f4ee,3px_0_0_#fe2c55]">
            O
          </span>
          <span className="tracking-[-0.04em]">ORIGIN</span>
        </Link>

        <nav className="flex items-center gap-2 text-sm font-bold">
          <Link
            className="hidden rounded-full px-4 py-2 transition-colors hover:bg-black/5 sm:block"
            href="/#explore"
          >
            밈 찾기
          </Link>
          <a
            className="flex items-center gap-1.5 rounded-full bg-black px-4 py-2 text-white transition-transform hover:scale-[1.02]"
            href="https://github.com/iftype/meme-origin-timeline/issues/new"
            target="_blank"
            rel="noreferrer"
          >
            <Plus className="size-4" aria-hidden="true" />
            제보
          </a>
        </nav>
      </div>
    </header>
  );
}


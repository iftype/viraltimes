"use client";

import { GitFork, Mail, MessageCircleMore } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function SiteFooter({ forceShow = false }: { forceShow?: boolean }) {
  const pathname = usePathname();
  if (!forceShow && (pathname === "/quiz" || pathname === "/feed" || pathname === "/")) return null;

  return (
    <footer className="mt-10 border-t border-black/5 bg-white py-5 sm:mt-16 sm:py-10">
      <div className="page-shell grid gap-4 text-sm sm:grid-cols-[1fr_auto] sm:gap-8">
        <div>
          <div className="flex items-center justify-between gap-3 sm:block">
            <p className="font-black text-black">ViralOrigin</p>
            <p className="text-[0.65rem] text-black/30 sm:mt-4 sm:text-[0.68rem]">© 2026 ViralOrigin</p>
          </div>
          <p className="mt-2 hidden max-w-xl text-xs leading-5 text-black/45 sm:block">
            게시물·영상·음원·이미지의 저작권은 각 원저작자와 권리자에게 있습니다.
            ViralOrigin은 출처와 확산 맥락을 기록하며, 권리 침해 문의는 확인 후 조치합니다.
          </p>
          <details className="mt-2 text-[0.68rem] leading-5 text-black/40 sm:hidden">
            <summary className="font-bold">저작권 안내</summary>
            <p className="mt-1">콘텐츠 저작권은 각 원저작자와 권리자에게 있으며, ViralOrigin은 사전 편집·서비스 구성에 대한 권리만 보유합니다.</p>
          </details>
        </div>
        <nav className="hide-scrollbar flex content-start gap-4 overflow-x-auto whitespace-nowrap border-t border-black/5 pt-3 text-[0.68rem] font-bold text-black/55 sm:grid sm:grid-cols-2 sm:gap-2 sm:overflow-visible sm:border-0 sm:pt-0 sm:text-xs">
          <Link className="inline-flex shrink-0 items-center gap-1.5 hover:text-black" href="/feedback"><MessageCircleMore className="size-3.5" />문의·피드백</Link>
          <Link className="inline-flex shrink-0 items-center gap-1.5 hover:text-black" href="/privacy">개인정보처리방침</Link>
          <a className="inline-flex shrink-0 items-center gap-1.5 hover:text-black" href="mailto:iftype@naver.com"><Mail className="size-3.5" />이메일</a>
          <a
            className="inline-flex shrink-0 items-center gap-1.5 hover:text-black"
            href="https://github.com/iftype/viralorigin"
            target="_blank"
            rel="noreferrer"
          >
            <GitFork className="size-4" aria-hidden="true" />
            GitHub
          </a>
        </nav>
      </div>
    </footer>
  );
}

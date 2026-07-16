import { GitFork, Mail, MessageCircleMore } from "lucide-react";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-black/5 bg-white py-10">
      <div className="page-shell grid gap-8 text-sm sm:grid-cols-[1fr_auto]">
        <div>
          <p className="font-black text-black">ViralOrigin</p>
          <p className="mt-2 max-w-xl text-xs leading-5 text-black/45">
            게시물·영상·음원·이미지의 저작권은 각 원저작자와 권리자에게 있습니다.
            ViralOrigin은 출처와 확산 맥락을 기록하며, 권리 침해 문의는 확인 후 조치합니다.
          </p>
          <p className="mt-4 text-[0.68rem] text-black/30">© 2026 ViralOrigin. 사전 편집·서비스 구성에 대한 권리만 보유합니다.</p>
        </div>
        <nav className="grid content-start gap-2 text-xs font-bold text-black/55 sm:grid-cols-2">
          <Link className="inline-flex items-center gap-2 hover:text-black" href="/feedback"><MessageCircleMore className="size-3.5" />사이트 피드백</Link>
          <Link className="inline-flex items-center gap-2 hover:text-black" href="/privacy">개인정보처리방침</Link>
          <a className="inline-flex items-center gap-2 hover:text-black" href="mailto:iftype@naver.com"><Mail className="size-3.5" />이메일</a>
          <a
          className="inline-flex items-center gap-2 hover:text-black"
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

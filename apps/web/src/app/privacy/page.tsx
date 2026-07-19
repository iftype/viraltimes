import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Card } from "@origin/ui";

export const metadata: Metadata = {
  title: "개인정보처리방침",
  description: "ViralOrigin 개인정보 처리 기준을 안내합니다.",
};

const sections = [
  {
    title: "1. 처리하는 정보",
    body: "제보·피드백·댓글·수정 제안 시 사용자가 입력한 닉네임, 본문, 관련 링크를 처리합니다. 닉네임은 선택이며 실제 이름이나 연락처 입력을 요구하지 않습니다. 댓글과 수정 제안 저장 파일에는 IP 주소를 기록하지 않지만, 악용 방지를 위한 단기 작성 제한과 서버 운영 로그에는 요청 주소와 시각이 일시적으로 남을 수 있습니다.",
  },
  {
    title: "2. 이용 목적과 보관",
    body: "입력 정보는 사전 검토, 문의 응답, 서비스 악용 방지에 사용합니다. 운영 목적이 끝나거나 삭제 요청이 타당한 경우 지체 없이 삭제합니다. 구체적인 로그 보관 기간은 데이터베이스·모니터링 도입 전에 확정해 이 문서에 반영합니다.",
  },
  {
    title: "3. 제3자 제공과 외부 콘텐츠",
    body: "입력 정보를 별도 동의 없이 제3자에게 판매하거나 제공하지 않습니다. 다만 YouTube, Instagram, TikTok 등 외부 영상 임베드를 열면 해당 플랫폼이 자체 정책에 따라 접속 정보를 처리할 수 있습니다.",
  },
  {
    title: "4. 방문 분석",
    body: "서비스 개선을 위해 Vercel Web Analytics로 방문 시각, 페이지 경로, 유입 경로, 국가·지역 수준의 위치, 기기·운영체제·브라우저 종류 같은 집계 정보를 처리합니다. 밈 인지도 퀴즈는 브라우저에 생성한 무작위 세션 ID와 카드별 응답(알아요·몰라요·상세 열람·설명 도움 여부)을 저장하며 이름, 이메일, 계정 정보는 수집하지 않습니다. 댓글·제보 본문이나 이메일 주소를 분석 이벤트에 넣지 않습니다.",
  },
  {
    title: "5. AI 보조 편집",
    body: "관리자가 링크 자동 채우기를 실행하면 공개 게시물의 제목·설명·사이트 이름과 URL을 Google Gemma API에 보내 한 줄 설명 초안을 만들 수 있습니다. 사용자 닉네임, 문의·댓글 본문은 보내지 않으며 AI 초안은 운영자가 확인한 뒤에만 공개합니다.",
  },
  {
    title: "6. 문의와 권리 행사",
    body: "열람, 정정, 삭제, 처리정지 또는 저작권 관련 요청은 iftype@naver.com이나 문의·피드백 폼으로 접수할 수 있습니다. 본 방침은 실제 수집 항목과 인프라 변경 시 함께 개정합니다.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="page-shell py-8 sm:py-12">
      <article className="mx-auto max-w-3xl">
        <Link className="inline-flex items-center gap-1.5 text-sm font-bold text-black/45 hover:text-black" href="/"><ArrowLeft className="size-4" />돌아가기</Link>
        <p className="mt-8 text-xs font-black text-[#fe2c55]">PRIVACY</p>
        <h1 className="mt-2 text-4xl font-black tracking-[-0.055em]">개인정보처리방침</h1>
        <p className="mt-3 text-sm leading-6 text-black/45">시행일 2026년 7월 16일 · 현재 프로토타입의 실제 데이터 흐름을 기준으로 작성했습니다.</p>
        <div className="mt-7 space-y-3">
          {sections.map((section) => (
            <Card className="p-5 shadow-none sm:p-6" key={section.title}>
              <h2 className="font-black">{section.title}</h2>
              <p className="mt-2 text-sm leading-7 text-black/55">{section.body}</p>
            </Card>
          ))}
        </div>
        <p className="mt-6 rounded-xl bg-[#fff7df] px-4 py-3 text-xs leading-5 text-[#795000]">정식 운영, 회원가입, 광고·분석 도구 또는 외부 저장소 도입 전 법률 검토와 보관 기간 확정이 필요합니다.</p>
      </article>
    </div>
  );
}

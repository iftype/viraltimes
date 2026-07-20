"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

const storageKey = "viralorigin-clarity-consent";
type ConsentChoice = "accepted" | "declined";

export function ClarityConsent() {
  const projectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID?.trim() ?? "";
  const enabled = /^[a-z0-9]{6,32}$/i.test(projectId);
  const [choice, setChoice] = useState<ConsentChoice | null | undefined>(undefined);

  useEffect(() => {
    void Promise.resolve().then(() => {
      const stored = window.localStorage.getItem(storageKey);
      setChoice(stored === "accepted" || stored === "declined" ? stored : null);
    });
  }, []);

  if (!enabled || choice === undefined) return null;

  const choose = (next: ConsentChoice) => {
    window.localStorage.setItem(storageKey, next);
    setChoice(next);
  };

  return (
    <>
      {choice === "accepted" && (
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);c[a]("consent");})(window,document,"clarity","script","${projectId}");`}
        </Script>
      )}
      {choice === null && (
        <aside aria-label="방문 분석 동의" className="fixed bottom-3 left-1/2 z-[80] w-[calc(100%-1.5rem)] max-w-xl -translate-x-1/2 rounded-2xl border border-white/15 bg-black p-4 text-white shadow-2xl sm:bottom-5 sm:flex sm:items-center sm:gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-black">서비스 개선용 방문 분석</p>
            <p className="mt-1 text-[0.68rem] leading-5 text-white/60">동의하면 Microsoft Clarity가 클릭·스크롤·화면 이용 흐름을 기록합니다. 입력한 댓글과 제보 내용은 분석 이벤트로 보내지 않습니다.</p>
          </div>
          <div className="mt-3 grid shrink-0 grid-cols-2 gap-2 sm:mt-0">
            <button className="rounded-xl bg-white/12 px-4 py-2.5 text-xs font-black text-white" onClick={() => choose("declined")} type="button">거절</button>
            <button className="rounded-xl bg-white px-4 py-2.5 text-xs font-black text-black" onClick={() => choose("accepted")} type="button">동의</button>
          </div>
        </aside>
      )}
    </>
  );
}

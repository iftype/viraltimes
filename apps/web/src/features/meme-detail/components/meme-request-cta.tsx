import { ArrowUpRight, Plus } from "lucide-react";
import Link from "next/link";

import { buttonClassName } from "@origin/ui";

export function MemeRequestCta() {
  return (
    <aside className="page-shell pb-12 sm:pb-16">
      <div className="mx-auto flex max-w-3xl flex-col gap-4 rounded-2xl bg-black p-5 text-white sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div><p className="font-black">원하는 밈이 없나요?</p><p className="mt-1 text-xs leading-5 text-white/55">영상이나 게시글 링크 하나만 보내주면 운영자가 사전에 정리합니다.</p></div>
        <Link className={buttonClassName({ variant: "secondary", className: "shrink-0 border-white/10 bg-white text-black" })} href="/submit?type=request"><Plus className="size-4" />추가하러 가기<ArrowUpRight className="size-4" /></Link>
      </div>
    </aside>
  );
}

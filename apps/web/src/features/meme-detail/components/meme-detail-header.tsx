import { ArrowLeft, CalendarDays, Check, CircleHelp, Clock3 } from "lucide-react";
import Link from "next/link";

import { Badge } from "@origin/ui";
import { ProposalButton } from "@/features/contributions/components/proposal-button";
import { ProposalTabLink } from "@/features/contributions/components/proposal-tab-link";
import { fallbackCategories } from "@/features/search/lib/categories";
import type { Meme, OriginStatus } from "@/types/meme";

const statusMeta: Record<OriginStatus, { label: string; icon: typeof Check; className: string }> = {
  verified: { label: "출처 확인", icon: Check, className: "bg-[#e8fff4] text-[#14804a]" },
  likely: { label: "유력한 원본", icon: Clock3, className: "bg-[#fff7df] text-[#9a6200]" },
  "needs-review": { label: "검토 필요", icon: CircleHelp, className: "bg-[#f4efff] text-[#7047a5]" },
};

export function MemeDetailHeader({ meme }: { meme: Meme }) {
  const status = statusMeta[meme.origin.status];
  const StatusIcon = status.icon;
  const categories = meme.categories?.length
    ? meme.categories
    : fallbackCategories.filter((category) => meme.categoryIds.includes(category.id));
  return (
    <header className="page-shell py-8 sm:py-12">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between gap-3">
          <Link className="inline-flex items-center gap-1.5 text-sm font-bold text-black/45 hover:text-black" href="/">
            <ArrowLeft className="size-4" /> 돌아가기
          </Link>
          <ProposalTabLink initialCount={meme.participation?.proposalCount} memeId={meme.id} />
        </div>
        <div className="mt-7 flex flex-wrap items-center gap-2">
          <Badge className={status.className}><StatusIcon className="size-3.5" />{status.label}</Badge>
          {meme.lifecycle?.originYear && (
            <Badge className="bg-black/5 text-black/55">
              <CalendarDays className="size-3.5" /> {meme.lifecycle.originYear}년 시작
              {meme.lifecycle.ageYears !== undefined && ` · ${meme.lifecycle.ageYears === 0 ? "올해" : `${meme.lifecycle.ageYears}년 전`}`}
            </Badge>
          )}
          <a className="text-xs font-black text-[#7047a5]" href="#proposals">수정 제안 {meme.participation?.proposalCount ?? 0}</a>
          <span className="text-xs font-medium text-black/35">{meme.origin.lastReviewedAt} 업데이트</span>
        </div>
        <h1 className="mt-5 text-5xl font-black leading-none tracking-[-0.065em] sm:text-7xl">{meme.title}</h1>
        <p className="mt-3 text-sm font-medium text-black/35">{meme.aliases.join(" · ")}</p>
        <p className="mt-3 text-xs leading-5 text-black/35">
          {meme.title} 원본·원조를 확인하세요.
          {meme.aliases.length > 0 && ` ${meme.aliases.slice(0, 4).map((alias) => `${alias} 원조`).join(", ")}로 검색되는 같은 밈·챌린지의 근거와 확산 과정도 함께 정리합니다.`}
        </p>
        <p className="mt-6 max-w-2xl text-base leading-7 text-black/60 sm:text-lg">{meme.summary}</p>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          {categories.map((category) => <Badge className="bg-black text-white" key={category.id}>{category.label}</Badge>)}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {meme.tags.map((tag) => <span className="text-xs font-bold text-black/35" key={tag}>#{tag}</span>)}
          <ProposalButton memeId={meme.id} memeTitle={meme.title} section="description" />
        </div>
      </div>
    </header>
  );
}

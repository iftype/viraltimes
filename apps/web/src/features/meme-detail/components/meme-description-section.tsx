import { Badge } from "@origin/ui";
import { fallbackCategories } from "@/features/search/lib/categories";
import type { Meme } from "@/types/meme";

export function MemeDescriptionSection({ meme }: { meme: Meme }) {
  const categories = meme.categories?.length
    ? meme.categories
    : fallbackCategories.filter((category) => meme.categoryIds.includes(category.id));

  return (
    <section className="page-shell pb-10 sm:pb-14">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-5 sm:p-7">
        <p className="text-xs font-black text-[#25a9a4]">WHAT IT MEANS</p>
        <h2 className="mt-1 text-xl font-black tracking-[-0.035em]">이 밈은 어떤 뜻인가요?</h2>
        <p className="mt-4 text-sm leading-7 text-black/60 sm:text-base">
          {meme.summary || "아직 설명을 정리하고 있습니다. 수정 제안 페이지에서 알고 있는 내용을 알려주세요."}
        </p>
        {meme.origin.summary && meme.origin.summary !== meme.summary && (
          <p className="mt-3 text-sm leading-6 text-black/45">{meme.origin.summary}</p>
        )}
        <div className="mt-5 flex flex-wrap items-center gap-2">
          {categories.map((category) => <Badge className="bg-black/5 text-black/55" key={category.id}>{category.label}</Badge>)}
          {meme.tags.map((tag) => <span className="text-xs font-bold text-black/35" key={tag}>#{tag}</span>)}
        </div>
      </div>
    </section>
  );
}

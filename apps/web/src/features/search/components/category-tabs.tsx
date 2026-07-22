import { Badge, cn } from "@origin/ui";
import type { MemeCategory } from "@/types/meme";

export function CategoryTabs({
  active,
  categories,
  counts,
  onChange,
}: {
  active: string;
  categories: MemeCategory[];
  counts: Record<string, number>;
  onChange: (category: string) => void;
}) {
  return (
    <div
      aria-label="밈 카테고리"
      className="hide-scrollbar flex gap-2 overflow-x-auto pb-2"
      role="tablist"
    >
      {[{ id: "all", label: "전체" }, ...categories].map((category) => {
        const selected = category.id === active;
        return (
          <button
            aria-selected={selected}
            className={cn(
              "flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1.5 text-[0.65rem] font-black transition sm:gap-2 sm:px-4 sm:py-2.5 sm:text-xs",
              selected
                ? "bg-black text-white"
                : "border border-black/5 bg-white text-black/50 hover:border-black/20 hover:text-black",
            )}
            key={category.id}
            onClick={() => onChange(category.id)}
            role="tab"
            type="button"
          >
            {category.label}
            <Badge
              className={cn(
                "hidden min-w-5 justify-center px-1.5 py-0.5 text-[0.62rem] sm:inline-flex",
                selected ? "bg-white/20 text-white" : "bg-black/5",
              )}
            >
              {counts[category.id]}
            </Badge>
          </button>
        );
      })}
    </div>
  );
}

import { CalendarClock } from "lucide-react";

import { Badge, cn } from "@origin/ui";

export type YearFilter = "all" | "recent" | number;

export function YearTabs({
  active,
  counts,
  onChange,
  years,
}: {
  active: YearFilter;
  counts: Record<string, number>;
  onChange: (filter: YearFilter) => void;
  years: number[];
}) {
  const tabs: Array<{ id: YearFilter; label: string }> = [
    { id: "all", label: "모든 연도" },
    { id: "recent", label: "최신 밈" },
    ...years.map((year) => ({ id: year, label: `${year}` })),
  ];

  return (
    <div aria-label="유행 시작 연도" className="hide-scrollbar flex gap-2 overflow-x-auto pb-2" role="tablist">
      {tabs.map((tab) => {
        const selected = tab.id === active;
        const key = String(tab.id);
        return (
          <button
            aria-selected={selected}
            className={cn(
              "inline-flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2 text-xs font-black transition",
              selected
                ? "bg-[#25c4bd] text-white"
                : "border border-black/5 bg-white text-black/45 hover:text-black",
            )}
            key={key}
            onClick={() => onChange(tab.id)}
            role="tab"
            type="button"
          >
            {tab.id === "recent" && <CalendarClock className="size-3.5" aria-hidden="true" />}
            {tab.label}
            <Badge className={cn("px-1.5 py-0.5 text-[0.62rem]", selected ? "bg-white/20 text-white" : "bg-black/5")}>
              {counts[key] ?? 0}
            </Badge>
          </button>
        );
      })}
    </div>
  );
}

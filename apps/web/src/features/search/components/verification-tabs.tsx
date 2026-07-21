import { Badge, cn } from "@origin/ui";

export type VerificationFilter = "all" | "verified" | "open";

const tabs: Array<{ id: VerificationFilter; label: string }> = [
  { id: "all", label: "전체" },
  { id: "verified", label: "원본 확인됨" },
  { id: "open", label: "유력·검토 중" },
];

export function VerificationTabs({
  active,
  counts,
  onChange,
}: {
  active: VerificationFilter;
  counts: Record<VerificationFilter, number>;
  onChange: (filter: VerificationFilter) => void;
}) {
  return (
    <div aria-label="원본 확인 상태" className="w-full flex items-center p-0.5 rounded-xl bg-zinc-100/90 border border-zinc-200/60 shadow-inner gap-0.5" role="tablist">
      {tabs.map((tab) => {
        const selected = tab.id === active;
        return (
          <button
            aria-selected={selected}
            className={cn(
              "flex-1 inline-flex items-center justify-center gap-1 rounded-lg py-1.5 px-2 text-[0.72rem] transition-all duration-200 cursor-pointer font-bold",
              selected
                ? "bg-black text-white shadow-sm font-black"
                : "text-zinc-500 hover:text-zinc-900 hover:bg-black/5",
            )}
            key={tab.id}
            onClick={() => onChange(tab.id)}
            role="tab"
            type="button"
          >
            <span>{tab.label}</span>
            <Badge className={cn("px-1 py-0.2 text-[0.58rem] font-bold rounded-md", selected ? "bg-white/20 text-white" : "bg-black/8 text-zinc-600")}>
              {counts[tab.id]}
            </Badge>
          </button>
        );
      })}
    </div>
  );
}

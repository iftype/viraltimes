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
    <div aria-label="원본 확인 상태" className="flex flex-wrap gap-2" role="tablist">
      {tabs.map((tab) => {
        const selected = tab.id === active;
        return (
          <button
            aria-selected={selected}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-black transition",
              selected ? "bg-[#fe2c55] text-white" : "bg-white text-black/45 hover:text-black",
            )}
            key={tab.id}
            onClick={() => onChange(tab.id)}
            role="tab"
            type="button"
          >
            {tab.label}
            <Badge className={cn("px-1.5 py-0.5 text-[0.62rem]", selected ? "bg-white/20 text-white" : "bg-black/5")}>{counts[tab.id]}</Badge>
          </button>
        );
      })}
    </div>
  );
}

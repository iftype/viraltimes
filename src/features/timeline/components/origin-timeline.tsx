import {
  AudioLines,
  CircleDot,
  GitBranch,
  Radio,
  Sparkles,
} from "lucide-react";

import type { TimelineEvent, TimelineEventKind } from "@/types/meme";

const kindMeta: Record<
  TimelineEventKind,
  { label: string; icon: typeof CircleDot }
> = {
  origin: { label: "시작", icon: CircleDot },
  spread: { label: "확산", icon: Radio },
  variation: { label: "변형", icon: GitBranch },
  mainstream: { label: "대중화", icon: Sparkles },
  remix: { label: "리믹스", icon: AudioLines },
};

export function OriginTimeline({ events }: { events: TimelineEvent[] }) {
  return (
    <ol className="border-t border-black/15">
      {events.map((event, index) => {
        const meta = kindMeta[event.kind];
        const Icon = meta.icon;

        return (
          <li
            className="grid gap-5 border-b border-black/15 py-8 sm:grid-cols-[6rem_10rem_1fr] sm:gap-8 sm:py-10"
            key={event.id}
          >
            <span className="text-xs font-bold tabular-nums text-black/35">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div>
              <p className="text-sm font-bold">{event.dateLabel}</p>
              <span className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-black/15 px-2.5 py-1 text-[0.65rem] font-bold text-black/50">
                <Icon className="size-3" aria-hidden="true" />
                {meta.label}
              </span>
            </div>
            <div>
              <h3 className="display-serif text-2xl tracking-[-0.035em] sm:text-3xl">
                {event.title}
              </h3>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-black/55 sm:text-base sm:leading-7">
                {event.description}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}


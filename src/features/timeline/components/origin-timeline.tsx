import type { TimelineEvent } from "@/types/meme";

const kindLabels = {
  origin: "시작",
  spread: "확산",
  variation: "변형",
  mainstream: "대중화",
  remix: "리믹스",
};

export function OriginTimeline({ events }: { events: TimelineEvent[] }) {
  return (
    <ol className="relative ml-1 before:absolute before:bottom-4 before:left-[11px] before:top-4 before:w-0.5 before:bg-gradient-to-b before:from-[#fe2c55] before:via-[#8b5cf6] before:to-[#25c4bd]">
      {events.map((event, index) => (
        <li className="relative pb-10 pl-12 last:pb-0" key={event.id}>
          <span className="absolute left-0 top-1 z-10 flex size-6 items-center justify-center rounded-full border-4 border-white bg-black text-[0.55rem] font-bold text-white shadow-sm">
            {index + 1}
          </span>

          <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-[0_6px_20px_rgba(0,0,0,0.04)] sm:p-6">
            <div className="flex flex-wrap items-center gap-2">
              <time className="text-xs font-black text-[#fe2c55]">
                {event.dateLabel}
              </time>
              <span className="rounded-full bg-black/5 px-2.5 py-1 text-[0.65rem] font-bold text-black/45">
                {kindLabels[event.kind]}
              </span>
            </div>
            <h3 className="mt-3 text-lg font-black tracking-[-0.025em] sm:text-xl">
              {event.title}
            </h3>
            <p className="mt-2 text-sm leading-6 text-black/50">
              {event.description}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}


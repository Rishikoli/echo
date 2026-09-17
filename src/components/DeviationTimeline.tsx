import type { DeviationEvent } from "@/lib/types";
import { formatDate } from "@/lib/visual";

export default function DeviationTimeline({ events }: { events: DeviationEvent[] }) {
  return (
    <ol className="relative border-l-2 border-border-soft ml-2 space-y-5">
      {events.map((e, i) => (
        <li key={i} className="ml-4">
          <span className="absolute -left-[7px] mt-1.5 h-3 w-3 rounded-full bg-brand-500 ring-4 ring-surface" />
          <div className="flex items-baseline gap-2">
            <span className="text-xs font-semibold text-brand-700 dark:text-brand-400">{formatDate(e.date)}</span>
            <span className="text-[11px] uppercase tracking-wide text-foreground/40">{e.domain}</span>
          </div>
          <p className="text-sm text-foreground/75 mt-0.5">{e.summary}</p>
        </li>
      ))}
    </ol>
  );
}

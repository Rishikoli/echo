import type { EvidenceItem } from "@/lib/types";
import { formatDate, SOURCE_LABEL } from "@/lib/visual";
import ConfidenceBadge from "./ConfidenceBadge";

export default function EvidenceList({ items }: { items: EvidenceItem[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-foreground/50">No evidence items match this query.</p>;
  }
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item.id} className="rounded-xl bg-surface-muted px-3.5 py-3">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-400">
              {SOURCE_LABEL[item.source] ?? item.source}
            </span>
            <span className="text-[11px] text-foreground/40">{formatDate(item.date)}</span>
          </div>
          <p className="text-sm text-foreground/80">{item.summary}</p>
          <div className="mt-1.5">
            <ConfidenceBadge confidence={item.confidence} />
          </div>
        </li>
      ))}
    </ul>
  );
}

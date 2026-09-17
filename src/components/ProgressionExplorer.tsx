"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import ProgressionChart, { type ChartSeries } from "./ProgressionChart";
import DeviationTimeline from "./DeviationTimeline";
import EvidenceList from "./EvidenceList";
import Card from "./Card";
import { DOMAIN_COLORS } from "@/lib/visual";
import { domainLabels, type DomainProgress } from "@/lib/twin";
import type { DeviationEvent, EvidenceItem } from "@/lib/types";
import { HISTORICAL_WINDOW } from "@/lib/mockData";

const DOMAIN_ORDER = ["memory", "language", "executive", "spatial", "attention", "processingSpeed", "function", "routine"];
const RANGES = ["3M", "6M", "ALL"] as const;
type Range = (typeof RANGES)[number];
const HISTORICAL_DOMAINS = new Set(["memory", "language", "routine"]);

export default function ProgressionExplorer({
  domainProgressList,
  firstChange,
  similarPeriod,
  evidence,
}: {
  domainProgressList: DomainProgress[];
  firstChange: DeviationEvent[];
  similarPeriod: ReturnType<typeof import("@/lib/tools").find_similar_period>;
  evidence: EvidenceItem[];
}) {
  const [selected, setSelected] = useState<string[]>(["memory", "language", "routine"]);
  const [range, setRange] = useState<Range>("6M");

  const byDomain = useMemo(() => new Map(domainProgressList.map((d) => [d.domain, d])), [domainProgressList]);

  const series: ChartSeries[] = selected.map((key) => {
    const d = byDomain.get(key)!;
    let points = d.series;
    if (range === "3M") points = points.slice(-3);
    if (range === "ALL" && HISTORICAL_DOMAINS.has(key)) {
      const histPoints = HISTORICAL_WINDOW.snapshots.map((s) => ({
        label: s.label,
        value: (s as unknown as Record<string, number>)[key],
      }));
      points = [...histPoints, ...points];
    }
    return { key, label: (domainLabels as Record<string, string>)[key] ?? key, color: DOMAIN_COLORS[key], points };
  });

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="flex flex-wrap gap-1.5">
            {DOMAIN_ORDER.map((key) => (
              <button
                key={key}
                onClick={() =>
                  setSelected((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]))
                }
                className={clsx(
                  "text-xs font-medium rounded-full px-3 py-1.5 transition-colors",
                  selected.includes(key) ? "text-white" : "text-foreground/55 bg-surface-muted hover:text-foreground"
                )}
                style={selected.includes(key) ? { background: DOMAIN_COLORS[key] } : undefined}
              >
                {(domainLabels as Record<string, string>)[key] ?? key}
              </button>
            ))}
          </div>
          <div className="flex gap-1 rounded-full bg-surface-muted p-1">
            {RANGES.map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={clsx(
                  "text-xs font-medium rounded-full px-3 py-1 transition-colors",
                  range === r ? "bg-brand-600 text-white" : "text-foreground/55 hover:text-foreground"
                )}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
        <ProgressionChart series={series} height={280} />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-sm font-semibold text-foreground mb-4">First detected change</h2>
          <DeviationTimeline events={firstChange} />
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-foreground mb-3">Historical comparison</h2>
          <div className="grid grid-cols-2 gap-3 text-sm mb-3">
            <div className="rounded-xl bg-surface-muted p-3.5">
              <div className="text-[11px] uppercase tracking-wide text-foreground/40 mb-1">Current period</div>
              <div className="text-foreground/80">{similarPeriod.current.label}</div>
              <div className="text-rose-700 dark:text-rose-400 text-xs mt-1">Memory ↓ · Speech ↓ · Routine ↓</div>
            </div>
            <div className="rounded-xl bg-surface-muted p-3.5">
              <div className="text-[11px] uppercase tracking-wide text-foreground/40 mb-1">Historical period</div>
              <div className="text-foreground/80">{similarPeriod.historical.label}</div>
              <div className="text-rose-700 dark:text-rose-400 text-xs mt-1">Memory ↓ · Speech ↓ · Routine ↓</div>
            </div>
          </div>
          <p className="text-xs text-foreground/50">{similarPeriod.historical.note}</p>
          <p className="text-xs text-foreground/40 mt-1 italic">{similarPeriod.caveat}</p>
        </Card>
      </div>

      <Card>
        <h2 className="text-sm font-semibold text-foreground mb-3">Evidence</h2>
        <EvidenceList items={evidence} />
      </Card>
    </div>
  );
}

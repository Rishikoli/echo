"use client";

import Link from "next/link";
import type { BrainRegionState } from "@/lib/types";
import { domainLabels } from "@/lib/twin";
import { get_evidence } from "@/lib/tools";
import { formatDate, trendArrow, TREND_LABEL } from "@/lib/visual";
import StatePill from "./StatePill";
import EvidenceList from "./EvidenceList";
import Card from "./Card";

export default function RegionDetailPanel({
  region,
  asOfDate,
}: {
  region: BrainRegionState | null;
  asOfDate?: string;
}) {
  if (!region) {
    return (
      <div className="rounded-2xl border border-dashed border-border-soft p-6 text-center text-sm text-foreground/40">
        Select a brain region to see its current state, baseline, and supporting evidence.
      </div>
    );
  }

  if (region.domains.length === 0) {
    return (
      <Card>
        <h2 className="font-display text-lg font-semibold text-foreground mb-1">{region.label}</h2>
        <StatePill state={region.state} />
        <p className="text-sm text-foreground/55 mt-3 leading-relaxed">
          This structure supports basic regulation and coordination but is not independently tracked as a
          cognitive domain in this demo.
        </p>
      </Card>
    );
  }

  const evidence = region.domains.flatMap((d) => get_evidence(domainLabels[d], asOfDate)).slice(0, 6);
  const domainNames = region.domains.map((d) => domainLabels[d]).join(" & ");

  return (
    <Card className="space-y-5">
      <div>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-foreground">{region.label}</h2>
          <StatePill state={region.state} />
        </div>
        <p className="text-xs text-foreground/40 mt-0.5">Tracks: {domainNames}</p>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        <div>
          <div className="font-display text-2xl font-semibold text-foreground tabular-nums">{region.current}</div>
          <div className="text-[11px] text-foreground/40 mt-0.5">Current state</div>
        </div>
        <div>
          <div className="font-display text-2xl font-semibold text-foreground/35 tabular-nums">{region.baseline}</div>
          <div className="text-[11px] text-foreground/40 mt-0.5">Personal baseline</div>
        </div>
        <div>
          <div
            className={`font-display text-2xl font-semibold tabular-nums ${
              region.change < 0 ? "text-rose-700 dark:text-rose-400" : "text-sage-700 dark:text-sage-400"
            }`}
          >
            {trendArrow(region.trend)} {Math.abs(region.change)}
          </div>
          <div className="text-[11px] text-foreground/40 mt-0.5">Change</div>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm border-t border-b border-border-soft py-3">
        <span className="text-foreground/50">Trend</span>
        <span className="font-medium text-foreground">{TREND_LABEL[region.trend]}</span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-foreground/50">Earliest detected deviation</span>
        <span className="font-medium text-foreground">
          {region.earliestDeviation ? formatDate(region.earliestDeviation) : "None detected yet"}
        </span>
      </div>

      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-foreground/40 mb-2">Evidence</h3>
        <EvidenceList items={evidence} />
      </div>

      <div className="flex flex-wrap gap-2 pt-2">
        <Link href="/progression" className="text-xs font-medium rounded-full bg-surface-muted px-3.5 py-1.5 hover:text-brand-700 dark:hover:text-brand-400 transition-colors">
          View Timeline
        </Link>
        <Link href="/investigate" className="text-xs font-medium rounded-full bg-surface-muted px-3.5 py-1.5 hover:text-brand-700 dark:hover:text-brand-400 transition-colors">
          View Evidence
        </Link>
        <Link href="/investigate" className="text-xs font-medium rounded-full bg-surface-muted px-3.5 py-1.5 hover:text-brand-700 dark:hover:text-brand-400 transition-colors">
          Find Similar Period
        </Link>
      </div>
    </Card>
  );
}

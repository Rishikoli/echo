"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import BrainTwin from "./BrainTwin";
import RegionDetailPanel from "./RegionDetailPanel";
import StatePill from "./StatePill";
import Card from "./Card";
import TimelineScrubber from "./TimelineScrubber";
import { brainTwinState, monthEndDate } from "@/lib/twin";
import { MONTHLY_SNAPSHOTS } from "@/lib/mockData";

const MONTH_LABELS = MONTHLY_SNAPSHOTS.map((s) => s.label);
const LATEST_INDEX = MONTHLY_SNAPSHOTS.length - 1;

export default function BrainExplorer({ svgMarkup }: { svgMarkup: string }) {
  const searchParams = useSearchParams();
  const queryRegion = searchParams.get("region");
  // Manual clicks take priority over the initial ?region= query param; once the
  // visitor picks a region directly, further URL changes shouldn't override them.
  const [manualKey, setManualKey] = useState<string | null>(null);
  const selectedKey = manualKey ?? queryRegion;

  const [monthIndex, setMonthIndex] = useState(LATEST_INDEX);
  const [playing, setPlaying] = useState(false);

  const regions = useMemo(() => brainTwinState(monthIndex), [monthIndex]);
  const asOfDate = useMemo(() => monthEndDate(monthIndex), [monthIndex]);
  const selected = regions.find((r) => r.key === selectedKey) ?? null;
  const isPastState = monthIndex < LATEST_INDEX;

  return (
    <div className="space-y-5">
      <TimelineScrubber
        labels={MONTH_LABELS}
        value={monthIndex}
        onChange={setMonthIndex}
        playing={playing}
        onPlayingChange={setPlaying}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        <Card className="p-4">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            {regions.map((r) => (
              <button
                key={r.key}
                onClick={() => setManualKey(r.key)}
                className={`text-left rounded-full transition-shadow ${
                  selectedKey === r.key ? "ring-2 ring-brand-400 ring-offset-2 ring-offset-surface" : ""
                }`}
              >
                <div className="flex items-center gap-1.5 rounded-full bg-surface-muted px-3 py-1.5">
                  <span className="text-xs font-medium text-foreground/75">{r.label}</span>
                  <StatePill state={r.state} />
                </div>
              </button>
            ))}
            {isPastState && (
              <span className="text-[11px] text-foreground/40 ml-auto">
                Viewing {MONTH_LABELS[monthIndex]} 2026 — not the latest state
              </span>
            )}
          </div>
          <BrainTwin svgMarkup={svgMarkup} regions={regions} selectedKey={selectedKey} onSelect={setManualKey} />
        </Card>
        <div>
          <RegionDetailPanel region={selected} asOfDate={asOfDate} />
        </div>
      </div>
    </div>
  );
}

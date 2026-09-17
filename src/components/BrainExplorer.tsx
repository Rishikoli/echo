"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import BrainTwin from "./BrainTwin";
import RegionDetailPanel from "./RegionDetailPanel";
import StatePill from "./StatePill";
import Card from "./Card";
import type { BrainRegionState } from "@/lib/types";

export default function BrainExplorer({ svgMarkup, regions }: { svgMarkup: string; regions: BrainRegionState[] }) {
  const searchParams = useSearchParams();
  const queryRegion = searchParams.get("region");
  // Manual clicks take priority over the initial ?region= query param; once the
  // visitor picks a region directly, further URL changes shouldn't override them.
  const [manualKey, setManualKey] = useState<string | null>(null);
  const selectedKey = manualKey ?? queryRegion;

  const selected = regions.find((r) => r.key === selectedKey) ?? null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
      <Card className="p-4">
        <div className="mb-3 flex flex-wrap gap-2">
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
        </div>
        <BrainTwin svgMarkup={svgMarkup} regions={regions} selectedKey={selectedKey} onSelect={setManualKey} />
      </Card>
      <div>
        <RegionDetailPanel region={selected} />
      </div>
    </div>
  );
}

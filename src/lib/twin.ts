// ECHO — progression engine
// Computes personal baselines, deviations, and trends from the mock longitudinal
// dataset. This is the "Progression Engine" described in the spec: it never compares
// the patient to a population average — only to their own historical baseline.
//
// Every "current state" function accepts an optional `asOfIndex` into
// MONTHLY_SNAPSHOTS (0 = Jan .. 5 = Jun). Omitting it defaults to the latest month,
// so existing callers are unaffected. Passing it is what powers the Brain Twin's
// timeline scrubber — the exact same computation just re-run "as of" an earlier month.

import { MONTHLY_SNAPSHOTS, SPEECH_SESSIONS } from "./mockData";
import type {
  BrainRegionState,
  CognitiveDomainKey,
  Trend,
  RegionVisualState,
} from "./types";

type SnapshotDomainKey = Exclude<CognitiveDomainKey, "orientation"> | "function" | "routine";

const BASELINE_WINDOW = 2; // first N months define the personal baseline
const first = MONTHLY_SNAPSHOTS.slice(0, BASELINE_WINDOW);
const LATEST_INDEX = MONTHLY_SNAPSHOTS.length - 1;

function avg(values: number[]): number {
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function clampIndex(index: number): number {
  return Math.min(LATEST_INDEX, Math.max(0, index));
}

// Last calendar day covered by a given month index — used to filter evidence/events
// down to "everything known as of this point in the scrubbed timeline."
export function monthEndDate(asOfIndex: number = LATEST_INDEX): string {
  const month = MONTHLY_SNAPSHOTS[clampIndex(asOfIndex)].month; // "2026-03"
  const [year, mon] = month.split("-").map(Number);
  const lastDay = new Date(year, mon, 0).getDate();
  return `${month}-${String(lastDay).padStart(2, "0")}`;
}

export function personalBaseline(domain: SnapshotDomainKey): number {
  return Math.round(avg(first.map((s) => s[domain])) * 10) / 10;
}

export function currentValue(domain: SnapshotDomainKey, asOfIndex: number = LATEST_INDEX): number {
  return MONTHLY_SNAPSHOTS[clampIndex(asOfIndex)][domain];
}

export function trendFor(domain: SnapshotDomainKey, asOfIndex: number = LATEST_INDEX): Trend {
  const idx = clampIndex(asOfIndex);
  const baseline = personalBaseline(domain);
  const current = currentValue(domain, idx);
  const previousMonth = MONTHLY_SNAPSHOTS[Math.max(0, idx - 1)];
  const delta = current - baseline;
  const recentDelta = current - previousMonth[domain];
  if (Math.abs(delta) < 3) return "stable";
  if (delta < 0 && Math.abs(recentDelta) < 2) return "stable_to_mild_change";
  return delta < 0 ? "declining" : "improving";
}

export function visualStateFor(delta: number): RegionVisualState {
  const abs = Math.abs(delta);
  if (abs < 3) return "stable";
  if (abs < 9) return "changing";
  return "declining";
}

export interface DomainProgress {
  domain: string;
  baseline: number;
  current: number;
  change: number;
  trend: Trend;
  series: { label: string; value: number }[];
}

const DOMAIN_KEYS: SnapshotDomainKey[] = [
  "memory",
  "language",
  "executive",
  "spatial",
  "attention",
  "processingSpeed",
  "function",
  "routine",
];

export function allDomainProgress(asOfIndex: number = LATEST_INDEX): DomainProgress[] {
  const idx = clampIndex(asOfIndex);
  return DOMAIN_KEYS.map((domain) => {
    const baseline = personalBaseline(domain);
    const current = currentValue(domain, idx);
    return {
      domain,
      baseline,
      current,
      change: Math.round((current - baseline) * 10) / 10,
      trend: trendFor(domain, idx),
      series: MONTHLY_SNAPSHOTS.map((s) => ({ label: s.label, value: s[domain] })),
    };
  });
}

export function domainProgress(domain: SnapshotDomainKey, asOfIndex: number = LATEST_INDEX): DomainProgress {
  return allDomainProgress(asOfIndex).find((d) => d.domain === domain)!;
}

// ---- Brain region mapping ----
// The interactive SVG (brain-lobes-interactive.svg) has no separate hippocampus path —
// anatomically the hippocampus sits within the medial temporal lobe, so memory is
// mapped onto the temporal-lobe region alongside language.

type MappedDomainKey = Exclude<CognitiveDomainKey, "orientation">;

export const BRAIN_REGIONS: {
  key: string;
  label: string;
  domains: MappedDomainKey[];
}[] = [
  { key: "frontal-lobe", label: "Frontal Lobe", domains: ["executive"] },
  { key: "temporal-lobe", label: "Temporal Lobe", domains: ["memory", "language"] },
  { key: "parietal-lobe", label: "Parietal Lobe", domains: ["spatial"] },
  { key: "occipital-lobe", label: "Occipital Lobe", domains: ["processingSpeed"] },
  { key: "cerebellum", label: "Cerebellum", domains: ["attention"] },
  { key: "brainstem", label: "Brainstem", domains: [] },
];

const domainLabels: Record<CognitiveDomainKey | "function" | "routine", string> = {
  memory: "Memory",
  language: "Language",
  executive: "Executive Function",
  spatial: "Spatial Processing",
  attention: "Attention / Coordination",
  processingSpeed: "Processing Speed",
  orientation: "Orientation",
  function: "Function",
  routine: "Routine",
};

export { domainLabels };

const DEVIATION_DATES: Record<string, string> = {
  memory: "2026-03-10",
  language: "2026-03-10",
  routine: "2026-03-18",
  executive: "2026-03-20",
  spatial: "2026-04-01",
  attention: "2026-04-10",
  processingSpeed: "2026-04-15",
};

// Returns the earliest-deviation date for a domain, unless `asOfDate` is given and
// that deviation hasn't happened yet "as of" the scrubbed point in time — in which
// case it correctly reports nothing detected yet.
export function earliestDeviationForDomain(domain: string, asOfDate?: string): string | null {
  const date = DEVIATION_DATES[domain] ?? null;
  if (!date) return null;
  if (asOfDate && date > asOfDate) return null;
  return date;
}

export function brainTwinState(asOfIndex: number = LATEST_INDEX): BrainRegionState[] {
  const idx = clampIndex(asOfIndex);
  const asOfDate = monthEndDate(idx);
  return BRAIN_REGIONS.map((region) => {
    if (region.domains.length === 0) {
      return {
        key: region.key,
        label: region.label,
        domains: [],
        current: 0,
        baseline: 0,
        change: 0,
        trend: "stable" as Trend,
        state: "insufficient-data" as RegionVisualState,
        earliestDeviation: null,
      };
    }
    const progresses = region.domains.map((d) => domainProgress(d, idx));
    const current = Math.round(avg(progresses.map((p) => p.current)) * 10) / 10;
    const baseline = Math.round(avg(progresses.map((p) => p.baseline)) * 10) / 10;
    const change = Math.round((current - baseline) * 10) / 10;
    const worstTrend = progresses.some((p) => p.trend === "declining")
      ? "declining"
      : progresses.some((p) => p.trend === "stable_to_mild_change")
      ? "stable_to_mild_change"
      : "stable";
    const earliest = region.domains
      .map((d) => earliestDeviationForDomain(d, asOfDate))
      .filter((d): d is string => Boolean(d))
      .sort()[0];
    return {
      key: region.key,
      label: region.label,
      domains: region.domains,
      current,
      baseline,
      change,
      trend: worstTrend as Trend,
      state: visualStateFor(change),
      earliestDeviation: earliest ?? null,
    };
  });
}

export function speechBaseline() {
  const base = SPEECH_SESSIONS[0];
  const cur = SPEECH_SESSIONS[SPEECH_SESSIONS.length - 1];
  return { baseline: base, current: cur };
}

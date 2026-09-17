import type { RegionVisualState, Trend } from "./types";

export const STATE_COLORS: Record<
  RegionVisualState,
  { dot: string; text: string; bg: string; border: string; ring: string; label: string }
> = {
  stable: {
    dot: "#2ba98b",
    text: "text-sage-700 dark:text-sage-400",
    bg: "bg-sage-50 dark:bg-sage-900/20",
    border: "border-sage-100 dark:border-sage-700/40",
    ring: "#2ba98b",
    label: "Stable",
  },
  changing: {
    dot: "#e3a63c",
    text: "text-amber-700 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    border: "border-amber-200/70 dark:border-amber-900",
    ring: "#e3a63c",
    label: "Changing",
  },
  declining: {
    dot: "#e1636b",
    text: "text-rose-700 dark:text-rose-400",
    bg: "bg-rose-50 dark:bg-rose-950/30",
    border: "border-rose-200/70 dark:border-rose-900",
    ring: "#e1636b",
    label: "Declining",
  },
  "insufficient-data": {
    dot: "#b1a9d6",
    text: "text-foreground/45",
    bg: "bg-surface-muted",
    border: "border-border-soft",
    ring: "#b1a9d6",
    label: "Not independently tracked",
  },
};

export const TREND_LABEL: Record<Trend, string> = {
  stable: "Stable",
  improving: "Improving",
  declining: "Declining",
  stable_to_mild_change: "Stable to mild change",
};

export function trendArrow(trend: Trend): string {
  if (trend === "improving") return "↑";
  if (trend === "declining") return "↓";
  if (trend === "stable_to_mild_change") return "↘";
  return "→";
}

export function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function confidenceLabel(confidence: number): "High" | "Medium" | "Low" {
  if (confidence >= 0.85) return "High";
  if (confidence >= 0.65) return "Medium";
  return "Low";
}

export function confidenceColor(confidence: number): string {
  const label = confidenceLabel(confidence);
  if (label === "High") return "text-sage-700 dark:text-sage-400 bg-sage-50 dark:bg-sage-900/20 border-sage-100 dark:border-sage-700/40";
  if (label === "Medium") return "text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border-amber-200/70 dark:border-amber-900";
  return "text-foreground/50 bg-surface-muted border-border-soft";
}

export const DOMAIN_COLORS: Record<string, string> = {
  memory: "#e1636b",
  language: "#e3a63c",
  executive: "#8b7bdd",
  spatial: "#4a90c9",
  attention: "#2ba98b",
  processingSpeed: "#c76bb3",
  function: "#9089b0",
  routine: "#3fb8ab",
};

export const SOURCE_LABEL: Record<string, string> = {
  cognitive_assessment: "Cognitive assessment",
  speech_analysis: "Speech analysis",
  caregiver_observation: "Caregiver observation",
  routine_system: "Routine system",
  mri: "MRI",
  historical_comparison: "Historical comparison",
};

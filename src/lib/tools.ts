// ECHO — Twin tools
// These functions are the concrete implementations of the "tool" functions described
// in the spec (section 35): the things Gemini is allowed to call. Every tool reads
// only from the mock dataset — no tool ever fabricates a patient fact.

import {
  MONTHLY_SNAPSHOTS,
  HISTORICAL_WINDOW,
  SPEECH_SESSIONS,
  CAREGIVER_OBSERVATIONS,
  ROUTINE_DAYS,
  MRI_SNAPSHOTS,
  MEMORY_NODES,
  MEMORY_EDGES,
  PATIENT,
} from "./mockData";
import { allDomainProgress, domainProgress } from "./twin";
import type { EvidenceItem, DeviationEvent, ScenarioVariables, ScenarioResult } from "./types";

export function get_patient_timeline() {
  return MONTHLY_SNAPSHOTS;
}

export function get_cognitive_trajectory() {
  return allDomainProgress().filter((d) => d.domain !== "function" && d.domain !== "routine");
}

export function get_speech_trajectory() {
  return SPEECH_SESSIONS;
}

export function get_routine_deviation() {
  return ROUTINE_DAYS;
}

export function get_mri_features() {
  return MRI_SNAPSHOTS;
}

export function compare_personal_baseline(domain: string) {
  return domainProgress(domain as Parameters<typeof domainProgress>[0]);
}

export function detect_progression(windowLabel = "6_month") {
  const domains = allDomainProgress();
  return {
    window: windowLabel,
    domains: Object.fromEntries(
      domains.map((d) => [d.domain, { change: d.change, trend: d.trend }])
    ),
  };
}

// "What changed first?" — reconstructs the temporal sequence of deviations across
// modalities, using the earliest-observed-deviation timestamps plus caregiver notes.
export function find_first_change(): DeviationEvent[] {
  const events: DeviationEvent[] = [
    {
      date: "2026-03-10",
      domain: "speech",
      summary: "Speech pause ratio and repetition rate cross personal baseline range.",
      evidenceIds: ["speech-S039"],
    },
    {
      date: "2026-03-12",
      domain: "memory",
      summary: "Caregiver notes repeated questioning about a doctor's appointment.",
      evidenceIds: ["cg-CG04"],
    },
    {
      date: "2026-03-15",
      domain: "memory",
      summary: "Monthly cognitive assessment shows a memory score change from baseline.",
      evidenceIds: ["assessment-2026-03"],
    },
    {
      date: "2026-03-18",
      domain: "routine",
      summary: "Morning routine adherence drops sharply; afternoon walk skipped.",
      evidenceIds: ["routine-2026-03-20", "cg-CG07"],
    },
  ];
  return events.sort((a, b) => a.date.localeCompare(b.date));
}

export function get_evidence(domain?: string): EvidenceItem[] {
  const items: EvidenceItem[] = [];

  for (const s of SPEECH_SESSIONS) {
    items.push({
      id: `speech-${s.sessionId}`,
      source: "speech_analysis",
      date: s.date,
      summary: `Speech session ${s.sessionId}: ${s.note}`,
      value: s.repetitionRate,
      confidence: 0.85,
    });
  }
  for (const c of CAREGIVER_OBSERVATIONS) {
    items.push({
      id: `cg-${c.id}`,
      source: "caregiver_observation",
      date: c.date,
      summary: c.text,
      confidence: c.severity === "high" ? 0.9 : c.severity === "medium" ? 0.78 : 0.6,
    });
  }
  for (const r of ROUTINE_DAYS.filter((r) => r.deviation > 0.1)) {
    items.push({
      id: `routine-${r.date}`,
      source: "routine_system",
      date: r.date,
      summary: `Morning routine adherence ${(r.observedAdherence * 100).toFixed(0)}% vs. expected ${(r.expectedAdherence * 100).toFixed(0)}%.${r.notes ? " " + r.notes : ""}`,
      value: r.deviation,
      confidence: 0.8,
    });
  }
  items.push({
    id: "assessment-2026-03",
    source: "cognitive_assessment",
    date: "2026-03-15",
    summary: "Monthly cognitive assessment: memory score declines from personal baseline.",
    confidence: 0.88,
  });
  items.push({
    id: "mri-2026-06",
    source: "mri",
    date: "2026-06-14",
    summary: "Follow-up MRI shows hippocampal volume reduction and modest ventricular enlargement vs. Dec 2025 baseline scan.",
    confidence: 0.82,
  });

  const filtered = domain
    ? items.filter((i) =>
        i.summary.toLowerCase().includes(domain.toLowerCase()) ||
        i.source.toLowerCase().includes(domain.toLowerCase())
      )
    : items;

  return filtered.sort((a, b) => a.date.localeCompare(b.date));
}

// "Has this happened before?" — compares the current period against the historical
// window stored in mock data.
export function find_similar_period() {
  const current = {
    label: "Mar–Jun 2026",
    memory: "declining",
    speech: "declining",
    routine: "declining",
  };
  const historical = {
    label: HISTORICAL_WINDOW.label,
    memory: "declining then partially recovered",
    speech: "declining then partially recovered",
    routine: "declining then partially recovered",
    note: HISTORICAL_WINDOW.note,
  };
  return {
    current,
    historical,
    similarity: "high",
    domainsMatched: ["memory", "speech", "routine"],
    caveat:
      "The historical dip resolved after treatment for a urinary tract infection. This is a pattern similarity, not evidence of the same cause.",
  };
}

export function query_memory_graph(entityLabel?: string) {
  if (!entityLabel) return { nodes: MEMORY_NODES, edges: MEMORY_EDGES };
  const needle = entityLabel.toLowerCase();
  const node = MEMORY_NODES.find((n) => n.label.toLowerCase().includes(needle));
  if (!node) return { nodes: [], edges: [] };
  const edges = MEMORY_EDGES.filter((e) => e.from === node.id || e.to === node.id);
  const connectedIds = new Set(edges.flatMap((e) => [e.from, e.to]));
  const nodes = MEMORY_NODES.filter((n) => connectedIds.has(n.id));
  return { nodes, edges };
}

export function get_current_twin() {
  const domains = allDomainProgress();
  return {
    patient: PATIENT,
    cognitive: Object.fromEntries(domains.map((d) => [d.domain, d.current])),
    baseline: Object.fromEntries(domains.map((d) => [d.domain, d.baseline])),
  };
}

export function simulate_scenario(variables: Partial<ScenarioVariables>): ScenarioResult {
  const v: ScenarioVariables = {
    routineConsistency: variables.routineConsistency ?? 0.95,
    socialInteraction: variables.socialInteraction ?? 0.7,
    sleepRegularity: variables.sleepRegularity ?? 0.7,
  };
  const currentRoutine = ROUTINE_DAYS[ROUTINE_DAYS.length - 1].observedAdherence;
  const currentMemory = domainProgress("memory").current;
  const currentConfusionEvents = 4;

  // Simple, clearly-labeled heuristic model — not a clinical predictor.
  const routineLift = (v.routineConsistency - currentRoutine) * 0.55;
  const simulatedRoutine = Math.min(0.97, currentRoutine + Math.max(0, routineLift));
  const socialLift = (v.socialInteraction - 0.5) * 4;
  const sleepLift = (v.sleepRegularity - 0.5) * 3;
  const simulatedConfusion = Math.max(
    0.5,
    currentConfusionEvents - (simulatedRoutine - currentRoutine) * 10 - socialLift * 0.3 - sleepLift * 0.3
  );
  const simulatedMemory = Math.min(100, currentMemory + (simulatedRoutine - currentRoutine) * 8 + socialLift * 0.4);

  return {
    scenario: "consistent_routine_and_engagement",
    horizonDays: 30,
    variables: v,
    current: {
      routineAdherence: Math.round(currentRoutine * 100),
      confusionEventsPerWeek: currentConfusionEvents,
      memoryScore: currentMemory,
    },
    simulated: {
      routineAdherence: Math.round(simulatedRoutine * 100),
      confusionEventsPerWeek: Math.round(simulatedConfusion * 10) / 10,
      memoryScore: Math.round(simulatedMemory * 10) / 10,
    },
    confidence: "low",
    narrative:
      "This is a modeled estimate based on the patient's own historical relationship between routine adherence and behavioral measures, not a clinical prediction.",
  };
}

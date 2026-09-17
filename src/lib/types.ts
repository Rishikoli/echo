// ECHO — shared type definitions
// These types model the Digital Twin data structures described in the ECHO spec:
// cognitive domains, speech features, routine adherence, memory graph, evidence,
// progression, and scenario simulation.

export type Trend =
  | "stable"
  | "improving"
  | "declining"
  | "stable_to_mild_change";

export type RegionVisualState =
  | "stable"
  | "changing"
  | "declining"
  | "insufficient-data";

export type CognitiveDomainKey =
  | "memory"
  | "language"
  | "executive"
  | "spatial"
  | "attention"
  | "processingSpeed"
  | "orientation";

export interface MonthlySnapshot {
  month: string; // e.g. "2026-01"
  label: string; // e.g. "Jan"
  memory: number;
  language: number;
  executive: number;
  spatial: number;
  attention: number;
  processingSpeed: number;
  function: number; // ADL / functional ability
  routine: number; // routine adherence %
}

export interface SpeechSession {
  sessionId: string;
  date: string;
  speechRate: number; // words per minute
  pauseRatio: number; // 0-1
  meanPauseMs: number;
  repetitionRate: number; // 0-1
  wordFindingEvents: number;
  lexicalDiversity: number; // 0-1
  semanticCoherence: number; // 0-1
  note: string;
}

export interface CaregiverObservation {
  id: string;
  date: string;
  domain: CognitiveDomainKey | "routine" | "function" | "behavior";
  text: string;
  severity: "low" | "medium" | "high";
}

export interface RoutineDay {
  date: string;
  routine: "morning" | "evening";
  expectedAdherence: number;
  observedAdherence: number;
  deviation: number;
  notes?: string;
}

export interface MRISnapshot {
  scanDate: string;
  regions: {
    hippocampus: { volume: number; changeFromBaseline: number };
    ventricle: { volume: number; changeFromBaseline: number };
    corticalThickness: { value: number; changeFromBaseline: number };
  };
}

export interface EvidenceItem {
  id: string;
  source:
    | "cognitive_assessment"
    | "speech_analysis"
    | "caregiver_observation"
    | "routine_system"
    | "mri"
    | "historical_comparison";
  date: string;
  summary: string;
  value?: number;
  confidence: number; // 0-1
}

export interface DeviationEvent {
  date: string;
  domain: string;
  summary: string;
  evidenceIds: string[];
}

// ---- Memory graph (Life Twin) ----

export type MemoryNodeType =
  | "patient"
  | "person"
  | "place"
  | "event"
  | "story"
  | "routine"
  | "object"
  | "photo";

export interface MemoryNode {
  id: string;
  type: MemoryNodeType;
  label: string;
  subtitle?: string;
  detail?: string;
  confidence: number;
  x: number; // layout position (percent, 0-100)
  y: number;
}

export type MemoryRelationship =
  | "PARENT_OF"
  | "SPOUSE_OF"
  | "FRIEND_OF"
  | "LIVES_AT"
  | "VISITED"
  | "PART_OF"
  | "ASSOCIATED_WITH"
  | "APPEARS_IN"
  | "FOLLOWS"
  | "OCCURRED_AT"
  | "LIKES";

export interface MemoryEdge {
  id: string;
  from: string;
  to: string;
  relationship: MemoryRelationship;
  label: string;
}

// ---- Brain twin ----

export interface BrainRegionState {
  key: string; // svg id prefix, e.g. "frontal-lobe"
  label: string;
  domains: CognitiveDomainKey[];
  current: number;
  baseline: number;
  change: number;
  trend: Trend;
  state: RegionVisualState;
  earliestDeviation: string | null;
}

// ---- Investigation / orchestration ----

export interface ToolTraceStep {
  tool: string;
  args?: Record<string, unknown>;
  summary: string;
}

export interface InvestigationResult {
  question: string;
  finding: string;
  whatChanged: string;
  when: string;
  evidence: EvidenceItem[];
  historicalContext: string;
  uncertainty: string;
  toolTrace: ToolTraceStep[];
  poweredBy: "gemini" | "template";
}

// ---- Scenario twin ----

export interface ScenarioVariables {
  routineConsistency: number; // 0-1
  socialInteraction: number; // 0-1
  sleepRegularity: number; // 0-1
}

export interface ScenarioResult {
  scenario: string;
  horizonDays: number;
  variables: ScenarioVariables;
  current: {
    routineAdherence: number;
    confusionEventsPerWeek: number;
    memoryScore: number;
  };
  simulated: {
    routineAdherence: number;
    confusionEventsPerWeek: number;
    memoryScore: number;
  };
  confidence: "low" | "medium";
  narrative: string;
}

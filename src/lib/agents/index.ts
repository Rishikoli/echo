// ECHO agent registry — single source of truth for the agent roster, consumed by
// the /architecture page and docs/ON_DEVICE_ARCHITECTURE.md. Update this file first
// when an agent's status changes; the UI and docs stay downstream of it.

import type { AgentSpec } from "./types";

export const AGENTS: AgentSpec[] = [
  {
    id: "router",
    name: "Router Agent",
    role: "Classifies a question and decides which agents it needs",
    responsibilities: [
      "Match free-text or preset questions to one of five investigation intents",
      "Dispatch to the relevant Progression / Evidence agents",
    ],
    status: "built",
    deterministic: true,
    today: "Keyword-based classifyIntent() in src/lib/agents/routerAgent.ts",
    planned: "Unchanged — stays deterministic to avoid spending an inference pass on tool selection",
    inputs: "Caregiver question (string)",
    outputs: "Intent label + which agents to call",
  },
  {
    id: "progression",
    name: "Progression Agent",
    role: "Computes personal-baseline deviation, trend, and first-detected-change",
    responsibilities: [
      "Compare current values against the patient's own historical baseline",
      "Classify each domain's trend (stable / changing / declining)",
      "Reconstruct the temporal order in which deviations were first detected",
    ],
    status: "built",
    deterministic: true,
    today: "twin.ts + tools.ts, pure arithmetic over mock monthly snapshots",
    planned: "Unchanged — this is a math task, not a language task; no model involved either way",
    inputs: "Monthly domain snapshots, an optional 'as of' month index",
    outputs: "Per-domain baseline/current/change/trend, ordered deviation events",
  },
  {
    id: "evidence",
    name: "Evidence Agent",
    role: "Retrieves and confidence-scores supporting observations",
    responsibilities: [
      "Pull observations from speech, caregiver notes, routine system, assessments, MRI",
      "Attach a confidence band to each item and filter by domain / date",
    ],
    status: "built",
    deterministic: true,
    today: "get_evidence() in tools.ts",
    planned: "Unchanged retrieval logic; the on-device Synthesis Agent is what reads its output",
    inputs: "Domain filter, 'as of' date cutoff",
    outputs: "Evidence items with source, date, summary, confidence",
  },
  {
    id: "memory",
    name: "Memory Agent",
    role: "Traverses the patient's people / places / events / routines graph",
    responsibilities: [
      "Answer relationship queries against the Life Twin graph",
      "Provide the match target for the Vision Agent's photo recognition, and the source data for Recall Agent games",
    ],
    status: "built",
    deterministic: true,
    today: "query_memory_graph() in tools.ts, static in-memory node/edge arrays",
    planned: "Same traversal logic; storage moves to an on-device store once data is dynamic, not static mock data",
    inputs: "Entity label (optional)",
    outputs: "Matching graph nodes and their edges",
  },
  {
    id: "scenario",
    name: "Scenario Agent",
    role: "Runs 'what if' simulations against the patient's own history",
    responsibilities: [
      "Model routine/social/sleep variable changes against historical relationships",
      "Return a clearly-labeled simulation, never framed as a prediction",
    ],
    status: "built",
    deterministic: true,
    today: "simulate_scenario() in tools.ts, transparent heuristic formula",
    planned: "Stays deterministic on purpose — a caregiver-facing simulation should not silently hallucinate an outcome",
    inputs: "Scenario variables (routine consistency, social interaction, sleep regularity)",
    outputs: "Current vs. simulated routine adherence, confusion events, memory score",
  },
  {
    id: "speech",
    name: "Speech Agent",
    role: "Analyzes acoustic patterns in a voice recording",
    responsibilities: [
      "Energy-based voice-activity detection (pause ratio, activity rate)",
      "Not currently wired to a UI surface — library function only, verified standalone",
    ],
    status: "partial",
    deterministic: true,
    today: "analyzeSpeechFile() in audioAnalysis.ts — Web Audio API DSP, verified against synthetic test audio (a 50%-silence test file measured a 0.49 pause ratio)",
    planned: "Gemma 3n's native audio input for real transcription; the DSP stays as a fast pre-filter ahead of the model call",
    inputs: "Audio file (WAV/MP3/M4A)",
    outputs: "Duration, pause ratio, activity-events/min, mean energy",
  },
  {
    id: "vision",
    name: "Vision Agent",
    role: "The Memory Bridge — recognizes a person or place from the camera",
    responsibilities: [
      "Match a photo against the Memory Agent's known graph",
      "Return a progressive-disclosure result (Level 1 → Level 4)",
    ],
    status: "planned",
    deterministic: false,
    today: "Not implemented — typed stub only (visionAgent.matchPhoto throws on purpose)",
    planned: "Gemma 3n native image input, matched against Memory Agent nodes via on-device embedding comparison",
    inputs: "Camera frame or photo (Blob)",
    outputs: "Matched memory node, confidence, disclosure level",
  },
  {
    id: "monitoring",
    name: "Monitoring Agent",
    role: "Watches Twin state and decides what's worth a proactive alert",
    responsibilities: [
      "Detect which domains are currently declining",
      "Trigger a real, permission-gated notification summarizing the change",
    ],
    status: "built",
    deterministic: true,
    today: "detectMeaningfulChanges() + a real browser Notification, user-gesture triggered from the dashboard bell",
    planned: "Same detection logic; the notification becomes a native Android notification from a background check",
    inputs: "Current domain progress",
    outputs: "List of meaningful changes; a fired OS notification",
  },
  {
    id: "recall",
    name: "Recall Agent",
    role: "Generates active-recall mini-games from real Twin data",
    responsibilities: [
      "People round — who someone is and how they're related, from the Memory graph",
      "Routine round — reorder the patient's real morning/evening routine steps",
      "Timeline round — reconstruct the real order deviations were first detected in",
    ],
    status: "built",
    deterministic: true,
    today: "recallAgent.ts — every round and correct answer is derived from mockData/Progression Agent output, never invented trivia",
    planned: "Unchanged — retrieval-practice content generation is deterministic by design, same reasoning as Progression/Scenario",
    inputs: "None (draws from Memory, routine, and Progression Agent data)",
    outputs: "A game round (question + shuffled options/steps + the real correct order)",
  },
  {
    id: "synthesis",
    name: "Synthesis Agent",
    role: "Turns structured agent output into a grounded natural-language answer",
    responsibilities: [
      "Write the Finding / What Changed / When / Historical Context / Uncertainty explanation",
      "Never state anything not present in the structured input it was given",
    ],
    status: "partial",
    deterministic: false,
    today: "investigate() in gemini.ts — cloud Gemini if GEMINI_API_KEY is set, else a deterministic template",
    planned: "THE swap point — Gemma 3n (E2B, INT4) via MediaPipe LLM Inference API, on-device. See android-reference/.",
    inputs: "Question, routed intent, structured tool/agent output, evidence list",
    outputs: "InvestigationResult (finding, whatChanged, when, historicalContext, uncertainty)",
  },
];

export function getAgent(id: string) {
  return AGENTS.find((a) => a.id === id);
}

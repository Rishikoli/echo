// ECHO — LLM orchestration layer
//
// Architecture note (spec sections 33-40, 58-59): Gemma 4B on-device is the spec's
// target LLM. For this local-first web demo we use Gemini as the LLM instead (per
// instruction), reached through the same orchestrator shape: deterministic tool
// selection + execution against the mock Twin data, then an LLM synthesis pass that
// turns structured tool output into the FINDING / WHAT CHANGED / WHEN / EVIDENCE /
// HISTORICAL CONTEXT / UNCERTAINTY explanation format (spec section 87).
//
// "Use mock data for now, for the LLM too": all tool data is mock data (see
// mockData.ts), and if no GEMINI_API_KEY is configured, synthesis falls back to a
// deterministic template built from the same tool outputs, so the app runs fully
// offline out of the box. Setting GEMINI_API_KEY switches the synthesis step to a
// real Gemini call without changing anything else.

import { GoogleGenerativeAI } from "@google/generative-ai";
import * as tools from "./tools";
import type { EvidenceItem, InvestigationResult, ToolTraceStep } from "./types";
import { domainLabels } from "./twin";

export const SYSTEM_PROMPT = `You are the ECHO Twin Orchestrator.

Responsibilities:
1. Understand the caregiver's or clinician's request.
2. Use only the structured tool results provided to you — never invent patient facts.
3. Distinguish observations from inferences, and simulations from real measurements.
4. Preserve uncertainty; do not collapse findings into a diagnosis.
5. Provide a source-backed explanation in the requested structure.
6. Never independently prescribe or modify treatment. Escalate urgent medical
   situations to professional care instead of advising on them.

You will be given the caregiver's question plus JSON tool output already retrieved
from the patient's Digital Twin. Respond ONLY with compact JSON matching this shape:
{
  "finding": string,        // one or two sentences, the headline finding
  "whatChanged": string,    // which domains changed and by how much
  "when": string,           // earliest detected deviation / relevant dates
  "historicalContext": string, // comparison to prior periods, or "None available."
  "uncertainty": string     // one sentence naming this as a longitudinal model output, not a diagnosis
}
Do not include markdown formatting or any text outside the JSON object.`;

function routeQuestion(question: string): {
  intent: string;
  trace: ToolTraceStep[];
  evidence: EvidenceItem[];
  payload: Record<string, unknown>;
} {
  const q = question.toLowerCase();
  const trace: ToolTraceStep[] = [];

  const call = <T,>(name: string, fn: () => T, summary: string): T => {
    const result = fn();
    trace.push({ tool: name, summary });
    return result;
  };

  if (q.includes("changed first") || q.includes("first change") || q.includes("earliest")) {
    const events = call("find_first_change", tools.find_first_change, "Reconstructed temporal sequence of deviations.");
    const evidence = call("get_evidence", () => tools.get_evidence(), "Retrieved supporting evidence.");
    return { intent: "first_change", trace, evidence, payload: { events } };
  }

  if (q.includes("happened before") || q.includes("similar") || q.includes("before")) {
    const similarity = call("find_similar_period", tools.find_similar_period, "Compared current period against historical windows.");
    const evidence = call("get_evidence", () => tools.get_evidence(), "Retrieved supporting evidence.");
    return { intent: "similar_period", trace, evidence, payload: { similarity } };
  }

  if (q.includes("why") || q.includes("flagged") || q.includes("forensic")) {
    const events = call("find_first_change", tools.find_first_change, "Reconstructed the flagged-period timeline.");
    const evidence = call("get_evidence", () => tools.get_evidence(), "Retrieved evidence graph for the flagged period.");
    return { intent: "forensics", trace, evidence, payload: { events } };
  }

  if (q.includes("evidence")) {
    const evidence = call("get_evidence", () => tools.get_evidence(), "Retrieved full evidence list.");
    return { intent: "evidence", trace, evidence, payload: {} };
  }

  // Default: general "what changed?" investigation.
  const progression = call("detect_progression", () => tools.detect_progression(), "Ran progression engine across all domains.");
  const evidence = call("get_evidence", () => tools.get_evidence(), "Retrieved supporting evidence.");
  call("compare_personal_baseline", () => tools.get_cognitive_trajectory(), "Compared each domain against personal baseline.");
  return { intent: "what_changed", trace, evidence, payload: { progression } };
}

function templateSynthesis(
  intent: string,
  payload: Record<string, unknown>,
  evidence: EvidenceItem[]
): Omit<InvestigationResult, "question" | "toolTrace" | "poweredBy" | "evidence"> {
  if (intent === "first_change") {
    const events = payload.events as ReturnType<typeof tools.find_first_change>;
    const first = events[0];
    return {
      finding: `The earliest detected deviation was in ${first.domain}-related features, on ${first.date}.`,
      whatChanged: events.map((e) => `${e.domain} (${e.date}): ${e.summary}`).join(" "),
      when: `First detected: ${first.date}.`,
      historicalContext: "This sequence reflects the order deviations were first detected across modalities, not necessarily a causal chain.",
      uncertainty: "This is a temporal ordering of detections in the available data, not a diagnosis or causal explanation.",
    };
  }
  if (intent === "similar_period") {
    const sim = payload.similarity as ReturnType<typeof tools.find_similar_period>;
    return {
      finding: `The current period (${sim.current.label}) resembles a previous period across ${sim.domainsMatched.join(", ")}.`,
      whatChanged: `Both periods show declining ${sim.domainsMatched.join(", ")}.`,
      when: `Compared against ${sim.historical.label}.`,
      historicalContext: `${sim.historical.note} ${sim.caveat}`,
      uncertainty: "Pattern similarity does not imply the same underlying cause.",
    };
  }
  if (intent === "forensics") {
    const events = payload.events as ReturnType<typeof tools.find_first_change>;
    return {
      finding: `This period was flagged due to a cluster of related deviations beginning ${events[0].date}.`,
      whatChanged: events.map((e) => `${e.date}: ${e.summary}`).join(" "),
      when: `Flag window: ${events[0].date} – ${events[events.length - 1].date}.`,
      historicalContext: "See the evidence graph for the full supporting chain.",
      uncertainty: "The sequence shown is temporal, not causal.",
    };
  }
  if (intent === "evidence") {
    return {
      finding: `${evidence.length} evidence items are available across cognitive, speech, caregiver, routine, and imaging sources.`,
      whatChanged: "See the evidence list for individual observations.",
      when: `Spanning ${evidence[0]?.date ?? "N/A"} to ${evidence[evidence.length - 1]?.date ?? "N/A"}.`,
      historicalContext: "None available for a generic evidence query.",
      uncertainty: "Each item carries its own confidence score; higher-severity caregiver notes are weighted accordingly.",
    };
  }

  // what_changed (default)
  const progression = payload.progression as ReturnType<typeof tools.detect_progression>;
  const declining = Object.entries(progression.domains).filter(([, v]) => v.trend === "declining");
  const summary = declining
    .map(([k, v]) => `${domainLabels[k as keyof typeof domainLabels] ?? k} ${v.change > 0 ? "↑" : "↓"}${Math.abs(v.change)}`)
    .join(", ");
  return {
    finding: declining.length
      ? `Measures have changed relative to the patient's personal baseline in ${declining.length} domain${declining.length > 1 ? "s" : ""}.`
      : "No substantial change detected relative to the personal baseline.",
    whatChanged: summary || "All tracked domains remain within personal baseline range.",
    when: "Over the last 6 months of recorded observations.",
    historicalContext: "A similar multi-domain pattern was observed in a prior period (Sep–Nov 2025); see 'Has this happened before?'.",
    uncertainty: "This is a longitudinal model output based on the patient's own history, not a diagnosis.",
  };
}

async function geminiSynthesis(
  question: string,
  intent: string,
  payload: Record<string, unknown>,
  evidence: EvidenceItem[]
): Promise<Omit<InvestigationResult, "question" | "toolTrace" | "poweredBy" | "evidence"> | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || "gemini-2.0-flash",
      systemInstruction: SYSTEM_PROMPT,
      generationConfig: { responseMimeType: "application/json" },
    });

    const prompt = `Caregiver question: "${question}"
Detected intent: ${intent}
Tool output (JSON): ${JSON.stringify(payload)}
Evidence (JSON): ${JSON.stringify(evidence.slice(0, 12))}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = JSON.parse(text);
    if (
      typeof parsed.finding === "string" &&
      typeof parsed.whatChanged === "string" &&
      typeof parsed.when === "string" &&
      typeof parsed.historicalContext === "string" &&
      typeof parsed.uncertainty === "string"
    ) {
      return parsed;
    }
    return null;
  } catch (err) {
    console.error("Gemini synthesis failed, falling back to template:", err);
    return null;
  }
}

export async function investigate(question: string): Promise<InvestigationResult> {
  const { intent, trace, evidence, payload } = routeQuestion(question);

  const gemini = await geminiSynthesis(question, intent, payload, evidence);
  const synthesis = gemini ?? templateSynthesis(intent, payload, evidence);

  return {
    question,
    ...synthesis,
    evidence: evidence.slice(0, 12),
    toolTrace: trace,
    poweredBy: gemini ? "gemini" : "template",
  };
}

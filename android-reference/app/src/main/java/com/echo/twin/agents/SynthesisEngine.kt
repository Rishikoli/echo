package com.echo.twin.agents

import com.echo.twin.models.EvidenceItem
import com.echo.twin.models.SynthesisOutput

/**
 * The Synthesis Agent's contract — the ONE interface with three interchangeable
 * backends. Whatever calls this (an orchestrator, a ViewModel, a background worker)
 * depends only on this interface, never on which backend is active, so switching
 * from cloud to on-device — or falling back from on-device to template if model
 * loading fails on an unsupported device — is a one-line change at the call site,
 * not a rewrite.
 *
 * This mirrors the role `investigate()` plays in src/lib/gemini.ts: same inputs
 * (question, routed intent, structured tool/agent payload, evidence), same output
 * shape, different execution strategy per implementation.
 */
interface SynthesisEngine {
    val poweredBy: String // "on_device" | "gemini" | "template" — surfaced in the UI, same as the web prototype

    suspend fun synthesize(
        question: String,
        intent: String,
        payloadJson: String, // pre-serialized structured agent output — see ModelManager's prompt builder
        evidence: List<EvidenceItem>,
    ): SynthesisOutput
}

/** The fixed system prompt every backend is instructed with — kept identical to
 * SYSTEM_PROMPT in src/lib/gemini.ts on purpose. Swapping the model shouldn't mean
 * re-deriving the safety/grounding rules from scratch. */
object EchoSystemPrompt {
    const val TEXT = """You are the ECHO Twin Orchestrator.

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
  "finding": string,
  "whatChanged": string,
  "when": string,
  "historicalContext": string,
  "uncertainty": string
}
Do not include markdown formatting or any text outside the JSON object."""
}

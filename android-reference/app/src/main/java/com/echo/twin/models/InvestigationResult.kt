package com.echo.twin.models

import kotlinx.serialization.Serializable

/**
 * Mirrors `InvestigationResult` in src/lib/types.ts. This is the output contract
 * every Synthesis Agent backend must produce, regardless of what generates it —
 * cloud Gemini, the deterministic template, or (this file's whole point)
 * on-device Gemma 3n. `poweredBy` gains a third value here versus the web
 * prototype's two ("gemini" | "template"), since the Android build can genuinely
 * report "on_device".
 */
@Serializable
data class InvestigationResult(
    val question: String,
    val finding: String,
    val whatChanged: String,
    val `when`: String,
    val evidence: List<EvidenceItem>,
    val historicalContext: String,
    val uncertainty: String,
    val toolTrace: List<ToolTraceStep>,
    val poweredBy: String, // "on_device" | "gemini" | "template"
)

/**
 * The strict subset of fields the Synthesis Agent itself is responsible for
 * generating — everything else in InvestigationResult (evidence, toolTrace,
 * poweredBy, question) is assembled by the orchestrator around it, exactly as
 * gemini.ts's `investigate()` does with `Omit<InvestigationResult, ...>` today.
 */
@Serializable
data class SynthesisOutput(
    val finding: String,
    val whatChanged: String,
    val `when`: String,
    val historicalContext: String,
    val uncertainty: String,
)

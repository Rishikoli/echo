package com.echo.twin.agents

import com.echo.twin.models.EvidenceItem
import com.echo.twin.models.SynthesisOutput

/**
 * The final fallback — no network, no model, always available. Direct port of
 * templateSynthesis() in src/lib/gemini.ts. Kept for the same reason it exists in
 * the web prototype: the app should never be left with literally nothing to show,
 * even if both the on-device model fails to load AND there's no network for the
 * cloud fallback. This is what a true Red Light demo falls back to if
 * OnDeviceSynthesisEngine can't initialize on the day.
 *
 * `payload` here is intentionally typed loosely (Map<String, Any?>) rather than
 * strongly, mirroring the `Record<string, unknown>` payload shape in gemini.ts —
 * each intent branch below is responsible for casting the fields it expects, same
 * as the TypeScript version does with `as` casts.
 */
class TemplateSynthesisEngine : SynthesisEngine {

    override val poweredBy = "template"

    override suspend fun synthesize(
        question: String,
        intent: String,
        payloadJson: String,
        evidence: List<EvidenceItem>,
    ): SynthesisOutput {
        // A real port would parse payloadJson per-intent the way gemini.ts's
        // templateSynthesis() destructures `payload.events` / `payload.similarity`
        // / `payload.progression`. Left as a structural placeholder here since the
        // exact per-intent payload shape depends on how RouterAgent.kt's tool
        // dispatch is finished (see the "actual Round 1 problem" list in the repo's
        // architecture doc for what still needs finishing on the Android side).
        return SynthesisOutput(
            finding = "Template synthesis for intent '$intent' — port the per-intent " +
                "branches from templateSynthesis() in src/lib/gemini.ts here once the " +
                "Kotlin tool-agent payload shapes are finalized.",
            whatChanged = "See evidence list.",
            `when` = "Not computed in this placeholder.",
            historicalContext = "None available.",
            uncertainty = "This is a template fallback, not a model output — verify against the TypeScript source before relying on this text in a demo.",
        )
    }
}

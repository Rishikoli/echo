package com.echo.twin.agents

import com.echo.twin.models.EvidenceItem
import com.echo.twin.models.InvestigationResult
import com.echo.twin.models.ToolTraceStep
import com.echo.twin.tools.Intent
import com.echo.twin.tools.RouterAgent

/**
 * Example usage — how an Activity/ViewModel would actually call this. Shows the
 * full path: Router Agent decides intent → (tool agents, not ported here, would
 * populate payload/evidence/trace the way routeQuestion() does in gemini.ts) →
 * whichever SynthesisEngine is active turns that into an InvestigationResult.
 *
 * The tool-agent calls themselves (Progression/Evidence/Memory/Scenario) are
 * NOT ported to Kotlin in this reference — they're pure data-transformation logic
 * over whatever the Android app's local data layer ends up being (Room database,
 * flat files, whatever replaces the web prototype's static mock arrays), which
 * depends on decisions this reference code can't make for you. This class shows
 * where they plug in.
 */
class EchoOrchestrator(
    private val synthesisEngine: SynthesisEngine,
) {
    suspend fun investigate(question: String): InvestigationResult {
        val intent = RouterAgent.classifyIntent(question)
        val trace = mutableListOf<ToolTraceStep>()

        // Placeholder — replace with real calls once the tool agents are ported.
        // Each call should append to `trace` the same way gemini.ts's `call()`
        // helper does, so the UI's tool-execution-trace list stays accurate.
        val payloadJson = "{}"
        val evidence: List<EvidenceItem> = emptyList()

        val output = synthesisEngine.synthesize(
            question = question,
            intent = intent.name,
            payloadJson = payloadJson,
            evidence = evidence,
        )

        return InvestigationResult(
            question = question,
            finding = output.finding,
            whatChanged = output.whatChanged,
            `when` = output.`when`,
            evidence = evidence,
            historicalContext = output.historicalContext,
            uncertainty = output.uncertainty,
            toolTrace = trace,
            poweredBy = synthesisEngine.poweredBy,
        )
    }
}

/**
 * Composition example — how you'd choose which engine backs the app, with the
 * same fallback order the Round 1 web prototype implicitly has (on-device is the
 * goal; template is what's guaranteed to work). Wire this in Application.onCreate
 * or a DI module, not per-screen.
 */
object SynthesisEngineFactory {
    suspend fun create(
        modelManager: ModelManager,
        cloudApiKey: String?,
    ): SynthesisEngine {
        return try {
            if (modelManager.isModelReady()) {
                OnDeviceSynthesisEngine(modelManager.preload())
            } else if (!cloudApiKey.isNullOrBlank()) {
                CloudSynthesisEngine(cloudApiKey)
            } else {
                TemplateSynthesisEngine()
            }
        } catch (e: Exception) {
            // On-device load failed (unsupported device, corrupt file, out of
            // memory) — degrade rather than crash the app.
            TemplateSynthesisEngine()
        }
    }
}

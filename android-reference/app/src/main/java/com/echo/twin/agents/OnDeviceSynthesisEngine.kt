package com.echo.twin.agents

import com.echo.twin.models.EvidenceItem
import com.echo.twin.models.SynthesisOutput
import com.google.mediapipe.tasks.genai.llminference.LlmInference
import kotlin.coroutines.resume
import kotlin.coroutines.suspendCoroutine
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive

/**
 * THE swap point referenced throughout this repo — src/lib/agents/synthesisAgent.ts
 * points here as the Round 2 replacement for its cloud/template pair. This is the
 * only agent in the whole ECHO system that this file changes; every other agent
 * (Progression, Evidence, Memory, Scenario, Router) is pure computation and is not
 * touched by this Kotlin port at all.
 *
 * NOT verified: `generateResponse` is the synchronous, blocking call in the base
 * MediaPipe LLM Inference API. Newer API versions also expose
 * `generateResponseAsync(prompt, callback)` for token-by-token streaming, which
 * would let the UI show partial output instead of a single wait-then-reveal moment
 * — worth switching to for the demo if the streaming API is available in the
 * version you build against, since perceived latency matters more than actual
 * latency in front of judges.
 */
class OnDeviceSynthesisEngine(
    private val llmInference: LlmInference,
) : SynthesisEngine {

    override val poweredBy = "on_device"

    private val json = Json { ignoreUnknownKeys = true }

    override suspend fun synthesize(
        question: String,
        intent: String,
        payloadJson: String,
        evidence: List<EvidenceItem>,
    ): SynthesisOutput = withContext(Dispatchers.Default) {
        val prompt = buildPrompt(question, intent, payloadJson, evidence)

        // generateResponse is blocking — run it off the main thread. On a phone
        // this can take real seconds even at INT4; see the latency/thermal notes
        // in docs/ON_DEVICE_ARCHITECTURE.md before assuming this is instant.
        val raw = suspendCoroutine<String> { cont ->
            val response = llmInference.generateResponse(prompt)
            cont.resume(response)
        }

        parseSynthesisJson(raw)
    }

    private fun buildPrompt(question: String, intent: String, payloadJson: String, evidence: List<EvidenceItem>): String {
        // Same shape as the prompt geminiSynthesis() builds in gemini.ts — kept
        // identical so behavior is comparable across backends during testing.
        val evidenceJson = json.encodeToString(
            kotlinx.serialization.builtins.ListSerializer(EvidenceItem.serializer()),
            evidence.take(12),
        )
        return """
            ${EchoSystemPrompt.TEXT}

            Caregiver question: "$question"
            Detected intent: $intent
            Tool output (JSON): $payloadJson
            Evidence (JSON): $evidenceJson
        """.trimIndent()
    }

    /**
     * Smaller on-device models are more prone to wrapping JSON in markdown fences
     * or adding a stray sentence before/after it than the cloud model was (the web
     * prototype's Gemini call sets `responseMimeType: "application/json"`, which
     * forces strict JSON server-side — there is no equivalent guarantee here, so
     * this parser has to be defensive rather than trusting raw output).
     *
     * NOT verified against real model output — this is a reasonable defensive
     * parser, not one tuned against Gemma 3n's actual failure modes. Expect to
     * revise this once you see what the real model does wrong.
     */
    private fun parseSynthesisJson(raw: String): SynthesisOutput {
        val cleaned = raw
            .trim()
            .removePrefix("```json").removePrefix("```")
            .removeSuffix("```")
            .trim()

        val start = cleaned.indexOf('{')
        val end = cleaned.lastIndexOf('}')
        require(start != -1 && end != -1 && end > start) {
            "On-device model did not return a JSON object. Raw output: $raw"
        }

        val obj = json.parseToJsonElement(cleaned.substring(start, end + 1)).jsonObject
        fun field(name: String): String = obj[name]?.jsonPrimitiveOrNull() ?: "Not provided by the model."

        return SynthesisOutput(
            finding = field("finding"),
            whatChanged = field("whatChanged"),
            `when` = field("when"),
            historicalContext = field("historicalContext"),
            uncertainty = field("uncertainty"),
        )
    }

    private fun JsonElement.jsonPrimitiveOrNull(): String? = try {
        this.jsonPrimitive.content
    } catch (e: Exception) {
        null
    }
}

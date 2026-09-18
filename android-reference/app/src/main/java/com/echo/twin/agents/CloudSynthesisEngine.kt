package com.echo.twin.agents

import com.echo.twin.models.EvidenceItem
import com.echo.twin.models.SynthesisOutput
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody

/**
 * Kept for two reasons, not as the "real" path: (1) a graceful-degradation option
 * if the target device can't run the on-device model at all (thermal-limited,
 * unsupported chipset, low RAM) — better to fall back to a cloud call during
 * pre-demo development than to have no working synthesis at all; (2) a
 * like-for-like comparison target while validating OnDeviceSynthesisEngine's
 * output quality during development. This should NOT be the path active during an
 * actual Red Light / offline demo — it requires network access by definition.
 *
 * Direct port of the cloud branch of geminiSynthesis() in src/lib/gemini.ts.
 *
 * NOT verified: this hand-rolls the Gemini REST payload rather than using an
 * official Android SDK. If a first-party Kotlin Gemini SDK exists at build time,
 * prefer it over this raw OkHttp call — request/response shape here may drift
 * from the live API by the time this is built.
 */
class CloudSynthesisEngine(
    private val apiKey: String,
    private val client: OkHttpClient = OkHttpClient(),
) : SynthesisEngine {

    override val poweredBy = "gemini"
    private val json = Json { ignoreUnknownKeys = true }

    @Serializable
    private data class Part(val text: String)

    @Serializable
    private data class Content(val parts: List<Part>)

    @Serializable
    private data class SystemInstruction(val parts: List<Part>)

    @Serializable
    private data class GenerationConfig(val responseMimeType: String = "application/json")

    @Serializable
    private data class GeminiRequest(
        val systemInstruction: SystemInstruction,
        val contents: List<Content>,
        val generationConfig: GenerationConfig = GenerationConfig(),
    )

    override suspend fun synthesize(
        question: String,
        intent: String,
        payloadJson: String,
        evidence: List<EvidenceItem>,
    ): SynthesisOutput = withContext(Dispatchers.IO) {
        val evidenceJson = json.encodeToString(
            kotlinx.serialization.builtins.ListSerializer(EvidenceItem.serializer()),
            evidence.take(12),
        )
        val prompt = """
            Caregiver question: "$question"
            Detected intent: $intent
            Tool output (JSON): $payloadJson
            Evidence (JSON): $evidenceJson
        """.trimIndent()

        val requestBody = GeminiRequest(
            systemInstruction = SystemInstruction(listOf(Part(EchoSystemPrompt.TEXT))),
            contents = listOf(Content(listOf(Part(prompt)))),
        )
        val bodyJson = json.encodeToString(GeminiRequest.serializer(), requestBody)

        val request = Request.Builder()
            .url("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=$apiKey")
            .post(bodyJson.toRequestBody("application/json".toMediaType()))
            .build()

        client.newCall(request).execute().use { response ->
            val envelope = response.body?.string().orEmpty()
            // The Gemini API wraps the model's actual text output inside
            // candidates[0].content.parts[0].text — that text is itself the JSON
            // string we asked for via responseMimeType, so it needs a second parse.
            val modelText = json.parseToJsonElement(envelope).jsonObject["candidates"]
                ?.jsonArrayFirstOrNull()?.jsonObject?.get("content")?.jsonObject
                ?.get("parts")?.jsonArrayFirstOrNull()?.jsonObject?.get("text")
                ?.jsonPrimitive?.content
                ?: error("Unexpected Gemini response shape: $envelope")
            val obj = json.parseToJsonElement(modelText).jsonObject
            fun field(name: String) = obj[name]?.jsonPrimitive?.content ?: "Not provided."
            SynthesisOutput(
                finding = field("finding"),
                whatChanged = field("whatChanged"),
                `when` = field("when"),
                historicalContext = field("historicalContext"),
                uncertainty = field("uncertainty"),
            )
        }
    }

    private fun JsonElement.jsonArrayFirstOrNull(): JsonElement? = try {
        this.jsonArray.firstOrNull()
    } catch (e: Exception) {
        null
    }
}

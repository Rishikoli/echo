package com.echo.twin.agents

import android.content.Context
import com.google.mediapipe.tasks.genai.llminference.LlmInference
import com.google.mediapipe.tasks.genai.llminference.LlmInference.LlmInferenceOptions
import java.io.File
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

/**
 * Resolves and loads the on-device model file, and owns the warm-start strategy
 * discussed in docs/ON_DEVICE_ARCHITECTURE.md: cold-loading an ~2-4GB INT4 model
 * from storage is a multi-second operation, so it must happen once when the app
 * opens — NOT lazily on the first investigation question, which is exactly the
 * moment a judge is watching the screen.
 *
 * NOT verified: the exact `.task` file format / model card for whichever Gemma 3n
 * checkpoint you download. Confirm the file you pull from Google AI Edge / Kaggle
 * Models is the LiteRT-packaged `.task` format this API expects, not a raw
 * safetensors/GGUF checkpoint — those are for a different runtime (llama.cpp),
 * not MediaPipe.
 */
class ModelManager(private val context: Context) {

    private var cached: LlmInference? = null

    companion object {
        // Adjust to wherever the model file actually lands after download —
        // app-private storage (filesDir), not a bundled asset (see build.gradle
        // snippet's note on why not to bundle a multi-GB file in the APK).
        private const val MODEL_FILENAME = "gemma-3n-e2b-int4.task"
    }

    fun modelFile(): File = File(context.filesDir, MODEL_FILENAME)

    fun isModelReady(): Boolean = modelFile().exists()

    /**
     * Call once, at app start (e.g. Application.onCreate or a splash screen),
     * well before any investigation question can be asked. Returns the loaded
     * engine so the caller can hold it for the app's lifetime rather than
     * reloading per-question.
     */
    suspend fun preload(): LlmInference = withContext(Dispatchers.IO) {
        cached?.let { return@withContext it }

        check(isModelReady()) {
            "Model file not found at ${modelFile().path} — download it before calling preload(). " +
                "See README.md step 3."
        }

        val options = LlmInferenceOptions.builder()
            .setModelPath(modelFile().absolutePath)
            .setMaxTokens(512) // synthesis output is a short structured JSON object, not free-form prose
            .setTopK(40)
            .setTemperature(0.3f) // low temperature — this task is grounded extraction/summarization, not creative writing
            .setRandomSeed(0)
            .build()

        // NOT verified: whether createFromOptions performs NNAPI/QNN NPU delegation
        // automatically on Snapdragon, or whether it needs an explicit delegate
        // argument in the version you build against. Check the current MediaPipe
        // docs for the GPU/NPU acceleration flag — this has moved between API
        // versions and directly affects whether you're actually using the NPU
        // (the hackathon's whole point) or silently falling back to CPU.
        LlmInference.createFromOptions(context, options).also { cached = it }
    }

    fun release() {
        cached?.close()
        cached = null
    }
}

# ECHO — Android reference implementation (Round 2)

This directory is **reference code, not a working Android project.** It was written
without Android Studio, without the Android SDK/NDK, and without a physical device —
none of that tooling exists in the environment this was written in, so none of it has
been compiled or run. Treat it the way you'd treat a detailed pseudocode spec written
by someone who knows the target APIs well: a fast, accurate starting point that still
needs a real build-and-test pass before a demo depends on it.

What it *is* faithful to: the actual public API surface of the MediaPipe LLM
Inference task (`com.google.mediapipe:tasks-genai`) as of the version this was
written against, and the exact data contract (`InvestigationResult`,
`EvidenceItem`, `ToolTraceStep`) already implemented and running in the Round 1 web
prototype (`src/lib/types.ts`). The intent is that a working Android build swaps in
these Kotlin equivalents without changing the shape of anything upstream or
downstream of the Synthesis Agent.

## What to do with this before the final demo

1. Create a real Android Studio project targeting your actual iQOO device's API level.
2. Add the `tasks-genai` dependency (see `build.gradle.kts.snippet`) and **check its
   current version and API against the [official MediaPipe LLM Inference
   docs](https://ai.google.dev/edge/mediapipe/solutions/genai/llm_inference)** —
   this API has changed shape across releases (streaming callbacks, multimodal
   `addImage`/session APIs were added later than the base text API), so confirm the
   method names below still match before you build.
3. Download an actual Gemma 3n `.task` model file (via Google AI Edge / Kaggle
   Models, INT4 quantized, E2B variant) onto a test device and confirm
   `LlmInference.createFromOptions()` actually loads it — model loading is the
   single most likely place for this reference code to be wrong, since exact file
   format requirements change between MediaPipe releases.
4. Benchmark cold-start load time and per-query latency on the real target device
   before deciding whether E2B or E4B is the one you ship — see the feasibility
   notes in `docs/ON_DEVICE_ARCHITECTURE.md` in the repo root.
5. Wire `OnDeviceSynthesisEngine` in behind the same `SynthesisEngine` interface
   `CloudSynthesisEngine` and `TemplateSynthesisEngine` implement, so the rest of the
   app (whatever UI layer you build) never needs to know which one is active.

## File map

```
app/src/main/java/com/echo/twin/
├── models/
│   ├── InvestigationResult.kt   — mirrors src/lib/types.ts InvestigationResult
│   ├── EvidenceItem.kt          — mirrors src/lib/types.ts EvidenceItem
│   └── ToolTraceStep.kt         — mirrors src/lib/types.ts ToolTraceStep
├── tools/
│   └── RouterAgent.kt           — mirrors src/lib/agents/routerAgent.ts (intent classification)
├── agents/
│   ├── SynthesisEngine.kt          — the interface every synthesis backend implements
│   ├── OnDeviceSynthesisEngine.kt  — Gemma 3n via MediaPipe LLM Inference (the Round 2 swap-in)
│   ├── CloudSynthesisEngine.kt     — reference cloud fallback, mirrors gemini.ts's Gemini path
│   ├── TemplateSynthesisEngine.kt  — reference deterministic fallback, mirrors gemini.ts's template path
│   └── ModelManager.kt             — model file resolution/loading, warm-start strategy
└── build.gradle.kts.snippet     — dependency block to paste into a real module's build file
```

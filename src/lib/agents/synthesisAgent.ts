// SYNTHESIS AGENT — the on-device swap point.
// Every other agent in this system produces structured data (numbers, dates, graph
// nodes). This is the only agent whose job is language: turning that structured
// output into the Finding / What Changed / When / Historical Context / Uncertainty
// explanation a caregiver reads.
//
// Round 1: `investigate()` in gemini.ts — calls the cloud Gemini API if
// GEMINI_API_KEY is set, otherwise a deterministic template built from the same
// tool output. Both paths read identical structured input; only the "writer" differs.
//
// Round 2: this is the ONE agent that gets replaced with an on-device model call —
// Gemma 3n (E2B, INT4) via the MediaPipe LLM Inference API. See
// android-reference/ for the Kotlin implementation and
// docs/ON_DEVICE_ARCHITECTURE.md for why this model/quantization was chosen. The
// system prompt and the JSON output contract below are intentionally identical to
// what the Android reference implementation sends the on-device model — swapping
// the backend does not mean re-designing the interface.

export { investigate, SYSTEM_PROMPT } from "../gemini";

// SPEECH AGENT
// Today: acoustic analysis (energy-based voice-activity detection) computed
// client-side via the Web Audio API. Verified against a synthetic test file with
// known ground truth (50% silence in, 0.49 pause ratio out).
//
// Planned: Gemma 3n takes audio natively as an input modality, so this agent's role
// shifts from "acoustic proxy" to "transcription + understanding" without needing
// a bolted-on separate ASR model — see docs/ON_DEVICE_ARCHITECTURE.md.
// The DSP function below does not disappear; it's a useful fast pre-filter (e.g.
// "was there meaningful speech in this clip at all") ahead of the more expensive
// model call.

export { analyzeSpeechFile, type SpeechAnalysisResult } from "../audioAnalysis";
export { SPEECH_SESSIONS } from "../mockData";
export { speechBaseline } from "../twin";

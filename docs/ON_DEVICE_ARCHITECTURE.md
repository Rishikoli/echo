# ECHO — On-Device Architecture (Round 2)

This document is the engineering reasoning behind the Round 2 plan, not a feature
wishlist. Every claim below is labeled with its actual status: what's already
running (Round 1, this repo), what's a reference implementation not yet compiled or
tested (`android-reference/`), and what still needs validation on real hardware
before it should be trusted in front of judges.

The live version of the agent roster this document describes is
[`src/lib/agents/index.ts`](../src/lib/agents/index.ts) — it also renders at
`/architecture` in the running app. If the two ever disagree, the code is correct
and this document is stale.

---

## 1. Why agents, not one model

ECHO is nine specialized agents. Five of them are pure deterministic computation —
Router, Progression, Evidence, Memory, Scenario — and **stay that way in Round 2**.
That's a deliberate choice, not a shortcut: a caregiver-facing tool that reports a
memory score, a routine-adherence percentage, or a "what if" simulation should
produce the same number every time from the same input, and should never silently
hallucinate one. Only one agent — Synthesis — generates language, because language
generation is the only task in this system that actually requires it.

This has a direct latency consequence, which is why it's an architecture decision
and not just a philosophical one: every additional model call on a phone costs real,
user-visible seconds. A naive agent loop that asks a model to decide each tool call
would multiply that cost by however many steps an investigation takes. Keeping
routing and data retrieval deterministic, and reserving the model for exactly one
step — turning already-retrieved structured data into a short explanation — is what
makes this feasible at phone latency at all.

## 2. The nine agents

| Agent | Status | Deterministic? | Round 1 (this repo) | Round 2 |
|---|---|---|---|---|
| Router | Built | Yes | `src/lib/agents/routerAgent.ts` — keyword intent classification | Unchanged |
| Progression | Built | Yes | `twin.ts` + `tools.ts` — baseline/trend math | Unchanged (pure arithmetic) |
| Evidence | Built | Yes | `get_evidence()` in `tools.ts` | Unchanged retrieval logic |
| Memory | Built | Yes | `query_memory_graph()`, static in-memory graph | Same traversal, real on-device store once data is dynamic |
| Scenario | Built | Yes | `simulate_scenario()`, transparent heuristic | Unchanged — stays non-generative on purpose |
| Speech | Partial | Yes (today) | `audioAnalysis.ts` — real Web Audio DSP, verified against synthetic test audio | Gemma 3n native audio input for real transcription |
| Vision | Planned | No | Not implemented — typed stub only (`visionAgent.matchPhoto` throws on purpose) | Gemma 3n native image input vs. Memory Agent graph |
| Monitoring | Built | Yes | `detectMeaningfulChanges()` + a real, permission-gated browser Notification | Same detection logic; native Android notification instead |
| Synthesis | Partial | No | `investigate()` in `gemini.ts` — cloud Gemini or a deterministic template | **The swap point** — Gemma 3n (E2B, INT4) on-device |

Full responsibilities, inputs, and outputs per agent are in the registry
(`src/lib/agents/index.ts`) and visible live at `/architecture`.

## 3. Model decision

**Primary: Gemma 3n, E2B variant, INT4 quantization, via the MediaPipe LLM
Inference API.**

**Fallback: Gemma 3 4B, GGUF, Q4_K_M, via llama.cpp.**

### Reasoning

The original plan called for an ~8B parameter model at INT8. Rejected for two
concrete reasons:

1. **Memory.** INT8 at 8B parameters means roughly 8GB for weights alone, before KV
   cache and runtime overhead — realistically 10-12GB+ of RAM in active use. That's
   at the edge of what even a high-RAM flagship phone can spare while running
   anything else. INT4 roughly halves the weight footprint; for a task that's
   grounded extraction/summarization rather than open-ended generation, INT4's
   quality cost is an acceptable trade for the memory headroom it buys back.

2. **Model juggling.** The original plan implied three separate models resident at
   once — a reasoning LLM, a speech model (Whisper-class), a vision model. Running
   three models simultaneously in memory on a phone is unrealistic; the alternative
   is sequential load/unload per task, which adds multi-second model-swap latency
   into every interaction that touches more than one modality.

Gemma 3n resolves both at once, not by being a cleverer quantization of the same
idea, but by being a different kind of model: it's **natively multimodal** (text,
audio, image through one model, not three) and uses a matryoshka/per-layer-embedding
architecture specifically engineered so its effective memory footprint (E2B ≈
2B-equivalent) is much smaller than a same-quality dense model of similar
capability. It also ships with first-party Android support via Google AI Edge / the
MediaPipe LLM Inference API, including Snapdragon NPU delegate paths — the shortest
realistic path to something working in hackathon time, rather than a DIY NDK
integration project.

If Gemma 3n's NPU delegate proves unreliable on the actual target chipset during
testing — **this needs validating on real hardware, not assumed** — the fallback is
Gemma 3 4B via llama.cpp: less elegant (back to separate models per modality), but
the runtime with the broadest proven track record on Snapdragon of any option
available today.

### What this assumes, and what needs confirming

This plan assumes a mainstream flagship RAM tier (~12GB). **Confirm the actual RAM
of the target iQOO device before finalizing E2B vs. E4B** — an 8GB device should
treat E4B as out of scope and E2B only; a 16GB device has comfortable room for E4B.

## 4. Feasibility risk register

| Risk | Classification | Notes |
|---|---|---|
| INT4 quality vs. INT8 for structured synthesis | Needs validation | Task is grounded extraction, not creative generation — hypothesis is INT4 is sufficient, not proven |
| Model-swap latency across Speech/Vision/Synthesis | Resolved by model choice | Gemma 3n's multimodality removes the need for 3 separate resident models |
| Cold-start model load time | Needs validation | Preload at app start (`ModelManager.preload()`), not on first question — see `android-reference/` |
| Sustained multi-query thermal throttling | Needs validation | Single demo query is likely fine; several back-to-back judge questions is the real stress case to rehearse |
| On-device storage footprint | Needs validation | Gemma 3n E2B (INT4) + whatever speech/vision assets remain separate — confirm against target device's free storage, not just total storage |
| NPU delegate actually engaging (vs. silent CPU fallback) | Needs validation | `ModelManager.kt` flags this explicitly — confirm the delegate flag for the MediaPipe version actually built against |
| Offline / Red Light survivability | Resolved by architecture, contingent on packaging | Sound *if* shipped as an installed app with the model file already on-device before the offline window — not sound if the app is a hosted web page fetching anything live |
| JSON output reliability from a smaller on-device model | Needs validation | `OnDeviceSynthesisEngine.kt`'s parser is defensive (strips markdown fences, tolerates surrounding text) because smaller models are more prone to malformed output than the cloud model was — untested against real Gemma 3n output |

## 5. What "Round 1" vs "Round 2" actually means for this repo

Round 1 (this repository, as running today) intentionally mocks or omits:

- The Synthesis Agent's model backend (cloud/template instead of on-device)
- The Vision Agent entirely (typed stub, throws on call)
- Real ASR/transcription in the Speech Agent (real DSP, no transcription yet)

Round 1 does **not** mock, and should not be read as mocked:

- Progression, Evidence, Memory, and Scenario agents — pure computation, already
  correct, and unchanged by the on-device migration
- The Monitoring Agent's notification — a real, permission-gated browser
  `Notification`, not a cosmetic badge
- The Speech Agent's acoustic analysis — real Web Audio API signal processing,
  verified against a synthetic test file with known ground truth

## 6. Migration path

1. Stand up a real Android Studio project; see `android-reference/README.md` for
   the concrete next steps and what in that reference code is unverified.
2. Port the four deterministic tool agents (Progression, Evidence, Memory,
   Scenario) — straightforward, since none of them depend on anything model- or
   platform-specific; the logic in `tools.ts`/`twin.ts` translates directly.
3. Wire `ModelManager` + `OnDeviceSynthesisEngine` against a real downloaded Gemma
   3n `.task` file and benchmark load time and per-query latency before committing
   to E2B vs. E4B.
4. Build the Vision Agent's actual implementation against the Memory Agent's graph.
5. Replace the Speech Agent's placeholder with Gemma 3n's audio input path.
6. Package as an installed app (not a hosted web view) so the Red Light constraint
   is survivable by construction, not by hope.

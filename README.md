# ECHO

A local-first, explainable Digital Twin for longitudinal dementia care.

ECHO compares new observations against a person's own history — never a generic
population average — and explains what changed, when it first changed, whether it's
happened before, and what a modeled "what if" scenario might look like. It's built
around one synthetic demo patient (Meera Sharma, 72) with six months of mock
cognitive, speech, routine, caregiver, and imaging data.

This is a working MVP slice of a much larger product spec, not the full system —
see [What's not built yet](#whats-not-built-yet) below.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Enabling live Gemini synthesis (optional)

By default, ECHO runs entirely offline: every "tool" reads from mock data, and the
Investigation panel's synthesis step uses a deterministic template built from that
same data. To route synthesis through a real Gemini call instead:

```bash
cp .env.local.example .env.local
# then set GEMINI_API_KEY in .env.local
```

No other code path changes — tool selection and data stay identical either way, only
the final natural-language synthesis step changes.

## Pages

| Route | What it shows |
| --- | --- |
| `/dashboard` | Current state summary, brain twin preview, recent 6-month trend, meaningful changes |
| `/brain` | Interactive 2D brain twin — click a region for its baseline, current state, trend, and evidence |
| `/progression` | Multi-domain trend chart with domain/range selectors, first-detected-change timeline, historical comparison |
| `/memory` | Interactive graph of the patient's people, places, events, routines, and stories (the "Life Twin") |
| `/investigate` | Ask the Twin a question (preset or free text); returns a tool-execution trace plus a sourced, structured answer |
| `/scenario` | "What if" simulator — adjust routine/social/sleep variables and see a modeled (not clinical) projection |

## Architecture

```
src/
├── app/                    Next.js App Router pages + API routes
│   ├── api/investigate/    POST → runs tool orchestration + LLM synthesis
│   └── api/simulate/       POST → runs the scenario engine
├── components/             UI: BrainTwin, ProgressionChart, MemoryGraph, etc.
└── lib/
    ├── mockData.ts         The synthetic patient dataset (single source of truth)
    ├── twin.ts             Personal-baseline + trend computation ("progression engine")
    ├── tools.ts             Tool functions the orchestrator can call (find_first_change,
    │                        find_similar_period, get_evidence, simulate_scenario, …)
    ├── gemini.ts            Question routing + LLM synthesis (Gemini or template fallback)
    └── types.ts             Shared TypeScript types
```

**Data flow for an investigation:** a question comes in → `gemini.ts` deterministically
routes it to the relevant tool(s) in `tools.ts` → those tools read `mockData.ts` and
run it through the baseline/trend logic in `twin.ts` → the structured result is either
handed to Gemini or a template for the final Finding / What Changed / When / Historical
Context / Uncertainty write-up.

**The brain visualization** (`public/brain-lobes-interactive.svg`) is a real
interactive SVG: every path carries a `data-region` attribute, and `BrainTwin.tsx`
attaches a click handler in React (the SVG's own embedded `<script>` doesn't run,
since browsers block scripts injected via `innerHTML`). Region status dots are
positioned using each region's actual on-screen geometry via `getBBox()`/`getCTM()`,
so the underlying illustration is never modified — only overlaid.

**Personal baseline, not population norms:** every domain's "baseline" is computed
from that patient's own earliest recorded months, and every comparison downstream
(brain region color, chart trend lines, investigation findings) is relative to that
baseline — this is the core premise of the product, not just a dashboard feature.

## Tech stack

- Next.js 16 (App Router), React 19, TypeScript
- Tailwind CSS v4
- `@google/generative-ai` (Gemini) for optional LLM synthesis
- No database — all data lives in `src/lib/mockData.ts` for this MVP

## What's not built yet

The full ECHO spec describes a much larger system. This MVP intentionally leaves out:

- Real speech pipeline (Whisper transcription, WavLM acoustic features)
- MRI segmentation pipeline (mock MRI feature snapshots only)
- Persistent storage (PostgreSQL, Neo4j, pgvector) — everything is in-memory mock data
- On-device Gemma; multi-turn agentic function-calling loop (tool routing here is
  deterministic per question, not model-driven)
- Multiple patients, auth, and role-based views (patient / caregiver / clinician)
- Twin versioning / update pipeline from new incoming data

## Disclaimer

All patient data is synthetic and generated for demonstration purposes. ECHO is not
a diagnostic system and does not provide medical advice.

// VISION AGENT — planned for Round 2, not implemented in this prototype.
//
// Intended role: the "Memory Bridge" (spec sections 17-18). Patient points the
// camera at a person or photo; this agent matches it against the Memory Agent's
// graph and returns a progressive-disclosure result (Level 1 "someone you know" →
// Level 4 "this is Priya, your daughter").
//
// Round 2 plan: Gemma 3n's native image input, matched against MEMORY_NODES via a
// lightweight on-device embedding comparison — not a general-purpose VLM, since the
// actual task (match against a small, known set of faces/places) doesn't need one.
//
// This file exists to make the interface contract explicit ahead of implementation,
// not to fake a working feature — calling it throws, on purpose, rather than
// returning a plausible-looking fabricated match.

import type { MemoryNode } from "../types";

export interface VisionMatchResult {
  matchedNode: MemoryNode | null;
  confidence: number;
  disclosureLevel: 1 | 2 | 3 | 4;
}

/**
 * @throws Always — this agent is not implemented in the Round 1 prototype.
 * Kept as a typed stub so the Router Agent's dispatch table and the UI layer can
 * reference a real function signature ahead of the Round 2 build, rather than a
 * TODO comment with no contract.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- signature kept for the Round 2 contract
export function matchPhoto(_imageData: Blob): Promise<VisionMatchResult> {
  throw new Error(
    "visionAgent.matchPhoto is not implemented in the Round 1 prototype — planned for the on-device Round 2 build (Gemma 3n image input)."
  );
}

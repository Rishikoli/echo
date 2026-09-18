// EVIDENCE AGENT
// Retrieves supporting observations across every source (speech, caregiver notes,
// routine system, cognitive assessments, MRI) and attaches a confidence score to
// each. Deterministic — confidence here is a fixed function of source/severity, not
// a model estimate, so it stays auditable. If evidence volume grows in Round 2, this
// agent's outputs are still what the on-device Synthesis Agent reads; only the
// synthesis step ever generates language.

export { get_evidence, find_similar_period, get_current_twin } from "../tools";

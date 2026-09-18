// SCENARIO AGENT
// Runs "what if" simulations (routine consistency, social interaction, sleep
// regularity) against the patient's own historical relationships between those
// variables and behavioral measures. Deliberately a transparent heuristic formula,
// not a generative model — a caregiver-facing simulation that could quietly
// hallucinate an outcome is worse than one that is visibly simple. This agent stays
// deterministic in Round 2 for the same reason the Progression Agent does.

export { simulate_scenario } from "../tools";

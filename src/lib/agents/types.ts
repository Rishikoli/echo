// ECHO — agent registry types
//
// ECHO is structured as a small set of specialized agents rather than one monolithic
// model. Each agent has ONE job, a defined input/output contract, and an explicit
// status: what backs it today (Round 1, this web prototype) vs. what replaces it in
// the on-device build (Round 2). See docs/ON_DEVICE_ARCHITECTURE.md for the reasoning.
//
// Deliberately, not every agent is model-backed — several are pure deterministic
// computation (progression math, evidence retrieval, scenario simulation) and STAY
// that way in Round 2. An agent only calls the on-device LLM when the task is
// genuinely language generation, not because "agent" implies "model."

export type AgentStatus = "built" | "partial" | "planned";

export interface AgentSpec {
  id: string;
  name: string;
  /** One-line role, shown as the headline in the UI and docs. */
  role: string;
  /** What this agent is responsible for, in more detail. */
  responsibilities: string[];
  status: AgentStatus;
  /** True if this agent's core logic is (and stays) deterministic, not model-backed. */
  deterministic: boolean;
  /** What actually runs today, in the Round 1 web prototype. */
  round1: string;
  /** What replaces or augments it in the on-device Round 2 build. */
  round2: string;
  inputs: string;
  outputs: string;
}

export const STATUS_LABEL: Record<AgentStatus, string> = {
  built: "Built",
  partial: "Partially built",
  planned: "Planned for Round 2",
};

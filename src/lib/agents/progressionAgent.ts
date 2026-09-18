// PROGRESSION AGENT
// Computes personal-baseline deviation, trend, and the first-detected-change
// timeline. Deliberately NOT model-backed, in Round 1 or Round 2: this is pure
// arithmetic over the patient's own history, and an LLM would only add latency and
// a hallucination surface to a task that has one correct numeric answer.

export {
  allDomainProgress,
  domainProgress,
  brainTwinState,
  earliestDeviationForDomain,
  monthEndDate,
} from "../twin";
export { detect_progression, find_first_change, compare_personal_baseline, get_patient_timeline } from "../tools";

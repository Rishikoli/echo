// ROUTER AGENT
// Classifies an incoming question and decides which other agent(s) it needs.
// Deterministic by design: on a phone, every round of "let the model decide what to
// do next" costs a full inference pass. Routing is fast, free, and — for a fixed set
// of investigation intents — more reliable than asking a 2-4B model to pick a tool
// name correctly every time. The model's job starts after routing, at Synthesis.

export type Intent = "first_change" | "similar_period" | "forensics" | "evidence" | "what_changed";

export function classifyIntent(question: string): Intent {
  const q = question.toLowerCase();
  if (q.includes("changed first") || q.includes("first change") || q.includes("earliest")) return "first_change";
  if (q.includes("happened before") || q.includes("similar") || q.includes("before")) return "similar_period";
  if (q.includes("why") || q.includes("flagged") || q.includes("forensic")) return "forensics";
  if (q.includes("evidence")) return "evidence";
  return "what_changed";
}

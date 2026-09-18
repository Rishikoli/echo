// RECALL AGENT
// Generates active-recall mini-games directly from the patient's real Twin data —
// the Memory graph, the routine steps, and the Progression Agent's real deviation
// timeline. Deterministic: every round and every correct answer is derived from
// actual mock data, never invented trivia, so a caregiver could trace any question
// back to the same source the rest of the app already shows.
//
// "Active recall" (retrieval practice) is a real, well-studied learning technique —
// testing memory retrieval is more effective for retention than passive review. This
// agent applies that idea to the patient's own people, routines, and recent history
// instead of generic flashcards.
//
// Three distinct game types (not hint-levels within one game):
//   - People    — who is this, and how are they related?
//   - Routine   — put the day's real routine steps back in order
//   - Timeline  — reconstruct the real order deviations were first detected in

import { MEMORY_NODES, MEMORY_EDGES, ROUTINE_STEPS, type RoutineStep } from "../mockData";
import { find_first_change } from "../tools";

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// ---- People round ----

export interface PeopleRound {
  personId: string;
  personLabel: string;
  detail: string;
  correctRelationship: string;
  options: string[]; // shuffled, includes the correct answer
}

const RELATIONSHIP_LABEL: Record<string, string> = {
  PARENT_OF: "Child",
  SPOUSE_OF: "Spouse",
  FRIEND_OF: "Friend",
};

export function generatePeopleRound(): PeopleRound | null {
  const people = MEMORY_NODES.filter((n) => n.type === "person");
  const relEdges = MEMORY_EDGES.filter(
    (e) => e.from === "patient" && ["PARENT_OF", "SPOUSE_OF", "FRIEND_OF"].includes(e.relationship)
  );
  if (people.length < 2 || relEdges.length === 0) return null;

  const edge = relEdges[Math.floor(Math.random() * relEdges.length)];
  const person = people.find((p) => p.id === edge.to);
  if (!person) return null;

  const correctRelationship = RELATIONSHIP_LABEL[edge.relationship] ?? edge.relationship;
  const distractorPool = Array.from(new Set(relEdges.map((e) => RELATIONSHIP_LABEL[e.relationship] ?? e.relationship)))
    .filter((r) => r !== correctRelationship);
  // Pad with generic-but-plausible relationship labels if the real graph doesn't
  // have enough distinct relationship types among the patient's edges.
  const padding = ["Neighbor", "Grandchild", "Sibling"].filter((r) => r !== correctRelationship && !distractorPool.includes(r));
  const options = shuffle([correctRelationship, ...shuffle([...distractorPool, ...padding]).slice(0, 3)]);

  return {
    personId: person.id,
    personLabel: person.label,
    detail: person.detail ?? person.subtitle ?? "",
    correctRelationship,
    options,
  };
}

// ---- Routine round ----

export interface RoutineRound {
  routine: "morning" | "evening";
  shuffled: RoutineStep[];
  correctOrder: RoutineStep[];
}

export function generateRoutineRound(): RoutineRound {
  const routine: "morning" | "evening" = Math.random() < 0.5 ? "morning" : "evening";
  const correctOrder = ROUTINE_STEPS[routine];
  let shuffled = shuffle(correctOrder);
  // Reshuffle if we happened to land on the already-correct order.
  while (shuffled.every((s, i) => s === correctOrder[i]) && correctOrder.length > 1) {
    shuffled = shuffle(correctOrder);
  }
  return { routine, shuffled, correctOrder };
}

// ---- Timeline round ----

export interface TimelineRound {
  shuffled: { date: string; domain: string; summary: string }[];
  correctOrder: { date: string; domain: string; summary: string }[];
}

export function generateTimelineRound(): TimelineRound {
  const events = find_first_change().map((e) => ({ date: e.date, domain: e.domain, summary: e.summary }));
  let shuffled = shuffle(events);
  while (shuffled.every((s, i) => s === events[i]) && events.length > 1) {
    shuffled = shuffle(events);
  }
  return { shuffled, correctOrder: events };
}

// MEMORY AGENT
// Traverses the patient's Life Twin — people, places, events, routines, stories —
// and answers relationship queries ("who is Priya", "what connects to Home"). Backed
// by an in-memory graph today; the traversal logic itself doesn't change in Round 2,
// only the storage (a real on-device store instead of a static array once data is
// dynamic). This is the agent the Vision Agent hands a match to once a face/photo is
// recognized.

export { query_memory_graph } from "../tools";
export { MEMORY_NODES, MEMORY_EDGES } from "../mockData";

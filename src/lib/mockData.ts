// ECHO — mock patient data
// Fictional demo patient per spec section 65: Meera Sharma, 72, dementia / cognitive
// impairment. All data below is synthetic, for demonstration purposes only.

import type {
  MonthlySnapshot,
  SpeechSession,
  CaregiverObservation,
  RoutineDay,
  MRISnapshot,
  MemoryNode,
  MemoryEdge,
} from "./types";

export const PATIENT = {
  id: "P001",
  name: "Meera Sharma",
  age: 72,
  condition: "Dementia / cognitive impairment",
  location: "Home",
};

// Six months of longitudinal domain scores (0-100), matching the ECHO demo dataset.
// January is used as the personal baseline reference; June is the current month.
export const MONTHLY_SNAPSHOTS: MonthlySnapshot[] = [
  {
    month: "2026-01",
    label: "Jan",
    memory: 82,
    language: 79,
    executive: 83,
    spatial: 85,
    attention: 84,
    processingSpeed: 86,
    function: 86,
    routine: 90,
  },
  {
    month: "2026-02",
    label: "Feb",
    memory: 81,
    language: 78,
    executive: 82,
    spatial: 84,
    attention: 83,
    processingSpeed: 85,
    function: 85,
    routine: 88,
  },
  {
    month: "2026-03",
    label: "Mar",
    memory: 77,
    language: 73,
    executive: 80,
    spatial: 82,
    attention: 79,
    processingSpeed: 83,
    function: 84,
    routine: 82,
  },
  {
    month: "2026-04",
    label: "Apr",
    memory: 74,
    language: 72,
    executive: 78,
    spatial: 80,
    attention: 75,
    processingSpeed: 81,
    function: 83,
    routine: 76,
  },
  {
    month: "2026-05",
    label: "May",
    memory: 70,
    language: 70,
    executive: 76,
    spatial: 78,
    attention: 72,
    processingSpeed: 79,
    function: 82,
    routine: 69,
  },
  {
    month: "2026-06",
    label: "Jun",
    memory: 68,
    language: 68,
    executive: 74,
    spatial: 76,
    attention: 69,
    processingSpeed: 77,
    function: 81,
    routine: 64,
  },
];

// A prior-year window used to answer "has this happened before?". Models a temporary
// multi-domain dip (consistent with a UTI/infection-driven delirium) that partially
// resolved after treatment — a realistic and common pattern in dementia care.
export const HISTORICAL_WINDOW = {
  label: "Sep–Nov 2025",
  note: "A multi-domain dip coincided with a urinary tract infection; scores partially recovered after treatment in December 2025.",
  snapshots: [
    { month: "2025-09", label: "Sep", memory: 85, language: 82, routine: 91 },
    { month: "2025-10", label: "Oct", memory: 76, language: 74, routine: 79 },
    { month: "2025-11", label: "Nov", memory: 71, language: 70, routine: 68 },
    { month: "2025-12", label: "Dec", memory: 80, language: 79, routine: 87 },
  ],
};

export const SPEECH_SESSIONS: SpeechSession[] = [
  {
    sessionId: "S037",
    date: "2026-01-14",
    speechRate: 113,
    pauseRatio: 0.14,
    meanPauseMs: 540,
    repetitionRate: 0.06,
    wordFindingEvents: 1,
    lexicalDiversity: 0.68,
    semanticCoherence: 0.83,
    note: "Within personal baseline range.",
  },
  {
    sessionId: "S038",
    date: "2026-02-11",
    speechRate: 110,
    pauseRatio: 0.15,
    meanPauseMs: 560,
    repetitionRate: 0.08,
    wordFindingEvents: 2,
    lexicalDiversity: 0.66,
    semanticCoherence: 0.80,
    note: "Slight change, within normal variation.",
  },
  {
    sessionId: "S039",
    date: "2026-03-10",
    speechRate: 101,
    pauseRatio: 0.21,
    meanPauseMs: 690,
    repetitionRate: 0.17,
    wordFindingEvents: 5,
    lexicalDiversity: 0.60,
    semanticCoherence: 0.74,
    note: "Earliest detected deviation: pause ratio and repetition rate cross personal baseline range.",
  },
  {
    sessionId: "S040",
    date: "2026-04-09",
    speechRate: 96,
    pauseRatio: 0.24,
    meanPauseMs: 740,
    repetitionRate: 0.22,
    wordFindingEvents: 6,
    lexicalDiversity: 0.57,
    semanticCoherence: 0.70,
    note: "Continued decline relative to baseline.",
  },
  {
    sessionId: "S041",
    date: "2026-05-13",
    speechRate: 93,
    pauseRatio: 0.27,
    meanPauseMs: 790,
    repetitionRate: 0.28,
    wordFindingEvents: 7,
    lexicalDiversity: 0.54,
    semanticCoherence: 0.66,
    note: "Declining trend persists.",
  },
  {
    sessionId: "S042",
    date: "2026-06-12",
    speechRate: 90,
    pauseRatio: 0.29,
    meanPauseMs: 820,
    repetitionRate: 0.33,
    wordFindingEvents: 8,
    lexicalDiversity: 0.52,
    semanticCoherence: 0.63,
    note: "Declining trend persists; most recent session.",
  },
];

export const CAREGIVER_OBSERVATIONS: CaregiverObservation[] = [
  { id: "CG01", date: "2026-01-22", domain: "routine", text: "Followed the morning routine without prompting.", severity: "low" },
  { id: "CG02", date: "2026-02-18", domain: "memory", text: "Asked what day it was twice within an hour.", severity: "low" },
  { id: "CG03", date: "2026-03-10", domain: "language", text: "Paused mid-sentence searching for common words during breakfast conversation.", severity: "medium" },
  { id: "CG04", date: "2026-03-12", domain: "memory", text: "Repeated the same question about a doctor's appointment three times in one visit.", severity: "medium" },
  { id: "CG05", date: "2026-03-14", domain: "behavior", text: "Seemed briefly unsure of the caregiver's name before recognizing her.", severity: "medium" },
  { id: "CG06", date: "2026-03-15", domain: "memory", text: "Could not recall a family visit from the previous day.", severity: "medium" },
  { id: "CG07", date: "2026-03-18", domain: "routine", text: "Skipped the afternoon walk without explanation for the second time this week.", severity: "medium" },
  { id: "CG08", date: "2026-04-05", domain: "routine", text: "Needed reminders for medication timing on three separate days.", severity: "medium" },
  { id: "CG09", date: "2026-04-19", domain: "behavior", text: "Appeared briefly disoriented after waking from an afternoon nap.", severity: "medium" },
  { id: "CG10", date: "2026-05-02", domain: "memory", text: "Introduced a long-time neighbor as a stranger before recognizing them.", severity: "high" },
  { id: "CG11", date: "2026-05-16", domain: "routine", text: "Wandered into the garden at night; found and guided back safely.", severity: "high" },
  { id: "CG12", date: "2026-05-27", domain: "function", text: "Needed help selecting appropriate clothing for the weather.", severity: "medium" },
  { id: "CG13", date: "2026-06-03", domain: "language", text: "Substituted a related but incorrect word several times ('spoon' for 'fork').", severity: "medium" },
  { id: "CG14", date: "2026-06-09", domain: "routine", text: "Morning routine order was reversed; medication taken after breakfast instead of before.", severity: "medium" },
  { id: "CG15", date: "2026-06-15", domain: "memory", text: "Did not recognize a recent photograph of a family gathering from two weeks earlier.", severity: "high" },
];

// Sample routine-adherence readings across the six months (morning routine).
export const ROUTINE_DAYS: RoutineDay[] = [
  { date: "2026-01-08", routine: "morning", expectedAdherence: 0.92, observedAdherence: 0.93, deviation: -0.01 },
  { date: "2026-01-24", routine: "morning", expectedAdherence: 0.92, observedAdherence: 0.90, deviation: 0.02 },
  { date: "2026-02-07", routine: "morning", expectedAdherence: 0.91, observedAdherence: 0.89, deviation: 0.02 },
  { date: "2026-02-21", routine: "morning", expectedAdherence: 0.91, observedAdherence: 0.87, deviation: 0.04 },
  { date: "2026-03-06", routine: "morning", expectedAdherence: 0.91, observedAdherence: 0.80, deviation: 0.11, notes: "Skipped medication step." },
  { date: "2026-03-20", routine: "morning", expectedAdherence: 0.91, observedAdherence: 0.74, deviation: 0.17, notes: "Missed breakfast step order." },
  { date: "2026-04-03", routine: "morning", expectedAdherence: 0.91, observedAdherence: 0.71, deviation: 0.20 },
  { date: "2026-04-17", routine: "morning", expectedAdherence: 0.91, observedAdherence: 0.68, deviation: 0.23, notes: "Needed reminders for medication timing." },
  { date: "2026-05-01", routine: "morning", expectedAdherence: 0.91, observedAdherence: 0.65, deviation: 0.26 },
  { date: "2026-05-15", routine: "morning", expectedAdherence: 0.91, observedAdherence: 0.61, deviation: 0.30, notes: "Nighttime wandering episode logged." },
  { date: "2026-06-05", routine: "morning", expectedAdherence: 0.91, observedAdherence: 0.63, deviation: 0.28, notes: "Routine step order reversed." },
  { date: "2026-06-16", routine: "morning", expectedAdherence: 0.91, observedAdherence: 0.61, deviation: 0.30 },
];

export const MRI_SNAPSHOTS: MRISnapshot[] = [
  {
    scanDate: "2025-12-08",
    regions: {
      hippocampus: { volume: 3.42, changeFromBaseline: 0 },
      ventricle: { volume: 40.1, changeFromBaseline: 0 },
      corticalThickness: { value: 2.51, changeFromBaseline: 0 },
    },
  },
  {
    scanDate: "2026-06-14",
    regions: {
      hippocampus: { volume: 3.21, changeFromBaseline: -0.21 },
      ventricle: { volume: 42.3, changeFromBaseline: 2.2 },
      corticalThickness: { value: 2.43, changeFromBaseline: -0.08 },
    },
  },
];

// ---- Memory graph (Life Twin) — static layout positions for the SVG graph view ----

export const MEMORY_NODES: MemoryNode[] = [
  { id: "patient", type: "patient", label: "Meera", subtitle: "Patient", confidence: 1, x: 50, y: 50 },
  { id: "priya", type: "person", label: "Priya", subtitle: "Daughter", confidence: 0.99, x: 74, y: 30, detail: "Visits most Sundays. Lives across town with her husband and two children." },
  { id: "arjun", type: "person", label: "Arjun", subtitle: "Son", confidence: 0.97, x: 78, y: 62, detail: "Lives abroad; calls on video most weekends." },
  { id: "ravi", type: "person", label: "Ravi", subtitle: "Late husband", confidence: 0.9, x: 30, y: 18, detail: "Passed away in 2019. Married 44 years." },
  { id: "lakshmi", type: "person", label: "Lakshmi", subtitle: "Neighbor & friend", confidence: 0.85, x: 18, y: 62, detail: "Longtime neighbor; visits for tea on weekday afternoons." },
  { id: "home", type: "place", label: "Home", subtitle: "Residence", confidence: 1, x: 26, y: 42, detail: "Lives with live-in caregiver support since 2025." },
  { id: "garden", type: "place", label: "Garden", subtitle: "Home garden", confidence: 0.95, x: 14, y: 30, detail: "Tends marigolds and tulsi most mornings." },
  { id: "clinic", type: "place", label: "Sunrise Memory Clinic", subtitle: "Care clinic", confidence: 0.9, x: 62, y: 12, detail: "Monthly cognitive assessments and quarterly MRI." },
  { id: "school", type: "place", label: "Lotus Primary School", subtitle: "Former workplace", confidence: 0.8, x: 8, y: 46, detail: "Taught third grade for 28 years before retiring." },
  { id: "diwali", type: "event", label: "Diwali 2025", subtitle: "Family gathering", confidence: 0.93, x: 88, y: 18, detail: "Full family gathered at Home; Priya and Arjun both attended." },
  { id: "birthday", type: "event", label: "72nd Birthday", subtitle: "March 2026", confidence: 0.9, x: 90, y: 44, detail: "Small family celebration in the garden." },
  { id: "clinicvisit", type: "event", label: "June Assessment", subtitle: "Clinic visit", confidence: 0.95, x: 70, y: 6, detail: "Quarterly cognitive assessment and caregiver review." },
  { id: "morningroutine", type: "routine", label: "Morning Routine", subtitle: "Wake, breakfast, medication, walk", confidence: 0.9, x: 40, y: 66, detail: "07:30 wake, 08:00 breakfast, 08:30 medication, 09:00 walk." },
  { id: "eveningroutine", type: "routine", label: "Evening Routine", subtitle: "Dinner, music, wind-down", confidence: 0.88, x: 46, y: 82, detail: "19:00 dinner, 19:45 Hindi music, 20:30 bed." },
  { id: "musicstory", type: "story", label: "Old Hindi Music", subtitle: "Favorite pastime", confidence: 0.86, x: 60, y: 88, detail: "Listens to Lata Mangeshkar and Kishore Kumar records most evenings; reliably improves mood." },
  { id: "diwaliphoto", type: "photo", label: "Diwali Photo", subtitle: "Family photograph", confidence: 0.92, x: 96, y: 30, detail: "Whole family in front of the diyas at Home, Nov 2025." },
];

// Structured routine steps — the same facts already described in MEMORY_NODES'
// morningroutine/eveningroutine `detail` strings, broken out as an ordered array
// for the Routine Recall game rather than re-parsed from prose at runtime.
export interface RoutineStep {
  time: string;
  label: string;
}

export const ROUTINE_STEPS: Record<"morning" | "evening", RoutineStep[]> = {
  morning: [
    { time: "07:30", label: "Wake" },
    { time: "08:00", label: "Breakfast" },
    { time: "08:30", label: "Medication" },
    { time: "09:00", label: "Walk" },
  ],
  evening: [
    { time: "19:00", label: "Dinner" },
    { time: "19:45", label: "Hindi music" },
    { time: "20:30", label: "Bed" },
  ],
};

export const MEMORY_EDGES: MemoryEdge[] = [
  { id: "e1", from: "patient", to: "priya", relationship: "PARENT_OF", label: "parent of" },
  { id: "e2", from: "patient", to: "arjun", relationship: "PARENT_OF", label: "parent of" },
  { id: "e3", from: "patient", to: "ravi", relationship: "SPOUSE_OF", label: "spouse of" },
  { id: "e4", from: "patient", to: "lakshmi", relationship: "FRIEND_OF", label: "friend of" },
  { id: "e5", from: "patient", to: "home", relationship: "LIVES_AT", label: "lives at" },
  { id: "e6", from: "home", to: "garden", relationship: "PART_OF", label: "part of" },
  { id: "e7", from: "patient", to: "school", relationship: "ASSOCIATED_WITH", label: "worked at" },
  { id: "e8", from: "priya", to: "home", relationship: "VISITED", label: "visits" },
  { id: "e9", from: "priya", to: "diwali", relationship: "ASSOCIATED_WITH", label: "attended" },
  { id: "e10", from: "arjun", to: "diwali", relationship: "ASSOCIATED_WITH", label: "attended" },
  { id: "e11", from: "diwali", to: "home", relationship: "OCCURRED_AT", label: "occurred at" },
  { id: "e12", from: "priya", to: "diwaliphoto", relationship: "APPEARS_IN", label: "appears in" },
  { id: "e13", from: "arjun", to: "diwaliphoto", relationship: "APPEARS_IN", label: "appears in" },
  { id: "e14", from: "patient", to: "diwaliphoto", relationship: "APPEARS_IN", label: "appears in" },
  { id: "e15", from: "diwali", to: "diwaliphoto", relationship: "ASSOCIATED_WITH", label: "captured at" },
  { id: "e16", from: "patient", to: "morningroutine", relationship: "FOLLOWS", label: "follows" },
  { id: "e17", from: "patient", to: "eveningroutine", relationship: "FOLLOWS", label: "follows" },
  { id: "e18", from: "patient", to: "musicstory", relationship: "LIKES", label: "likes" },
  { id: "e19", from: "eveningroutine", to: "musicstory", relationship: "ASSOCIATED_WITH", label: "includes" },
  { id: "e20", from: "patient", to: "birthday", relationship: "ASSOCIATED_WITH", label: "celebrated" },
  { id: "e21", from: "birthday", to: "garden", relationship: "OCCURRED_AT", label: "occurred at" },
  { id: "e22", from: "priya", to: "birthday", relationship: "ASSOCIATED_WITH", label: "attended" },
  { id: "e23", from: "patient", to: "clinic", relationship: "ASSOCIATED_WITH", label: "patient of" },
  { id: "e24", from: "clinicvisit", to: "clinic", relationship: "OCCURRED_AT", label: "occurred at" },
  { id: "e25", from: "patient", to: "clinicvisit", relationship: "ASSOCIATED_WITH", label: "attended" },
  { id: "e26", from: "priya", to: "clinicvisit", relationship: "ASSOCIATED_WITH", label: "accompanied" },
  { id: "e27", from: "lakshmi", to: "home", relationship: "VISITED", label: "visits" },
  { id: "e28", from: "patient", to: "garden", relationship: "ASSOCIATED_WITH", label: "tends" },
];

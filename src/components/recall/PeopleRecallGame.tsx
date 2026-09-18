"use client";

import { useEffect, useState } from "react";
import { Check, X, RefreshCw } from "lucide-react";
import Card from "../Card";
import ScoreBadge from "./ScoreBadge";
import { generatePeopleRound, type PeopleRound } from "@/lib/agents/recallAgent";

export default function PeopleRecallGame() {
  // Rounds are randomly generated, so they must not be computed during the initial
  // render (server and client would each roll different random values and React
  // would flag a hydration mismatch) — generate the first round client-side only,
  // after mount.
  const [round, setRound] = useState<PeopleRound | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  useEffect(() => {
    const t = setTimeout(() => setRound(generatePeopleRound()), 0);
    return () => clearTimeout(t);
  }, []);

  function next() {
    setRound(generatePeopleRound());
    setSelected(null);
  }

  function choose(option: string) {
    if (selected || !round) return;
    setSelected(option);
    setScore((s) => ({ correct: s.correct + (option === round.correctRelationship ? 1 : 0), total: s.total + 1 }));
  }

  if (!round) return <Card className="min-h-[220px] flex items-center justify-center text-sm text-foreground/40">Loading round…</Card>;

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Who is this?</h3>
        <ScoreBadge score={score} />
      </div>

      <div className="rounded-xl bg-surface-muted p-4">
        <div className="font-display text-lg font-semibold text-foreground mb-1">{round.personLabel}</div>
        <p className="text-sm text-foreground/60">{round.detail}</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {round.options.map((opt) => {
          const isCorrect = opt === round.correctRelationship;
          const isChosen = opt === selected;
          const showState = selected !== null;
          return (
            <button
              key={opt}
              onClick={() => choose(opt)}
              disabled={selected !== null}
              className={`rounded-xl px-4 py-3 text-sm font-medium text-left transition-colors flex items-center justify-between gap-2 ${
                showState && isCorrect
                  ? "bg-sage-50 dark:bg-sage-900/25 text-sage-700 dark:text-sage-400 border border-sage-200 dark:border-sage-700/40"
                  : showState && isChosen
                  ? "bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900"
                  : "bg-surface-muted text-foreground/75 border border-transparent hover:border-brand-200"
              }`}
            >
              {opt}
              {showState && isCorrect && <Check size={15} />}
              {showState && isChosen && !isCorrect && <X size={15} />}
            </button>
          );
        })}
      </div>

      {selected && (
        <button
          onClick={next}
          className="inline-flex items-center gap-1.5 text-sm font-medium rounded-full bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 transition-colors"
        >
          <RefreshCw size={14} /> Next round
        </button>
      )}
    </Card>
  );
}

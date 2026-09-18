"use client";

import { useEffect, useState } from "react";
import { RefreshCw, RotateCcw } from "lucide-react";
import Card from "../Card";
import ScoreBadge from "./ScoreBadge";
import { generateRoutineRound, type RoutineRound } from "@/lib/agents/recallAgent";
import type { RoutineStep } from "@/lib/mockData";

export default function RoutineRecallGame() {
  // Randomly generated — must not run during the initial render, or server and
  // client roll different shuffles and React flags a hydration mismatch.
  const [round, setRound] = useState<RoutineRound | null>(null);
  const [picked, setPicked] = useState<RoutineStep[]>([]);
  const [checked, setChecked] = useState<boolean | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  useEffect(() => {
    const t = setTimeout(() => setRound(generateRoutineRound()), 0);
    return () => clearTimeout(t);
  }, []);

  if (!round) {
    return <Card className="min-h-[220px] flex items-center justify-center text-sm text-foreground/40">Loading round…</Card>;
  }
  const activeRound = round;

  const remaining = activeRound.shuffled.filter((s) => !picked.includes(s));

  function pick(step: RoutineStep) {
    if (checked !== null) return;
    setPicked((p) => [...p, step]);
  }

  function reset() {
    setPicked([]);
    setChecked(null);
  }

  function check() {
    const isCorrect = picked.every((s, i) => s === activeRound.correctOrder[i]);
    setChecked(isCorrect);
    setScore((s) => ({ correct: s.correct + (isCorrect ? 1 : 0), total: s.total + 1 }));
  }

  function next() {
    setRound(generateRoutineRound());
    setPicked([]);
    setChecked(null);
  }

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">
          Put the {activeRound.routine} routine in order
        </h3>
        <ScoreBadge score={score} />
      </div>

      <div className="min-h-[52px] rounded-xl bg-surface-muted p-3 flex flex-wrap gap-2">
        {picked.length === 0 && <span className="text-xs text-foreground/40 py-1.5">Tap steps below, in order</span>}
        {picked.map((s, i) => (
          <span
            key={s.label}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium ${
              checked === null
                ? "bg-surface text-foreground/80 border border-border-soft"
                : s === activeRound.correctOrder[i]
                ? "bg-sage-50 dark:bg-sage-900/25 text-sage-700 dark:text-sage-400 border border-sage-200 dark:border-sage-700/40"
                : "bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900"
            }`}
          >
            <span className="text-[10px] font-mono opacity-60">{i + 1}</span>
            {s.label}
          </span>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {remaining.map((s) => (
          <button
            key={s.label}
            onClick={() => pick(s)}
            disabled={checked !== null}
            className="rounded-full bg-brand-50 dark:bg-brand-950/30 text-brand-700 dark:text-brand-400 px-3.5 py-1.5 text-sm font-medium hover:bg-brand-100 dark:hover:bg-brand-900/40 transition-colors disabled:opacity-40"
          >
            {s.label}
          </button>
        ))}
      </div>

      {checked !== null && !checked && (
        <p className="text-xs text-foreground/50">
          Correct order: {activeRound.correctOrder.map((s) => s.label).join(" → ")}
        </p>
      )}

      <div className="flex gap-2">
        {checked === null ? (
          <>
            <button
              onClick={check}
              disabled={picked.length !== activeRound.correctOrder.length}
              className="text-sm font-medium rounded-full bg-brand-600 hover:bg-brand-700 disabled:opacity-40 text-white px-4 py-2 transition-colors"
            >
              Check order
            </button>
            {picked.length > 0 && (
              <button onClick={reset} className="inline-flex items-center gap-1.5 text-sm font-medium rounded-full bg-surface-muted text-foreground/60 px-4 py-2">
                <RotateCcw size={14} /> Reset
              </button>
            )}
          </>
        ) : (
          <button
            onClick={next}
            className="inline-flex items-center gap-1.5 text-sm font-medium rounded-full bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 transition-colors"
          >
            <RefreshCw size={14} /> Next round
          </button>
        )}
      </div>
    </Card>
  );
}

"use client";

import { useEffect, useState } from "react";
import { RefreshCw, RotateCcw } from "lucide-react";
import Card from "../Card";
import ScoreBadge from "./ScoreBadge";
import { generateTimelineRound, type TimelineRound } from "@/lib/agents/recallAgent";
import { formatDate } from "@/lib/visual";

type Event = TimelineRound["shuffled"][number];

export default function TimelineRecallGame() {
  // Randomly generated — must not run during the initial render, or server and
  // client roll different shuffles and React flags a hydration mismatch.
  const [round, setRound] = useState<TimelineRound | null>(null);
  const [picked, setPicked] = useState<Event[]>([]);
  const [checked, setChecked] = useState<boolean | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  useEffect(() => {
    const t = setTimeout(() => setRound(generateTimelineRound()), 0);
    return () => clearTimeout(t);
  }, []);

  if (!round) {
    return <Card className="min-h-[220px] flex items-center justify-center text-sm text-foreground/40">Loading round…</Card>;
  }
  const activeRound = round;

  const remaining = activeRound.shuffled.filter((e) => !picked.includes(e));

  function pick(event: Event) {
    if (checked !== null) return;
    setPicked((p) => [...p, event]);
  }

  function reset() {
    setPicked([]);
    setChecked(null);
  }

  function check() {
    const isCorrect = picked.every((e, i) => e === activeRound.correctOrder[i]);
    setChecked(isCorrect);
    setScore((s) => ({ correct: s.correct + (isCorrect ? 1 : 0), total: s.total + 1 }));
  }

  function next() {
    setRound(generateTimelineRound());
    setPicked([]);
    setChecked(null);
  }

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Which changed first?</h3>
        <ScoreBadge score={score} />
      </div>
      <p className="text-xs text-foreground/50 -mt-2">
        Reconstruct the real order these were first detected in — earliest first.
      </p>

      <div className="min-h-[64px] rounded-xl bg-surface-muted p-3 space-y-1.5">
        {picked.length === 0 && <span className="text-xs text-foreground/40 py-1.5 block">Tap events below, earliest first</span>}
        {picked.map((e, i) => (
          <div
            key={e.summary}
            className={`rounded-lg px-3 py-2 text-sm flex items-start gap-2 ${
              checked === null
                ? "bg-surface border border-border-soft"
                : e === activeRound.correctOrder[i]
                ? "bg-sage-50 dark:bg-sage-900/25 border border-sage-200 dark:border-sage-700/40"
                : "bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900"
            }`}
          >
            <span className="text-[10px] font-mono opacity-60 mt-0.5">{i + 1}</span>
            <div className="flex-1">
              <div className="text-[11px] uppercase tracking-wide text-foreground/40">
                {e.domain} {checked !== null && `· ${formatDate(e.date)}`}
              </div>
              <div className="text-foreground/80">{e.summary}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-1.5">
        {remaining.map((e) => (
          <button
            key={e.summary}
            onClick={() => pick(e)}
            disabled={checked !== null}
            className="w-full text-left rounded-lg bg-brand-50 dark:bg-brand-950/30 text-brand-700 dark:text-brand-400 px-3 py-2 text-sm hover:bg-brand-100 dark:hover:bg-brand-900/40 transition-colors disabled:opacity-40"
          >
            <span className="text-[11px] uppercase tracking-wide opacity-70 mr-2">{e.domain}</span>
            {e.summary}
          </button>
        ))}
      </div>

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

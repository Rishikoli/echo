"use client";

import { useEffect, useState } from "react";
import type { ScenarioResult } from "@/lib/types";
import Card from "./Card";

export default function ScenarioSimulator() {
  const [routineConsistency, setRoutineConsistency] = useState(0.95);
  const [socialInteraction, setSocialInteraction] = useState(0.8);
  const [sleepRegularity, setSleepRegularity] = useState(0.75);
  const [result, setResult] = useState<ScenarioResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const handle = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/simulate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ routineConsistency, socialInteraction, sleepRegularity }),
        });
        const data: ScenarioResult = await res.json();
        if (!cancelled) setResult(data);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [routineConsistency, socialInteraction, sleepRegularity]);

  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/30 px-4 py-3 text-xs font-medium text-amber-800 dark:text-amber-300 tracking-wide uppercase">
        Simulation — not a clinical prediction
      </div>

      <Card className="space-y-5">
        <h2 className="text-sm font-semibold text-foreground">Scenario controls</h2>

        <SliderRow
          label="Routine consistency"
          value={routineConsistency}
          onChange={setRoutineConsistency}
          hint="How closely the daily routine is followed"
        />
        <SliderRow
          label="Social interaction"
          value={socialInteraction}
          onChange={setSocialInteraction}
          hint="Frequency of visits and conversation"
        />
        <SliderRow
          label="Sleep regularity"
          value={sleepRegularity}
          onChange={setSleepRegularity}
          hint="Consistency of sleep and wake times"
        />
      </Card>

      {result && (
        <Card className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">
              Current vs. scenario ({result.horizonDays}-day horizon)
            </h2>
            <span className="text-[11px] rounded-full bg-surface-muted px-2.5 py-1 text-foreground/50">
              {loading ? "Updating…" : `Confidence: ${result.confidence}`}
            </span>
          </div>

          <CompareBar
            label="Routine adherence"
            current={result.current.routineAdherence}
            simulated={result.simulated.routineAdherence}
            unit="%"
            max={100}
          />
          <CompareBar
            label="Modeled confusion events / week"
            current={result.current.confusionEventsPerWeek}
            simulated={result.simulated.confusionEventsPerWeek}
            unit=""
            max={6}
            lowerIsBetter
          />
          <CompareBar
            label="Memory score"
            current={result.current.memoryScore}
            simulated={result.simulated.memoryScore}
            unit=""
            max={100}
          />

          <p className="text-xs text-foreground/50 pt-3 border-t border-border-soft">{result.narrative}</p>
        </Card>
      )}
    </div>
  );
}

function SliderRow({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  hint: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="text-sm font-medium text-foreground/80">{label}</label>
        <span className="text-xs text-foreground/40 tabular-nums">{Math.round(value * 100)}%</span>
      </div>
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-brand-600"
      />
      <p className="text-[11px] text-foreground/40 mt-0.5">{hint}</p>
    </div>
  );
}

function CompareBar({
  label,
  current,
  simulated,
  unit,
  max,
  lowerIsBetter,
}: {
  label: string;
  current: number;
  simulated: number;
  unit: string;
  max: number;
  lowerIsBetter?: boolean;
}) {
  const better = lowerIsBetter ? simulated < current : simulated > current;
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="text-foreground/75">{label}</span>
        <span className="text-xs text-foreground/50 tabular-nums">
          {current}
          {unit} →{" "}
          <span className={better ? "text-sage-700 dark:text-sage-400 font-medium" : "text-foreground/50"}>
            {simulated}
            {unit}
          </span>
        </span>
      </div>
      <div className="relative h-2 rounded-full bg-surface-muted overflow-hidden">
        <div className="absolute inset-y-0 left-0 bg-foreground/25" style={{ width: `${Math.min(100, (current / max) * 100)}%` }} />
        <div
          className={`absolute inset-y-0 left-0 ${better ? "bg-brand-500" : "bg-foreground/40"} opacity-80`}
          style={{ width: `${Math.min(100, (simulated / max) * 100)}%` }}
        />
      </div>
    </div>
  );
}

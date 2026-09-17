"use client";

import { useState } from "react";
import type { InvestigationResult } from "@/lib/types";
import EvidenceList from "./EvidenceList";
import Card from "./Card";

const PRESETS = [
  "What changed?",
  "What changed first?",
  "Has this happened before?",
  "Why was this flagged?",
  "Show evidence",
];

export default function InvestigationPanel() {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<InvestigationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runQuestion(q: string) {
    if (!q.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/investigate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });
      if (!res.ok) throw new Error("Investigation failed.");
      const data: InvestigationResult = await res.json();
      setResult(data);
    } catch {
      setError("Something went wrong running that investigation. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <Card className="p-4">
        <h2 className="text-sm font-semibold text-foreground mb-3">Investigate the Twin</h2>
        <div className="flex flex-wrap gap-2 mb-3">
          {PRESETS.map((p) => (
            <button
              key={p}
              onClick={() => {
                setQuestion(p);
                runQuestion(p);
              }}
              className="rounded-full bg-surface-muted px-3.5 py-1.5 text-xs font-medium text-foreground/70 hover:text-brand-700 dark:hover:text-brand-400 transition-colors"
            >
              {p}
            </button>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            runQuestion(question);
          }}
          className="flex gap-2"
        >
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask the Twin..."
            className="flex-1 rounded-full bg-surface-muted px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-400"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-sm font-medium px-5 py-2.5 transition-colors"
          >
            {loading ? "Investigating…" : "Ask"}
          </button>
        </form>
      </Card>

      {error && (
        <div className="rounded-2xl border border-rose-200/70 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/30 px-4 py-3 text-sm text-rose-800 dark:text-rose-300">
          {error}
        </div>
      )}

      {loading && (
        <Card className="p-4 text-sm text-foreground/50">Analyzing…</Card>
      )}

      {result && (
        <div className="space-y-4">
          <Card className="p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-foreground/40 mb-2">Tool execution trace</h3>
            <ul className="space-y-1">
              {result.toolTrace.map((t, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground/70">
                  <span className="text-sage-600 dark:text-sage-400 mt-0.5">✓</span>
                  <span>
                    <span className="font-mono text-xs text-foreground/40">{t.tool}()</span> {t.summary}
                  </span>
                </li>
              ))}
            </ul>
          </Card>

          <div className="rounded-2xl bg-brand-50 dark:bg-brand-950/25 border border-brand-100 dark:border-brand-900/50 p-5 space-y-4">
            <div>
              <h3 className="text-[11px] font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-400">Finding</h3>
              <p className="font-display text-lg text-foreground mt-1 leading-snug">{result.finding}</p>
            </div>
            <div>
              <h3 className="text-[11px] font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-400">What changed</h3>
              <p className="text-sm text-foreground/75 mt-1">{result.whatChanged}</p>
            </div>
            <div>
              <h3 className="text-[11px] font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-400">When</h3>
              <p className="text-sm text-foreground/75 mt-1">{result.when}</p>
            </div>
            <div>
              <h3 className="text-[11px] font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-400">Historical context</h3>
              <p className="text-sm text-foreground/75 mt-1">{result.historicalContext}</p>
            </div>
            <div className="pt-3 border-t border-brand-200/60 dark:border-brand-900/60">
              <h3 className="text-[11px] font-semibold uppercase tracking-wide text-foreground/40">Uncertainty</h3>
              <p className="text-xs text-foreground/50 mt-1">{result.uncertainty}</p>
            </div>
          </div>

          <Card className="p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-foreground/40 mb-2">Evidence</h3>
            <EvidenceList items={result.evidence} />
          </Card>
        </div>
      )}
    </div>
  );
}

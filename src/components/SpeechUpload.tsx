"use client";

import { useState } from "react";
import { AudioLines, UploadCloud, TriangleAlert } from "lucide-react";
import Card from "./Card";
import { analyzeSpeechFile, type SpeechAnalysisResult } from "@/lib/audioAnalysis";
import { SPEECH_SESSIONS } from "@/lib/mockData";

const baseline = SPEECH_SESSIONS[0];
const latest = SPEECH_SESSIONS[SPEECH_SESSIONS.length - 1];

export default function SpeechUpload() {
  const [fileName, setFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SpeechAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setFileName(file.name);
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const analysis = await analyzeSpeechFile(file);
      setResult(analysis);
    } catch {
      setError("Couldn't decode that file as audio. Try a WAV or MP3 recording.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-400">
          <AudioLines size={17} />
        </span>
        <div>
          <h2 className="text-sm font-semibold text-foreground">Speech sample</h2>
          <p className="text-xs text-foreground/45">Upload a short recording for live acoustic analysis</p>
        </div>
      </div>

      <label className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border-soft py-8 cursor-pointer hover:border-brand-300 transition-colors">
        <UploadCloud size={22} className="text-foreground/35" />
        <span className="text-sm text-foreground/60">{fileName ?? "Click to choose an audio file"}</span>
        <span className="text-[11px] text-foreground/35">WAV, MP3, M4A — analyzed entirely in your browser</span>
        <input
          type="file"
          accept="audio/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </label>

      {loading && <p className="text-sm text-foreground/50">Analyzing audio…</p>}

      {error && (
        <div className="flex items-start gap-2 rounded-xl bg-rose-50 dark:bg-rose-950/30 px-3.5 py-3 text-sm text-rose-700 dark:text-rose-300">
          <TriangleAlert size={15} className="mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-3">
          <div className="rounded-xl bg-amber-50 dark:bg-amber-950/30 px-3.5 py-2.5 text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
            Computed directly from the uploaded audio using the Web Audio API — energy-based voice-activity
            detection, not a transcription or ML speech model. Treat these as a rough acoustic proxy, not
            clinical speech biomarkers.
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Stat label="Duration" value={`${result.durationSec.toFixed(1)}s`} />
            <Stat
              label="Pause ratio"
              value={result.pauseRatio.toFixed(2)}
              hint={`Personal baseline ${baseline.pauseRatio.toFixed(2)} → latest ${latest.pauseRatio.toFixed(2)}`}
            />
            <Stat label="Activity events / min" value={result.activityEventsPerMin.toFixed(1)} />
            <Stat label="Mean energy (RMS)" value={result.meanRms.toFixed(3)} />
          </div>

          <p className="text-xs text-foreground/50">
            {result.pauseRatio > latest.pauseRatio
              ? "This sample's pause ratio is higher than the patient's most recent recorded session."
              : "This sample's pause ratio falls within or below the patient's recently recorded range."}
          </p>
        </div>
      )}
    </Card>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl bg-surface-muted px-3.5 py-2.5">
      <div className="text-[11px] text-foreground/45">{label}</div>
      <div className="text-lg font-semibold text-foreground tabular-nums">{value}</div>
      {hint && <div className="text-[10px] text-foreground/35 mt-0.5">{hint}</div>}
    </div>
  );
}

"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import clsx from "clsx";

interface TimelineScrubberProps {
  labels: string[];
  value: number;
  onChange: (index: number) => void;
  playing: boolean;
  onPlayingChange: (playing: boolean) => void;
  intervalMs?: number;
  /** One color per label, e.g. that month's worst region state — drives the
   * track's gradient and the thumb's current color. Falls back to a flat brand
   * color if omitted. */
  monthColors?: string[];
}

export default function TimelineScrubber({
  labels,
  value,
  onChange,
  playing,
  onPlayingChange,
  intervalMs = 1400,
  monthColors,
}: TimelineScrubberProps) {
  const max = labels.length - 1;
  const trackGradient = monthColors?.length
    ? `linear-gradient(90deg, ${monthColors.map((c, i) => `${c} ${(i / (monthColors.length - 1 || 1)) * 100}%`).join(", ")})`
    : undefined;
  const thumbColor = monthColors?.[value];
  const valueRef = useRef(value);
  const onChangeRef = useRef(onChange);
  const onPlayingChangeRef = useRef(onPlayingChange);

  useEffect(() => {
    valueRef.current = value;
    onChangeRef.current = onChange;
    onPlayingChangeRef.current = onPlayingChange;
  });

  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => {
      const next = valueRef.current + 1;
      if (next > max) {
        onPlayingChangeRef.current(false);
        return;
      }
      onChangeRef.current(next);
      if (next === max) onPlayingChangeRef.current(false);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [playing, intervalMs, max]);

  return (
    <div className="echo-card px-5 py-4">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => onPlayingChange(!playing)}
          aria-label={playing ? "Pause" : "Play"}
          className="shrink-0 h-9 w-9 rounded-full bg-brand-600 hover:bg-brand-700 text-white flex items-center justify-center transition-colors"
        >
          {playing ? <Pause size={15} /> : <Play size={15} className="ml-0.5" />}
        </button>
        <button
          type="button"
          onClick={() => {
            onPlayingChange(false);
            onChange(0);
          }}
          aria-label="Reset to January"
          className="shrink-0 h-9 w-9 rounded-full bg-surface-muted text-foreground/50 hover:text-foreground flex items-center justify-center transition-colors"
        >
          <RotateCcw size={14} />
        </button>

        <div className="flex-1 min-w-0">
          <input
            type="range"
            min={0}
            max={max}
            step={1}
            value={value}
            onChange={(e) => {
              onPlayingChange(false);
              onChange(Number(e.target.value));
            }}
            className="echo-range w-full"
            style={
              {
                "--echo-track-gradient": trackGradient,
                "--echo-thumb-color": thumbColor,
              } as CSSProperties
            }
            aria-label="Month"
          />
          <div className="flex justify-between mt-1 px-0.5">
            {labels.map((label, i) => (
              <button
                key={label}
                onClick={() => {
                  onPlayingChange(false);
                  onChange(i);
                }}
                className={clsx(
                  "text-[11px] font-medium tabular-nums transition-colors",
                  i === value ? "text-brand-700 dark:text-brand-400 font-semibold" : "text-foreground/35 hover:text-foreground/60"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="shrink-0 text-right">
          <div className="text-[10px] uppercase tracking-wide text-foreground/40">As of</div>
          <div className="text-sm font-semibold text-foreground">{labels[value]} 2026</div>
        </div>
      </div>
    </div>
  );
}

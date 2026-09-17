"use client";

import { useId } from "react";

export interface ChartSeries {
  key: string;
  label: string;
  color: string;
  points: { label: string; value: number }[];
}

export interface ChartMarker {
  index: number; // 0-based, aligned to points array
  label: string;
}

interface ProgressionChartProps {
  series: ChartSeries[];
  height?: number;
  min?: number;
  max?: number;
  marker?: ChartMarker | null;
  onPointClick?: (seriesKey: string, index: number) => void;
  showLegend?: boolean;
}

const PAD_LEFT = 34;
const PAD_RIGHT = 12;
const PAD_TOP = 12;
const PAD_BOTTOM = 24;
const WIDTH = 640;

export default function ProgressionChart({
  series,
  height = 240,
  min = 55,
  max = 100,
  marker,
  onPointClick,
  showLegend = true,
}: ProgressionChartProps) {
  const gradId = useId();
  const innerW = WIDTH - PAD_LEFT - PAD_RIGHT;
  const innerH = height - PAD_TOP - PAD_BOTTOM;
  const pointCount = series[0]?.points.length ?? 0;

  const x = (i: number) => PAD_LEFT + (pointCount > 1 ? (i / (pointCount - 1)) * innerW : innerW / 2);
  const y = (v: number) => PAD_TOP + innerH - ((v - min) / (max - min)) * innerH;

  const yTicks = [min, Math.round((min + max) / 2), max];

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${WIDTH} ${height}`} className="w-full h-auto" role="img" aria-label="Progression chart">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.14" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>

        {yTicks.map((t) => (
          <g key={t}>
            <line x1={PAD_LEFT} x2={WIDTH - PAD_RIGHT} y1={y(t)} y2={y(t)} stroke="var(--border-soft)" strokeWidth={1} />
            <text x={PAD_LEFT - 8} y={y(t)} textAnchor="end" dominantBaseline="middle" className="fill-foreground/40 text-[9px]">
              {t}
            </text>
          </g>
        ))}

        {series[0]?.points.map((p, i) => (
          <text key={p.label} x={x(i)} y={height - 6} textAnchor="middle" className="fill-foreground/40 text-[9px]">
            {p.label}
          </text>
        ))}

        {marker != null && (
          <g>
            <line
              x1={x(marker.index)}
              x2={x(marker.index)}
              y1={PAD_TOP}
              y2={PAD_TOP + innerH}
              className="stroke-rose-400"
              strokeDasharray="4 3"
              strokeWidth={1.5}
            />
            <text x={x(marker.index)} y={PAD_TOP - 2} textAnchor="middle" className="fill-rose-600 text-[9px] font-medium">
              {marker.label}
            </text>
          </g>
        )}

        {series.map((s) => {
          const path = s.points.map((p, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(p.value)}`).join(" ");
          const areaPath = `${path} L ${x(s.points.length - 1)} ${y(min)} L ${x(0)} ${y(min)} Z`;
          return (
            <g key={s.key} style={{ color: s.color }}>
              <path d={areaPath} fill={`url(#${gradId})`} />
              <path d={path} fill="none" stroke={s.color} strokeWidth={2.25} strokeLinecap="round" strokeLinejoin="round" />
              {s.points.map((p, i) => (
                <circle
                  key={i}
                  cx={x(i)}
                  cy={y(p.value)}
                  r={3.5}
                  fill={s.color}
                  style={{ stroke: "var(--surface-solid)" }}
                  strokeWidth={1.5}
                  className={onPointClick ? "cursor-pointer" : undefined}
                  onClick={() => onPointClick?.(s.key, i)}
                >
                  <title>{`${s.label} — ${p.label}: ${p.value}`}</title>
                </circle>
              ))}
            </g>
          );
        })}
      </svg>
      {showLegend && (
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 px-1">
          {series.map((s) => (
            <div key={s.key} className="flex items-center gap-1.5 text-xs text-foreground/60">
              <span className="inline-block h-2 w-2 rounded-full" style={{ background: s.color }} />
              {s.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

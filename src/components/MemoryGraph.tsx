"use client";

import clsx from "clsx";
import type { MemoryNode, MemoryEdge, MemoryNodeType } from "@/lib/types";

export const TYPE_COLOR: Record<MemoryNodeType, string> = {
  patient: "#6152be",
  person: "#4a90c9",
  place: "#8b7bdd",
  event: "#e3a63c",
  story: "#c76bb3",
  routine: "#2ba98b",
  object: "#9089b0",
  photo: "#e1636b",
};

const TYPE_RADIUS: Record<MemoryNodeType, number> = {
  patient: 5.2,
  person: 3.6,
  place: 3.2,
  event: 3,
  story: 2.8,
  routine: 3,
  object: 2.6,
  photo: 2.8,
};

interface MemoryGraphProps {
  nodes: MemoryNode[];
  edges: MemoryEdge[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function MemoryGraph({ nodes, edges, selectedId, onSelect }: MemoryGraphProps) {
  const nodeById = new Map(nodes.map((n) => [n.id, n]));
  const connectedIds = selectedId
    ? new Set(edges.filter((e) => e.from === selectedId || e.to === selectedId).flatMap((e) => [e.from, e.to]))
    : null;

  return (
    <svg viewBox="-8 -5 116 110" className="w-full h-full min-h-[420px]" role="img" aria-label="Memory graph">
      <g opacity={0.6}>
        {edges.map((e) => {
          const from = nodeById.get(e.from);
          const to = nodeById.get(e.to);
          if (!from || !to) return null;
          const dim = connectedIds && !(connectedIds.has(e.from) && connectedIds.has(e.to));
          return (
            <line
              key={e.id}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              style={{ stroke: dim ? "var(--border-soft)" : "var(--color-brand-200)" }}
              strokeWidth={dim ? 0.25 : 0.45}
            />
          );
        })}
      </g>
      {nodes.map((n) => {
        const dim = connectedIds && !connectedIds.has(n.id) && n.id !== selectedId;
        const isSelected = n.id === selectedId;
        return (
          <g
            key={n.id}
            onClick={() => onSelect(n.id)}
            className="cursor-pointer"
            opacity={dim ? 0.35 : 1}
          >
            {isSelected && (
              <circle cx={n.x} cy={n.y} r={TYPE_RADIUS[n.type] + 1.8} fill="none" stroke={TYPE_COLOR[n.type]} strokeWidth={0.5} strokeDasharray="1 1" />
            )}
            <circle cx={n.x} cy={n.y} r={TYPE_RADIUS[n.type]} fill={TYPE_COLOR[n.type]} style={{ stroke: "var(--surface-solid)" }} strokeWidth={0.7} />
            <text
              x={n.x}
              y={n.y + TYPE_RADIUS[n.type] + 3.2}
              textAnchor="middle"
              className={clsx("fill-foreground/80", isSelected ? "font-semibold" : "")}
              style={{ fontSize: n.type === "patient" ? "3.1px" : "2.5px" }}
            >
              {n.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

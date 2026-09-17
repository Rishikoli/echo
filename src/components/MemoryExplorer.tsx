"use client";

import { useState } from "react";
import MemoryGraph, { TYPE_COLOR } from "./MemoryGraph";
import ConfidenceBadge from "./ConfidenceBadge";
import Card from "./Card";
import type { MemoryEdge, MemoryNode } from "@/lib/types";

const TYPE_LEGEND: { type: MemoryNode["type"]; label: string }[] = [
  { type: "patient", label: "Patient" },
  { type: "person", label: "Person" },
  { type: "place", label: "Place" },
  { type: "event", label: "Event" },
  { type: "routine", label: "Routine" },
  { type: "story", label: "Story" },
  { type: "photo", label: "Photo" },
];

export default function MemoryExplorer({ nodes, edges }: { nodes: MemoryNode[]; edges: MemoryEdge[] }) {
  const [selectedId, setSelectedId] = useState<string | null>("patient");
  const selected = nodes.find((n) => n.id === selectedId) ?? null;
  const relatedEdges = selectedId ? edges.filter((e) => e.from === selectedId || e.to === selectedId) : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
      <Card className="p-4">
        <div className="flex flex-wrap gap-3 mb-3 px-1">
          {TYPE_LEGEND.map((t) => (
            <div key={t.type} className="flex items-center gap-1.5 text-xs text-foreground/55">
              <span className="inline-block h-2 w-2 rounded-full" style={{ background: TYPE_COLOR[t.type] }} />
              {t.label}
            </div>
          ))}
        </div>
        <MemoryGraph nodes={nodes} edges={edges} selectedId={selectedId} onSelect={setSelectedId} />
      </Card>

      <Card>
        {!selected && <p className="text-sm text-foreground/40">Select a node to see its details and connections.</p>}
        {selected && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold text-foreground">{selected.label}</h2>
                <ConfidenceBadge confidence={selected.confidence} />
              </div>
              {selected.subtitle && <p className="text-xs text-foreground/40 mt-0.5">{selected.subtitle}</p>}
            </div>
            {selected.detail && <p className="text-sm text-foreground/70 leading-relaxed">{selected.detail}</p>}

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-foreground/40 mb-2">Connections</h3>
              <ul className="space-y-1.5">
                {relatedEdges.map((e) => {
                  const otherId = e.from === selectedId ? e.to : e.from;
                  const other = nodes.find((n) => n.id === otherId);
                  if (!other) return null;
                  return (
                    <li key={e.id}>
                      <button
                        onClick={() => setSelectedId(other.id)}
                        className="text-sm text-left w-full rounded-xl bg-surface-muted px-3 py-2 hover:bg-brand-50 dark:hover:bg-brand-950/30 transition-colors"
                      >
                        <span className="text-foreground/45">{e.from === selectedId ? e.label : `${e.label} of`}</span>{" "}
                        <span className="font-medium text-foreground">{other.label}</span>
                      </button>
                    </li>
                  );
                })}
                {relatedEdges.length === 0 && <li className="text-xs text-foreground/40">No connections recorded.</li>}
              </ul>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

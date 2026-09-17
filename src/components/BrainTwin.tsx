"use client";

import { useEffect, useRef } from "react";
import type { BrainRegionState } from "@/lib/types";
import { STATE_COLORS } from "@/lib/visual";

interface BrainTwinProps {
  svgMarkup: string;
  regions: BrainRegionState[];
  selectedKey: string | null;
  onSelect: (key: string) => void;
}

// The interactive SVG (brain-lobes-interactive.svg) ships with a small built-in
// <script> that wires up click handling (data-region lookup, .is-on toggling, a
// `brainpartselect` custom event). That script never runs here: browsers do not
// execute <script> tags inserted via innerHTML / dangerouslySetInnerHTML, for any
// element inserted that way — it's a deliberate security restriction, not a bug in
// the SVG. So we reimplement the same click behavior ourselves below instead of
// relying on it, then overlay a status dot per region — computed from each region's
// real geometry via getBBox()/getCTM() — so the original illustration stays untouched.
export default function BrainTwin({ svgMarkup, regions, selectedKey, onSelect }: BrainTwinProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const svg = container.querySelector<SVGSVGElement>("svg#brain-map");
    if (!svg) return;

    const NS = "http://www.w3.org/2000/svg";
    const existingOverlay = svg.querySelector("#echo-state-overlay");
    if (existingOverlay) existingOverlay.remove();

    const overlay = document.createElementNS(NS, "g");
    overlay.setAttribute("id", "echo-state-overlay");
    overlay.setAttribute("pointer-events", "none");
    svg.appendChild(overlay);

    for (const region of regions) {
      const parts = svg.querySelectorAll<SVGGraphicsElement>(`[data-region="${region.key}"]`);
      if (parts.length === 0) continue;

      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;

      parts.forEach((el) => {
        try {
          const bbox = el.getBBox();
          const ctm = el.getCTM();
          if (!ctm) return;
          const corners = [
            [bbox.x, bbox.y],
            [bbox.x + bbox.width, bbox.y],
            [bbox.x, bbox.y + bbox.height],
            [bbox.x + bbox.width, bbox.y + bbox.height],
          ];
          for (const [x, y] of corners) {
            const pt = new DOMPoint(x, y).matrixTransform(ctm);
            minX = Math.min(minX, pt.x);
            minY = Math.min(minY, pt.y);
            maxX = Math.max(maxX, pt.x);
            maxY = Math.max(maxY, pt.y);
          }
        } catch {
          // getBBox can throw on unrendered elements; skip.
        }
      });

      if (!isFinite(minX)) continue;
      const cx = (minX + maxX) / 2;
      // Bias the dot toward the upper third of the region so it reads as a "pin"
      // rather than sitting mid-mass over dense linework.
      const cy = minY + (maxY - minY) * 0.32;

      const color = STATE_COLORS[region.state];
      const isSelected = selectedKey === region.key;

      if (region.state === "declining" || region.state === "changing") {
        const pulse = document.createElementNS(NS, "circle");
        pulse.setAttribute("cx", String(cx));
        pulse.setAttribute("cy", String(cy));
        pulse.setAttribute("r", "13");
        pulse.setAttribute("fill", color.dot);
        pulse.setAttribute("opacity", "0.35");
        pulse.setAttribute("class", "echo-pulse");
        overlay.appendChild(pulse);
      }

      const dot = document.createElementNS(NS, "circle");
      dot.setAttribute("cx", String(cx));
      dot.setAttribute("cy", String(cy));
      dot.setAttribute("r", isSelected ? "10" : "8");
      dot.setAttribute("fill", color.dot);
      dot.setAttribute("stroke", "#ffffff");
      dot.setAttribute("stroke-width", isSelected ? "3" : "2");
      overlay.appendChild(dot);

      if (isSelected) {
        const ring = document.createElementNS(NS, "circle");
        ring.setAttribute("cx", String(cx));
        ring.setAttribute("cy", String(cy));
        ring.setAttribute("r", "17");
        ring.setAttribute("fill", "none");
        ring.setAttribute("stroke", color.dot);
        ring.setAttribute("stroke-width", "2");
        ring.setAttribute("stroke-dasharray", "3 3");
        overlay.appendChild(ring);
      }
    }

    const handleClick = (e: MouseEvent) => {
      const target = e.target as Element | null;
      const part = target?.closest("[data-region]");
      const region = part?.getAttribute("data-region");
      if (!region) return;

      svg.querySelectorAll(".part.is-on").forEach((p) => p.classList.remove("is-on"));
      svg.setAttribute("data-active", region);
      svg.querySelectorAll(`[data-region="${region}"]`).forEach((p) => p.classList.add("is-on"));

      onSelect(region);
    };
    svg.addEventListener("click", handleClick);
    return () => svg.removeEventListener("click", handleClick);
  }, [regions, selectedKey, onSelect]);

  return (
    <div ref={containerRef} className="echo-brain-twin w-full h-full" dangerouslySetInnerHTML={{ __html: svgMarkup }} />
  );
}

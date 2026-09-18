import { Suspense } from "react";
import { readBrainSvg } from "@/lib/svg";
import BrainExplorer from "@/components/BrainExplorer";

export default function BrainPage() {
  const svg = readBrainSvg();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">Brain Twin</h1>
        <p className="text-sm text-foreground/55 mt-2 max-w-2xl leading-relaxed">
          An interactive visualization of the Digital Twin&rsquo;s state. Drag the timeline below to watch
          it evolve month by month, each state measured against the patient&rsquo;s own personal baseline.
        </p>
      </header>
      <Suspense>
        <BrainExplorer svgMarkup={svg} />
      </Suspense>
    </div>
  );
}

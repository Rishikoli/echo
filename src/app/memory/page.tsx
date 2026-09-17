import { MEMORY_NODES, MEMORY_EDGES } from "@/lib/mockData";
import MemoryExplorer from "@/components/MemoryExplorer";

export default function MemoryPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">Memory Twin</h1>
        <p className="text-sm text-foreground/55 mt-2 max-w-2xl leading-relaxed">
          The Life Twin: people, places, events, routines, and stories that make up the patient&rsquo;s familiar
          world, connected the way a graph database like Neo4j would model them.
        </p>
      </header>
      <MemoryExplorer nodes={MEMORY_NODES} edges={MEMORY_EDGES} />
    </div>
  );
}

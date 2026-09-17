import ScenarioSimulator from "@/components/ScenarioSimulator";

export default function ScenarioPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <header className="mb-6">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">Scenario Twin</h1>
        <p className="text-sm text-foreground/55 mt-2 leading-relaxed">
          Explore modeled &ldquo;what if&rdquo; outcomes based on this patient&rsquo;s own historical relationship
          between routine, engagement, and behavioral measures.
        </p>
      </header>
      <ScenarioSimulator />
    </div>
  );
}

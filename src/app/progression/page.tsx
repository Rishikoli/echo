import { allDomainProgress } from "@/lib/twin";
import { find_first_change, find_similar_period, get_evidence } from "@/lib/tools";
import ProgressionExplorer from "@/components/ProgressionExplorer";

export default function ProgressionPage() {
  const domainProgressList = allDomainProgress();
  const firstChange = find_first_change();
  const similarPeriod = find_similar_period();
  const evidence = get_evidence();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">Progression Explorer</h1>
        <p className="text-sm text-foreground/55 mt-2 max-w-2xl leading-relaxed">
          Every trend line is measured against this patient&rsquo;s own personal baseline, not a population
          average. Select domains and a time range, then trace exactly where a change was first detected.
        </p>
      </header>
      <ProgressionExplorer
        domainProgressList={domainProgressList}
        firstChange={firstChange}
        similarPeriod={similarPeriod}
        evidence={evidence}
      />
    </div>
  );
}

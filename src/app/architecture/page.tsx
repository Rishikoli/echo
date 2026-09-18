import { ArrowRight } from "lucide-react";
import { AGENTS } from "@/lib/agents";
import AgentCard from "@/components/AgentCard";
import Card from "@/components/Card";

const BUILT = AGENTS.filter((a) => a.status === "built").length;
const PARTIAL = AGENTS.filter((a) => a.status === "partial").length;
const PLANNED = AGENTS.filter((a) => a.status === "planned").length;

export default function ArchitecturePage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">Agent Architecture</h1>
        <p className="text-sm text-foreground/55 mt-2 max-w-2xl leading-relaxed">
          ECHO is nine specialized agents, not one model doing everything. Five are pure deterministic
          computation and stay that way even on-device; only the Synthesis Agent generates language, which
          is also the only agent that changes in the on-device build.
        </p>
      </header>

      <div className="flex flex-wrap gap-3">
        <Stat label="Built" value={BUILT} tone="sage" />
        <Stat label="Partially built" value={PARTIAL} tone="amber" />
        <Stat label="Planned for Round 2" value={PLANNED} tone="neutral" />
      </div>

      <Card className="overflow-x-auto">
        <h2 className="text-sm font-semibold text-foreground mb-4">Pipeline</h2>
        <div className="flex items-center gap-2 min-w-max text-xs font-medium">
          <Pill>Question</Pill>
          <ArrowRight size={14} className="text-foreground/30 shrink-0" />
          <Pill accent>Router Agent</Pill>
          <ArrowRight size={14} className="text-foreground/30 shrink-0" />
          <div className="flex flex-col gap-1.5">
            <Pill>Progression</Pill>
            <Pill>Evidence</Pill>
            <Pill>Memory</Pill>
            <Pill>Scenario</Pill>
          </div>
          <ArrowRight size={14} className="text-foreground/30 shrink-0" />
          <Pill accent>Synthesis Agent</Pill>
          <ArrowRight size={14} className="text-foreground/30 shrink-0" />
          <Pill>Answer</Pill>
        </div>
        <p className="text-[11px] text-foreground/40 mt-4">
          Speech, Vision, and Monitoring agents run outside this question-answering pipeline — Speech and
          Vision are input-side (voice/camera capture), Monitoring runs continuously against Twin state
          rather than in response to a question.
        </p>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {AGENTS.map((agent) => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </div>
    </div>
  );
}

function Pill({ children, accent }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <div
      className={
        accent
          ? "rounded-full bg-brand-600 text-white px-3 py-1.5 whitespace-nowrap"
          : "rounded-full bg-surface-muted text-foreground/70 px-3 py-1.5 whitespace-nowrap"
      }
    >
      {children}
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: "sage" | "amber" | "neutral" }) {
  const toneClass =
    tone === "sage"
      ? "text-sage-700 dark:text-sage-400"
      : tone === "amber"
      ? "text-amber-700 dark:text-amber-400"
      : "text-foreground/60";
  return (
    <div className="echo-card px-4 py-3">
      <div className={`font-display text-2xl font-semibold tabular-nums ${toneClass}`}>{value}</div>
      <div className="text-[11px] text-foreground/45">{label}</div>
    </div>
  );
}

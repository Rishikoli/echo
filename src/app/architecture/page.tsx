import { ArrowRight } from "lucide-react";
import { AGENTS } from "@/lib/agents";
import AgentCard from "@/components/AgentCard";
import Card from "@/components/Card";

const BUILT = AGENTS.filter((a) => a.status === "built").length;
const PARTIAL = AGENTS.filter((a) => a.status === "partial").length;
const PLANNED = AGENTS.filter((a) => a.status === "planned").length;
const DETERMINISTIC = AGENTS.filter((a) => a.deterministic).length;

export default function ArchitecturePage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">Agent Architecture</h1>
        <p className="text-sm text-foreground/55 mt-2 max-w-2xl leading-relaxed">
          ECHO is {AGENTS.length} specialized agents, not one model doing everything. {DETERMINISTIC} are pure
          deterministic computation and stay that way even on-device; only the Synthesis Agent generates
          language, which is also the only agent that changes in the on-device build.
        </p>
      </header>

      <div className="flex flex-wrap gap-3">
        <Stat label="Built" value={BUILT} tone="sage" />
        <Stat label="Partially built" value={PARTIAL} tone="amber" />
        <Stat label="Planned" value={PLANNED} tone="neutral" />
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
          Speech, Vision, Monitoring, and Recall agents run outside this question-answering pipeline —
          Speech and Vision are input-side (voice/camera capture), Monitoring runs continuously against
          Twin state rather than in response to a question, and Recall generates its own game rounds
          on demand at <code>/recall</code> rather than answering an investigation question.
        </p>
      </Card>

      <Card className="p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-sm font-semibold text-foreground mb-1.5">On-device LLM</h2>
            <p className="text-xs text-foreground/55 max-w-xl leading-relaxed">
              The Synthesis Agent is the only agent that calls a model at all — and the only one that
              changes on-device. Everything upstream of it (Router, Progression, Evidence, Memory,
              Scenario) stays deterministic on the phone, exactly as it runs today.
            </p>
          </div>
          <GemmaBadge />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
          <div className="rounded-xl bg-surface-muted px-4 py-3">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-foreground/40 mb-1">Primary</div>
            <div className="text-xs text-foreground/70 leading-relaxed">
              Gemma 3n, E2B variant, INT4 quantization — served on-device via the MediaPipe LLM
              Inference API.
            </div>
          </div>
          <div className="rounded-xl bg-surface-muted px-4 py-3">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-foreground/40 mb-1">Fallback</div>
            <div className="text-xs text-foreground/70 leading-relaxed">
              Gemma 3 4B, GGUF, Q4_K_M — served via llama.cpp if MediaPipe/E2B isn&rsquo;t viable on a
              given device.
            </div>
          </div>
        </div>
        <p className="text-[11px] text-foreground/40 mt-4">
          Full reasoning, including why an ~8B/INT8 model was rejected, is in{" "}
          <code>docs/ON_DEVICE_ARCHITECTURE.md</code>. Not yet running in this web prototype — the
          Android reference implementation is in <code>android-reference/</code>, not yet compiled or
          tested on real hardware.
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

// A text-based wordmark, not a reproduction of Google's actual Gemma logo mark —
// this project has no license to reuse that asset, so it gets ECHO's own styling.
function GemmaBadge() {
  return (
    <div className="shrink-0 flex items-center gap-2.5 rounded-full bg-brand-600 text-white pl-2 pr-4 py-1.5">
      <span className="h-6 w-6 rounded-full bg-white/15 flex items-center justify-center">
        <span className="h-2.5 w-2.5 rounded-full bg-white" />
      </span>
      <div className="leading-tight">
        <div className="text-[12.5px] font-bold tracking-tight">Gemma 3n</div>
        <div className="text-[9px] uppercase tracking-wide text-white/70">On-device · E2B · INT4</div>
      </div>
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

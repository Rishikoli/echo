import clsx from "clsx";
import { Cpu, Sigma } from "lucide-react";
import type { AgentSpec } from "@/lib/agents/types";
import { STATUS_LABEL } from "@/lib/agents/types";
import Card from "./Card";

const STATUS_STYLE: Record<AgentSpec["status"], string> = {
  built: "bg-sage-50 dark:bg-sage-900/20 text-sage-700 dark:text-sage-400 border-sage-100 dark:border-sage-700/40",
  partial: "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200/70 dark:border-amber-900",
  planned: "bg-surface-muted text-foreground/50 border-border-soft",
};

export default function AgentCard({ agent }: { agent: AgentSpec }) {
  return (
    <Card className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-base font-semibold text-foreground">{agent.name}</h3>
          <p className="text-xs text-foreground/55 mt-0.5">{agent.role}</p>
        </div>
        <span
          className={clsx(
            "shrink-0 inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium whitespace-nowrap",
            STATUS_STYLE[agent.status]
          )}
        >
          {STATUS_LABEL[agent.status]}
        </span>
      </div>

      <div className="flex items-center gap-1.5 text-[11px] text-foreground/40">
        {agent.deterministic ? <Sigma size={12} /> : <Cpu size={12} />}
        {agent.deterministic ? "Deterministic — no model involved" : "Model-backed"}
      </div>

      <ul className="space-y-1">
        {agent.responsibilities.map((r) => (
          <li key={r} className="text-sm text-foreground/70 flex gap-2">
            <span className="text-brand-400 mt-1.5 h-1 w-1 rounded-full bg-brand-400 shrink-0" />
            {r}
          </li>
        ))}
      </ul>

      <div className="grid grid-cols-1 gap-2 text-xs pt-3 border-t border-border-soft">
        <div>
          <span className="text-foreground/40">Today: </span>
          <span className="text-foreground/70">{agent.today}</span>
        </div>
        <div>
          <span className="text-foreground/40">Planned: </span>
          <span className="text-foreground/70">{agent.planned}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-[11px]">
        <div className="rounded-lg bg-surface-muted px-2.5 py-2">
          <div className="text-foreground/40 mb-0.5">Inputs</div>
          <div className="text-foreground/65">{agent.inputs}</div>
        </div>
        <div className="rounded-lg bg-surface-muted px-2.5 py-2">
          <div className="text-foreground/40 mb-0.5">Outputs</div>
          <div className="text-foreground/65">{agent.outputs}</div>
        </div>
      </div>
    </Card>
  );
}

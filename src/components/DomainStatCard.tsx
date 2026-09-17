import { History, MessageCircle, Target, Compass, Eye, Zap, Activity, CalendarClock, type LucideIcon } from "lucide-react";
import { STATE_COLORS, trendArrow } from "@/lib/visual";
import type { RegionVisualState, Trend } from "@/lib/types";

const DOMAIN_ICON: Record<string, LucideIcon> = {
  memory: History,
  language: MessageCircle,
  executive: Target,
  spatial: Compass,
  attention: Eye,
  processingSpeed: Zap,
  function: Activity,
  routine: CalendarClock,
};

interface DomainStatCardProps {
  domain: string;
  label: string;
  value: number;
  trend: Trend;
  state: RegionVisualState;
  align?: "left" | "right";
}

export default function DomainStatCard({ domain, label, value, trend, state, align = "left" }: DomainStatCardProps) {
  const Icon = DOMAIN_ICON[domain] ?? Activity;
  const c = STATE_COLORS[state];

  return (
    <div className={`echo-card flex items-center gap-3 px-4 py-3 ${align === "right" ? "flex-row-reverse text-right" : ""}`}>
      <span className="shrink-0 flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${c.dot}1f`, color: c.dot }}>
        <Icon size={18} strokeWidth={2} />
      </span>
      <div className="min-w-0">
        <div className="text-xs text-foreground/50">{label}</div>
        <div className="flex items-center gap-1.5" style={align === "right" ? { justifyContent: "flex-end" } : undefined}>
          <span className="text-sm font-semibold text-foreground tabular-nums">
            {trendArrow(trend)} {Math.abs(value)}
          </span>
          <span className={`text-[11px] font-medium ${c.text}`}>{c.label}</span>
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";
import { Bell } from "lucide-react";
import { PATIENT, CAREGIVER_OBSERVATIONS } from "@/lib/mockData";
import { allDomainProgress, brainTwinState, domainLabels } from "@/lib/twin";
import { find_first_change } from "@/lib/tools";
import { readBrainSvg } from "@/lib/svg";
import { formatDate, DOMAIN_COLORS } from "@/lib/visual";
import BrainTwinPreview from "@/components/BrainTwinPreview";
import ProgressionChart from "@/components/ProgressionChart";
import DeviationTimeline from "@/components/DeviationTimeline";
import DomainStatCard from "@/components/DomainStatCard";
import Card from "@/components/Card";

const initials = PATIENT.name
  .split(" ")
  .map((p) => p[0])
  .join("")
  .slice(0, 2);

export default function DashboardPage() {
  const domains = allDomainProgress();
  const byKey = Object.fromEntries(domains.map((d) => [d.domain, d]));
  const leftDomains = ["memory", "language", "function", "routine"];
  const rightDomains = ["executive", "spatial", "attention", "processingSpeed"];
  const meaningfulChanges = domains.filter((d) => d.trend === "declining");
  const regions = brainTwinState();
  const svg = readBrainSvg();
  const events = find_first_change().slice(0, 4);
  const lastObservation = CAREGIVER_OBSERVATIONS[CAREGIVER_OBSERVATIONS.length - 1].date;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-brand-600 dark:text-brand-400 mb-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75 echo-pulse" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-500" />
            </span>
            ECHO · Cognitive Digital Twin
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            {PATIENT.name}&rsquo;s update
          </h1>
          <p className="text-sm text-foreground/50 mt-1.5">
            Last synced {formatDate(lastObservation)} · {PATIENT.age} years old · {PATIENT.condition}
          </p>
          <Link
            href="/investigate"
            className="inline-flex items-center mt-4 text-sm font-medium rounded-full bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 shadow-lg shadow-brand-900/15 transition-colors"
          >
            Investigate the Twin
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Notifications"
            className="relative echo-card h-11 w-11 flex items-center justify-center text-foreground/60 hover:text-brand-600 transition-colors"
          >
            <Bell size={18} />
            {meaningfulChanges.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-rose-500 text-white text-[10px] font-semibold">
                {meaningfulChanges.length}
              </span>
            )}
          </button>
          <div className="h-11 w-11 rounded-full bg-gradient-to-br from-blush-300 to-brand-400 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-brand-900/15">
            {initials}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr_260px] gap-5 items-center">
        <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 order-2 lg:order-1">
          {leftDomains.map((key) => {
            const d = byKey[key];
            return (
              <DomainStatCard
                key={key}
                domain={key}
                label={domainLabels[key as keyof typeof domainLabels] ?? key}
                value={d.change}
                trend={d.trend}
                state={Math.abs(d.change) < 3 ? "stable" : Math.abs(d.change) < 9 ? "changing" : "declining"}
              />
            );
          })}
        </div>

        <div className="relative order-1 lg:order-2 flex items-center justify-center py-6">
          <div
            aria-hidden
            className="absolute h-[70%] w-[70%] rounded-full opacity-60 blur-3xl"
            style={{ background: "radial-gradient(circle, var(--color-brand-200), transparent 70%)" }}
          />
          <div aria-hidden className="absolute top-4 left-6 h-4 w-4 rounded-full bg-blush-300/70 blur-[1px] echo-float" style={{ animationDelay: "0.3s" }} />
          <div aria-hidden className="absolute bottom-10 right-8 h-6 w-6 rounded-full bg-sage-100 blur-[1px] echo-float" style={{ animationDelay: "1.1s" }} />
          <div aria-hidden className="absolute top-1/3 right-2 h-3 w-3 rounded-full bg-brand-200 blur-[1px] echo-float" style={{ animationDelay: "2s" }} />
          <div className="relative w-full max-w-xs echo-float">
            <BrainTwinPreview svgMarkup={svg} regions={regions} />
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 order-3">
          {rightDomains.map((key) => {
            const d = byKey[key];
            return (
              <DomainStatCard
                key={key}
                domain={key}
                label={domainLabels[key as keyof typeof domainLabels] ?? key}
                value={d.change}
                trend={d.trend}
                state={Math.abs(d.change) < 3 ? "stable" : Math.abs(d.change) < 9 ? "changing" : "declining"}
                align="right"
              />
            );
          })}
        </div>
      </div>

      <div className="text-center -mt-2">
        <Link href="/brain" className="text-xs text-brand-600 dark:text-brand-400 font-medium hover:underline">
          Open Brain Twin →
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <Card>
          <h2 className="text-sm font-semibold text-foreground mb-4">Recent timeline (6 months)</h2>
          <ProgressionChart
            series={[
              { key: "memory", label: "Memory", color: DOMAIN_COLORS.memory, points: domains.find((d) => d.domain === "memory")!.series },
              { key: "language", label: "Speech / Language", color: DOMAIN_COLORS.language, points: domains.find((d) => d.domain === "language")!.series },
              { key: "routine", label: "Routine", color: DOMAIN_COLORS.routine, points: domains.find((d) => d.domain === "routine")!.series },
            ]}
          />
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-foreground mb-4">Meaningful changes</h2>
          <ul className="space-y-2.5">
            {meaningfulChanges.length === 0 && <li className="text-sm text-foreground/40">No meaningful changes detected.</li>}
            {meaningfulChanges.map((d) => (
              <li key={d.domain} className="flex items-center justify-between text-sm">
                <span className="capitalize text-foreground/75">{domainLabels[d.domain as keyof typeof domainLabels] ?? d.domain}</span>
                <span className="text-rose-600 dark:text-rose-400 font-medium tabular-nums">↓ {Math.abs(d.change)}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-semibold text-foreground">What changed first?</h2>
          <span className="text-xs text-foreground/40">Earliest: {formatDate(events[0].date)}</span>
        </div>
        <DeviationTimeline events={events} />
      </Card>
    </div>
  );
}

// MONITORING AGENT — new in this round.
// Watches the Twin's computed state and decides what counts as "meaningful" enough
// to surface proactively, rather than waiting for a caregiver to go looking for it.
// This formalizes logic that previously lived inline in the dashboard page (a plain
// array filter) into an agent with its own name and a real notification side effect.
//
// Round 1: a genuine browser Notification, permission-gated and user-gesture
// triggered (the bell button) — not a cosmetic badge with no function behind it.
// Round 2: identical detection logic; the notification call becomes a native
// Android notification from a background-scheduled check instead of a foreground
// browser API call.

import { allDomainProgress, domainLabels } from "../twin";
import type { DomainProgress } from "../twin";

export interface MeaningfulChange {
  domain: string;
  label: string;
  change: number;
}

export function detectMeaningfulChanges(asOfIndex?: number): MeaningfulChange[] {
  const domains: DomainProgress[] = allDomainProgress(asOfIndex);
  return domains
    .filter((d) => d.trend === "declining")
    .map((d) => ({
      domain: d.domain,
      label: domainLabels[d.domain as keyof typeof domainLabels] ?? d.domain,
      change: d.change,
    }));
}

export type NotificationOutcome = "sent" | "denied" | "unsupported";

/**
 * Requests notification permission if needed (must be called from a user gesture —
 * most browsers refuse silent permission prompts) and shows a real OS-level
 * notification summarizing the current meaningful changes. Safe to call from a
 * server-rendered page's client-side event handler; does nothing during SSR.
 */
export async function sendChangeNotification(changes: MeaningfulChange[]): Promise<NotificationOutcome> {
  if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";

  let permission = Notification.permission;
  if (permission === "default") {
    permission = await Notification.requestPermission();
  }
  if (permission !== "granted") return "denied";

  const title = changes.length ? "ECHO — meaningful change detected" : "ECHO — no meaningful change";
  const body = changes.length
    ? `${changes.length} domain${changes.length > 1 ? "s" : ""} declining: ${changes.map((c) => c.label).join(", ")}.`
    : "All tracked domains are within personal baseline range.";

  new Notification(title, { body, tag: "echo-meaningful-change" });
  return "sent";
}

"use client";

import { useState } from "react";
import { Bell, Check, BellOff } from "lucide-react";
import { sendChangeNotification, type MeaningfulChange, type NotificationOutcome } from "@/lib/agents/monitoringAgent";

// Monitoring Agent, wired to a real browser notification. Deliberately triggered by
// a click (a user gesture) rather than firing automatically on page load — most
// browsers refuse silent permission prompts, and an unprompted notification on
// mount would be worse UX than a bell you press.
export default function NotificationBell({ changes }: { changes: MeaningfulChange[] }) {
  const [outcome, setOutcome] = useState<NotificationOutcome | null>(null);

  async function handleClick() {
    const result = await sendChangeNotification(changes);
    setOutcome(result);
    if (result === "sent") setTimeout(() => setOutcome(null), 2500);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Send a notification summarizing meaningful changes"
      title="Send a real notification for today's meaningful changes"
      className="relative echo-card h-11 w-11 flex items-center justify-center text-foreground/60 hover:text-brand-600 transition-colors"
    >
      {outcome === "sent" ? <Check size={18} className="text-sage-600" /> : outcome === "denied" ? <BellOff size={18} /> : <Bell size={18} />}
      {changes.length > 0 && !outcome && (
        <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-rose-500 text-white text-[10px] font-semibold">
          {changes.length}
        </span>
      )}
    </button>
  );
}

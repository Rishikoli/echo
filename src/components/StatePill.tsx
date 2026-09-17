import clsx from "clsx";
import type { RegionVisualState } from "@/lib/types";
import { STATE_COLORS } from "@/lib/visual";

export default function StatePill({ state }: { state: RegionVisualState }) {
  const c = STATE_COLORS[state];
  return (
    <span className={clsx("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium", c.bg, c.text, c.border)}>
      <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: c.dot }} />
      {c.label}
    </span>
  );
}

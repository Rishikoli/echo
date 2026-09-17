import clsx from "clsx";
import { confidenceLabel, confidenceColor } from "@/lib/visual";

export default function ConfidenceBadge({ confidence }: { confidence: number }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium",
        confidenceColor(confidence)
      )}
    >
      {confidenceLabel(confidence)} confidence
    </span>
  );
}

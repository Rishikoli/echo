"use client";

import { useRouter } from "next/navigation";
import BrainTwin from "./BrainTwin";
import type { BrainRegionState } from "@/lib/types";

export default function BrainTwinPreview({ svgMarkup, regions }: { svgMarkup: string; regions: BrainRegionState[] }) {
  const router = useRouter();
  return (
    <div className="cursor-pointer">
      <BrainTwin svgMarkup={svgMarkup} regions={regions} selectedKey={null} onSelect={(key) => router.push(`/brain?region=${key}`)} />
    </div>
  );
}

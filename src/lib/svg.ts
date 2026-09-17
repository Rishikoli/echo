import fs from "fs";
import path from "path";

let cached: string | null = null;

export function readBrainSvg(): string {
  if (cached) return cached;
  const filePath = path.join(process.cwd(), "public", "brain-lobes-interactive.svg");
  cached = fs.readFileSync(filePath, "utf-8");
  return cached;
}

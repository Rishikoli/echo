import { NextResponse } from "next/server";
import { simulate_scenario } from "@/lib/tools";
import type { ScenarioVariables } from "@/lib/types";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const variables: Partial<ScenarioVariables> = {
    routineConsistency: typeof body.routineConsistency === "number" ? body.routineConsistency : undefined,
    socialInteraction: typeof body.socialInteraction === "number" ? body.socialInteraction : undefined,
    sleepRegularity: typeof body.sleepRegularity === "number" ? body.sleepRegularity : undefined,
  };
  const result = simulate_scenario(variables);
  return NextResponse.json(result);
}

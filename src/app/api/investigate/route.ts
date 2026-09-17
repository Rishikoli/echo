import { NextResponse } from "next/server";
import { investigate } from "@/lib/gemini";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const question = typeof body.question === "string" ? body.question.trim() : "";
  if (!question) {
    return NextResponse.json({ error: "A question is required." }, { status: 400 });
  }
  const result = await investigate(question);
  return NextResponse.json(result);
}

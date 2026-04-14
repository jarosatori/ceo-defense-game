import { NextRequest, NextResponse } from "next/server";
import { updateSubscriber } from "@/lib/mailerlite";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email, profile, waves, score } = body;

  if (!email) {
    return NextResponse.json({ error: "Missing email" }, { status: 400 });
  }

  const success = await updateSubscriber(email, {
    ceo_profile: profile || "",
    waves_survived: String(waves || 0),
    ceo_defense_score: String(score || 0),
  });

  if (!success) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

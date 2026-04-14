import { NextRequest, NextResponse } from "next/server";
import { addSubscriber } from "@/lib/mailerlite";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email, name } = body;

  if (!email || typeof email !== "string" || !email.includes("@")) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  // Skip MailerLite if not configured (allows testing without env vars)
  if (!process.env.MAILERLITE_API_KEY) {
    return NextResponse.json({ ok: true });
  }

  const success = await addSubscriber({ email, name });

  if (!success) {
    return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
